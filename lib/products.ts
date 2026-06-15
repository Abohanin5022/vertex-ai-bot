import {
  createSupabaseAdminClient,
  createSupabaseClient,
  hasSupabaseAdminConfig,
  hasSupabaseConfig,
} from "@/lib/supabase";

export type Product = {
  id: string | number;
  name: string;
  description: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  weightKg: number;
  shippingProfile: string;
  imageUrl: string;
};

export type ProductInput = Omit<Product, "id"> & {
  id?: string | number;
};

const fallbackProducts: Product[] = [
  {
    id: "sample-1",
    name: "كرتون شحن مقاس وسط",
    description: "كرتون مموج للطلبات اليومية والمتاجر الصغيرة مع مساحة لملصق الشحن.",
    category: "مستلزمات الشحن",
    sku: "PK-SHP-030",
    price: 12,
    stock: 64,
    weightKg: 0.35,
    shippingProfile: "شحن عادي",
    imageUrl: "/products/shipping-box.svg",
  },
  {
    id: "sample-2",
    name: "أكياس شحن مبطنة",
    description: "أكياس مقاومة للرطوبة مناسبة للطلبات الخفيفة ومنتجات العناية.",
    category: "البلاستيكيات",
    sku: "PK-BAG-020",
    price: 7,
    stock: 18,
    weightKg: 0.12,
    shippingProfile: "خفيف",
    imageUrl: "/products/padded-mailer.svg",
  },
  {
    id: "sample-3",
    name: "علب ورقية للحلويات",
    description: "علب تقديم أنيقة للمطاعم والأسر المنتجة مع مقاسات متعددة.",
    category: "علب ورقية",
    sku: "PK-PBX-014",
    price: 18,
    stock: 42,
    weightKg: 0.2,
    shippingProfile: "قابل للكسر",
    imageUrl: "/products/paper-box.svg",
  },
  {
    id: "sample-4",
    name: "ملصقات حرارية",
    description: "ملصقات باركود وفواتير للشحن السريع.",
    category: "الملصقات والطباعة",
    sku: "PK-LBL-010",
    price: 4,
    stock: 12,
    weightKg: 0.08,
    shippingProfile: "خفيف",
    imageUrl: "/products/labels.svg",
  },
  {
    id: "sample-5",
    name: "أكواب ورقية مع أغطية",
    description: "أكواب قهوة للاستخدام اليومي في المقاهي ونقاط البيع المتنقلة.",
    category: "القهوة والمشروبات",
    sku: "PK-CUP-012",
    price: 16,
    stock: 88,
    weightKg: 0.3,
    shippingProfile: "شحن عادي",
    imageUrl: "/products/cups.svg",
  },
  {
    id: "sample-6",
    name: "أكياس ورقية بشعار",
    description: "أكياس حمل للمتاجر والهدايا قابلة للطباعة بهوية باكورة.",
    category: "الأكياس",
    sku: "PK-PBG-018",
    price: 9,
    stock: 25,
    weightKg: 0.16,
    shippingProfile: "خفيف",
    imageUrl: "/products/paper-bag.svg",
  },
  {
    id: "sample-7",
    name: "علب توزيعات مناسبات",
    description: "علب صغيرة للهدايا والتوزيعات بتصميم محايد وسهل التخصيص.",
    category: "الهدايا والتوزيعات",
    sku: "PK-GFT-011",
    price: 14,
    stock: 9,
    weightKg: 0.18,
    shippingProfile: "قابل للكسر",
    imageUrl: "/products/gift-box.svg",
  },
  {
    id: "sample-8",
    name: "صواني ألمنيوم بغطاء",
    description: "صواني عملية للمطاعم والأسر المنتجة مع غطاء مناسب للتوصيل.",
    category: "المطبخ والألمنيوم",
    sku: "PK-ALU-016",
    price: 11,
    stock: 57,
    weightKg: 0.28,
    shippingProfile: "شحن عادي",
    imageUrl: "/products/foil-tray.svg",
  },
  {
    id: "sample-9",
    name: "عبوات بلاستيكية شفافة",
    description: "عبوات خفيفة للطلبات الغذائية والهدايا الصغيرة مع غطاء محكم.",
    category: "البلاستيكيات",
    sku: "PK-PLS-024",
    price: 13,
    stock: 72,
    weightKg: 0.22,
    shippingProfile: "خفيف",
    imageUrl: "/products/gift-box.svg",
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
    category: String(product.category ?? "منتجات عامة"),
    sku: String(product.sku ?? product.id ?? "PK-GEN"),
    price: Number(product.price ?? 0),
    stock: Number(product.stock ?? 0),
    weightKg: Number(product.weight_kg ?? product.weightKg ?? 0.25),
    shippingProfile: String(product.shipping_profile ?? product.shippingProfile ?? "شحن عادي"),
    imageUrl: String(product.image_url ?? product.imageUrl ?? "/products/shipping-box.svg"),
  };
}

export function normalizeProductInput(product: Partial<ProductInput>): Product {
  return {
    id: String(product.id ?? `local-${Date.now()}`),
    name: String(product.name?.trim() || "منتج بدون اسم"),
    description: String(product.description?.trim() || "لا يوجد وصف متاح."),
    category: String(product.category?.trim() || "منتجات عامة"),
    sku: String(product.sku?.trim() || `PK-${Date.now().toString().slice(-5)}`),
    price: Math.max(0, Number(product.price ?? 0)),
    stock: Math.max(0, Math.round(Number(product.stock ?? 0))),
    weightKg: Math.max(0.01, Number(product.weightKg ?? 0.25)),
    shippingProfile: String(product.shippingProfile?.trim() || "شحن عادي"),
    imageUrl: String(product.imageUrl?.trim() || "/products/shipping-box.svg"),
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
        .select("id,name,description,category,sku,price,stock,weight_kg,shipping_profile,image_url")
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

export async function createProduct(product: Partial<ProductInput>) {
  const normalizedProduct = normalizeProductInput(product);

  if (!hasSupabaseConfig()) {
    return { product: normalizedProduct, persisted: false };
  }

  const supabase = hasSupabaseAdminConfig()
    ? createSupabaseAdminClient()
    : createSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: normalizedProduct.name,
        description: normalizedProduct.description,
        category: normalizedProduct.category,
        sku: normalizedProduct.sku,
        price: normalizedProduct.price,
        stock: normalizedProduct.stock,
        weight_kg: normalizedProduct.weightKg,
        shipping_profile: normalizedProduct.shippingProfile,
        image_url: normalizedProduct.imageUrl,
      })
      .select("id,name,description,category,sku,price,stock,weight_kg,shipping_profile,image_url")
      .single();

    if (error || !data) {
      return { product: normalizedProduct, persisted: false };
    }

    return { product: normalizeProduct(data), persisted: true };
  } catch {
    return { product: normalizedProduct, persisted: false };
  }
}
