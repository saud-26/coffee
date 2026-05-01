import { CMS_RESOURCES, isCmsResourceName } from "@/lib/cms";
import { validateCmsPayload } from "@/lib/cms-validation";
import { requireAdmin } from "@/lib/server-auth";

type CmsRouteContext = {
  params: Promise<{ resource: string }>;
};

export async function GET(_request: Request, context: CmsRouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { resource } = await context.params;
  if (!isCmsResourceName(resource)) {
    return Response.json({ error: "Unknown CMS resource." }, { status: 404 });
  }

  const config = CMS_RESOURCES[resource];
  const { data, error } = await admin.supabase
    .from(resource)
    .select("*")
    .order(config.orderBy ?? "created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ records: data ?? [] });
}

export async function POST(request: Request, context: CmsRouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { resource } = await context.params;
  if (!isCmsResourceName(resource)) {
    return Response.json({ error: "Unknown CMS resource." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateCmsPayload(resource, body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from(resource)
    .insert(validated.payload)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ record: data }, { status: 201 });
}
