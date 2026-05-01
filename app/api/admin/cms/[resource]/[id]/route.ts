import { isCmsResourceName } from "@/lib/cms";
import { validateCmsPayload } from "@/lib/cms-validation";
import { requireAdmin } from "@/lib/server-auth";

type CmsRecordRouteContext = {
  params: Promise<{ resource: string; id: string }>;
};

export async function PATCH(request: Request, context: CmsRecordRouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { resource, id } = await context.params;
  if (!isCmsResourceName(resource)) {
    return Response.json({ error: "Unknown CMS resource." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateCmsPayload(resource, body, true);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from(resource)
    .update(validated.payload)
    .eq("id", id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ record: data });
}

export async function DELETE(_request: Request, context: CmsRecordRouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { resource, id } = await context.params;
  if (!isCmsResourceName(resource)) {
    return Response.json({ error: "Unknown CMS resource." }, { status: 404 });
  }

  const { error } = await admin.supabase.from(resource).delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
