import { validateProductPayload } from "@/lib/product-validation";
import { requireAdmin } from "@/lib/server-auth";

type ProductRouteContext = {
  params: Promise<{ id: string }>;
};

async function updateProduct(request: Request, context: ProductRouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { id } = await context.params;
  if (!id) return Response.json({ error: "Product id is required." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateProductPayload(body, true);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("coffees")
    .update(validated.payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ product: data });
}

export async function PUT(request: Request, context: ProductRouteContext) {
  return updateProduct(request, context);
}

export async function PATCH(request: Request, context: ProductRouteContext) {
  return updateProduct(request, context);
}

export async function DELETE(_request: Request, context: ProductRouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { id } = await context.params;
  if (!id) return Response.json({ error: "Product id is required." }, { status: 400 });

  const { error } = await admin.supabase.from("coffees").delete().eq("id", id);
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ ok: true });
}
