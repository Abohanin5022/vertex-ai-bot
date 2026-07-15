import { NextRequest, NextResponse } from "next/server";
import {
  ProductsNotConfiguredError,
  deleteProduct,
  updateProduct,
  validateProductInput,
} from "@/lib/products";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  try {
    const input = validateProductInput(body);
    const product = await updateProduct(id, input);
    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof ProductsNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    const message = error instanceof Error ? error.message : "طلب غير صالح.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    await deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ProductsNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    const message = error instanceof Error ? error.message : "تعذر حذف المنتج.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
