import { createSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";

export type Product = {
  id: string | number;
  name: string;
  description: string;
  price: number;
  stock: number;
};

const fallbackProducts: Product[] = [
  {
    id: "sample-1",
    name: "علب تغليف فاخرة",
    description: "علب صلبة للمتاجر والمطاعم مع مساحة للشعار.",
    price: 18,
    stock: 64,
  },
  {
    id: "sample-2",
    name: "أكياس شحن مبطنة",
    description: "أكياس مقاومة للرطوبة مناسبة للطلبات اليومية.",
    price: 7,
    stock: 18,
  },
  {
    id: "sample-3",
    name: "كراتين مموجة",
    description: "كراتين متعددة المقاسات للتخزين والشحن.",
    price: 12,
    stock: 42,
  },
  {
    id: "sample-4",
    name: "ملصقات حرارية",
    description: "ملصقات باركود وفواتير للشحن السريع.",
    price: 4,
    stock: 12,
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
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabaseConfig()) {
    return fallbackProducts;
  }

  const supabase = createSupabaseClient();

  try {
    const { data, error } = await Promise.race([
      supabase
        .from("products")
        .select("id,name,description,price,stock")
        .order("name", { ascending: true }),
      timeoutAfter(2500),
    ]);

    if (error || !data) {
      return fallbackProducts;
    }

    return data.map((product) => normalizeProduct(product));
  } catch {
    return fallbackProducts;
  }
}
