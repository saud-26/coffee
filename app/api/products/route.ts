import { validateProductPayload } from "@/lib/product-validation";
import { requireAdmin } from "@/lib/server-auth";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateProductPayload(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("coffees")
    .insert(validated.payload)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ product: data }, { status: 201 });
}
