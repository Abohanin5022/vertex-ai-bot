import { createSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";
import { recordFetchMetric } from "@/lib/metrics-store";

export type Product = {
  id: string | number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
};

export const DEFAULT_CATEGORY = "عام";

const fallbackProducts: Product[] = [
  {
    id: "sample-1",
    name: "علب تغليف فاخرة",
    description: "علب صلبة للمتاجر والمطاعم مع مساحة للشعار.",
    price: 18,
    stock: 64,
    category: "علب",
  },
  {
    id: "sample-2",
    name: "أكياس شحن مبطنة",
    description: "أكياس مقاومة للرطوبة مناسبة للطلبات اليومية.",
    price: 7,
    stock: 18,
    category: "أكياس",
  },
  {
    id: "sample-3",
    name: "كراتين مموجة",
    description: "كراتين متعددة المقاسات للتخزين والشحن.",
    price: 12,
    stock: 42,
    category: "كراتين",
  },
  {
    id: "sample-4",
    name: "ملصقات حرارية",
    description: "ملصقات باركود وفواتير للشحن السريع.",
    price: 4,
    stock: 12,
    category: "ملصقات",
  },
];

function timeoutAfter(milliseconds: number) {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error("Supabase request timed out."));
    }, milliseconds);
  });
}

function normalizeProduct(product: Record<string, unknown>): Product {
  return {
    id: String(product.id ?? product.name ?? "unknown-product"),
    name: String(product.name ?? "منتج بدون اسم"),
    description: String(product.description ?? "لا يوجد وصف متاح."),
    price: Number(product.price ?? 0),
    stock: Number(product.stock ?? 0),
    category:
      typeof product.category === "string" && product.category.trim()
        ? product.category.trim()
        : DEFAULT_CATEGORY,
  };
}

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
};

export class ProductsNotConfiguredError extends Error {}

export function validateProductInput(input: unknown): ProductInput {
  const value = (input ?? {}) as Record<string, unknown>;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const description =
    typeof value.description === "string" ? value.description.trim() : "";
  const category =
    typeof value.category === "string" && value.category.trim()
      ? value.category.trim()
      : DEFAULT_CATEGORY;
  const price = Number(value.price);
  const stock = Number(value.stock);

  if (!name) {
    throw new Error("اسم المنتج مطلوب.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("السعر يجب أن يكون رقمًا صالحًا وغير سالب.");
  }

  if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
    throw new Error("المخزون يجب أن يكون رقمًا صحيحًا وغير سالب.");
  }

  return { name, description, price, stock, category };
}

export async function createProduct(input: ProductInput): Promise<Product> {
  if (!hasSupabaseConfig()) {
    throw new ProductsNotConfiguredError(
      "لا يمكن إضافة منتجات قبل ربط Supabase."
    );
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select("id,name,description,price,stock,category")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "تعذر إضافة المنتج.");
  }

  return normalizeProduct(data);
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product> {
  if (!hasSupabaseConfig()) {
    throw new ProductsNotConfiguredError(
      "لا يمكن تعديل منتجات قبل ربط Supabase."
    );
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select("id,name,description,price,stock,category")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "تعذر تعديل المنتج.");
  }

  return normalizeProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  if (!hasSupabaseConfig()) {
    throw new ProductsNotConfiguredError(
      "لا يمكن حذف منتجات قبل ربط Supabase."
    );
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw new Error(error.message || "تعذر حذف المنتج.");
  }
}

export async function getProducts(): Promise<Product[]> {
  const startedAt = performance.now();

  if (!hasSupabaseConfig()) {
    recordFetchMetric({
      durationMs: performance.now() - startedAt,
      source: "fallback",
    });
    return fallbackProducts;
  }

  const supabase = createSupabaseClient();

  try {
    const { data, error } = await Promise.race([
      supabase
        .from("products")
        .select("id,name,description,price,stock,category")
        .order("name", { ascending: true }),
      timeoutAfter(2500),
    ]);

    if (error || !data) {
      if (error) {
        console.error("Supabase products query failed:", error.message);
      }
      recordFetchMetric({
        durationMs: performance.now() - startedAt,
        source: "fallback",
      });
      return fallbackProducts;
    }

    recordFetchMetric({
      durationMs: performance.now() - startedAt,
      source: "supabase",
    });
    return data.map((product) => normalizeProduct(product));
  } catch (error) {
    console.error(
      "Supabase products request failed:",
      error instanceof Error ? error.message : error,
    );
    recordFetchMetric({
      durationMs: performance.now() - startedAt,
      source: "fallback",
    });
    return fallbackProducts;
  }
}
