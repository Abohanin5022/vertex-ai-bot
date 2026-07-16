import { NextRequest, NextResponse } from "next/server";
import {
  ProductsNotConfiguredError,
  createProduct,
  validateProductInput,
} from "@/lib/products";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  try {
    const input = validateProductInput(body);
    const product = await createProduct(input);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof ProductsNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    const message = error instanceof Error ? error.message : "طلب غير صالح.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
