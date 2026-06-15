"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  calculateTotals,
  carriers,
  createOrderNumber,
  getCarrierQuotes,
  getPaymentLabel,
  initialFulfillmentStatus,
  paymentMethods,
  saudiCities,
  type CarrierCode,
  type CheckoutOrder,
  type PaymentMethodCode,
} from "@/lib/checkout";
import { marketplacePlaybook, setupProviders, type IntegrationType } from "@/lib/integrations";
import type { Product } from "@/lib/products";
import type { SetupProviderStatus } from "@/lib/setup-status";
import { localOrdersKey, localProductsKey } from "@/lib/storage-keys";

const formatter = {
  format(value: number) {
    return `${new Intl.NumberFormat("ar-SA", {
      maximumFractionDigits: 0,
    }).format(value)} ﷼`;
  },
};

type StockFilter = "all" | "available" | "low";
type WorkspaceView = "catalog" | "add" | "checkout" | "shipping" | "customer" | "setup";

type ProductWorkspaceProps = {
  products: Product[];
  setupStatus: SetupProviderStatus[];
};

type ProductDraft = {
  name: string;
  sku: string;
  category: string;
  description: string;
  price: string;
  stock: string;
  weightKg: string;
  shippingProfile: string;
  imageUrl: string;
};

type CheckoutDraft = {
  customerName: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  quantity: string;
};

type OrderWithPersistence = CheckoutOrder & {
  persisted?: boolean;
};

const categoryOptions = [
  "البلاستيكيات",
  "مستلزمات الشحن",
  "علب ورقية",
  "القهوة والمشروبات",
  "الأكياس",
  "الهدايا والتوزيعات",
  "الملصقات والطباعة",
  "المطبخ والألمنيوم",
  "منتجات عامة",
];

const shippingProfiles = ["خفيف", "شحن عادي", "قابل للكسر", "كبير الحجم"];

const filters: { label: string; value: StockFilter }[] = [
  { label: "الكل", value: "all" },
  { label: "متوفر", value: "available" },
  { label: "منخفض", value: "low" },
];

const viewTabs: { label: string; value: WorkspaceView }[] = [
  { label: "الكتالوج", value: "catalog" },
  { label: "إدخال منتج", value: "add" },
  { label: "الدفع والطلبات", value: "checkout" },
  { label: "الشحن", value: "shipping" },
  { label: "تجربة العميل", value: "customer" },
  { label: "الإعدادات", value: "setup" },
];

const integrationTypeLabels: Record<IntegrationType, string> = {
  database: "قاعدة البيانات",
  payment: "الدفع",
  finance: "التمويل",
  shipping: "الشحن",
  control: "التسليم",
};

const customerJourney = [
  "بحث عربي سريع حسب التصنيف أو المنتج",
  "بطاقة منتج واضحة بالسعر والكمية والتغليف",
  "عنوان سعودي مع مدينة وحي ورقم جوال",
  "اختيار شركة الشحن المناسبة قبل الدفع",
  "تتبع الطلب بعد التجهيز والشحن",
];

const defaultDraft: ProductDraft = {
  name: "",
  sku: "",
  category: categoryOptions[0],
  description: "",
  price: "",
  stock: "",
  weightKg: "0.25",
  shippingProfile: shippingProfiles[1],
  imageUrl: "/products/shipping-box.svg",
};

const defaultCheckout: CheckoutDraft = {
  customerName: "عميل باكورة",
  phone: "05",
  city: "الرياض",
  district: "",
  address: "",
  quantity: "1",
};

const productTemplates: ProductDraft[] = [
  {
    name: "كرتون شحن",
    sku: "PK-SHP-",
    category: "مستلزمات الشحن",
    description: "منتج مخصص لتجهيز الطلبات اليومية داخل السعودية.",
    price: "12",
    stock: "50",
    weightKg: "0.35",
    shippingProfile: "شحن عادي",
    imageUrl: "/products/shipping-box.svg",
  },
  {
    name: "علبة ورقية",
    sku: "PK-PBX-",
    category: "علب ورقية",
    description: "علبة تقديم مناسبة للمطاعم والأسر المنتجة.",
    price: "18",
    stock: "40",
    weightKg: "0.20",
    shippingProfile: "قابل للكسر",
    imageUrl: "/products/paper-box.svg",
  },
  {
    name: "أكياس ورقية",
    sku: "PK-BAG-",
    category: "الأكياس",
    description: "أكياس حمل قابلة للطباعة وتناسب المتاجر والهدايا.",
    price: "9",
    stock: "60",
    weightKg: "0.16",
    shippingProfile: "خفيف",
    imageUrl: "/products/paper-bag.svg",
  },
];

function escapeCsvValue(value: string | number) {
  const text = String(value);

  if (!/[",\n]/.test(text)) {
    return text;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(products: Product[]) {
  const header = [
    "المنتج",
    "SKU",
    "التصنيف",
    "الوصف",
    "السعر",
    "المخزون",
    "الوزن",
    "الشحن",
    "الحالة",
  ];
  const rows = products.map((product) => [
    product.name,
    product.sku,
    product.category,
    product.description,
    product.price,
    product.stock,
    product.weightKg,
    product.shippingProfile,
    product.stock <= 20 ? "منخفض" : "متوفر",
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "packora-saudi-products.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function toNumber(value: string, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function readStoredArray<T>(key: string): T[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredArray<T>(key: string, value: T[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function mergeProducts(serverProducts: Product[], localProducts: Product[]) {
  const merged = [...localProducts, ...serverProducts];
  const seen = new Set<string>();

  return merged.filter((product) => {
    const key = String(product.id);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function isProduct(product: unknown): product is Product {
  if (!product || typeof product !== "object") {
    return false;
  }

  const candidate = product as Partial<Product>;
  return Boolean(candidate.name && candidate.sku && candidate.category);
}

function getInitialProducts(products: Product[]) {
  const storedProducts = readStoredArray<Product>(localProductsKey).filter(isProduct);

  return mergeProducts(products, storedProducts);
}

export function ProductWorkspace({ products, setupStatus }: ProductWorkspaceProps) {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(products);
  const [orders, setOrders] = useState<OrderWithPersistence[]>([]);
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("الكل");
  const [view, setView] = useState<WorkspaceView>("catalog");
  const [draft, setDraft] = useState<ProductDraft>(defaultDraft);
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraft>(defaultCheckout);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodCode>("cod");
  const [carrier, setCarrier] = useState<CarrierCode>("spl");
  const [selectedProductId, setSelectedProductId] = useState(String(products[0]?.id ?? ""));
  const [recentlyAdded, setRecentlyAdded] = useState("");
  const [productStatus, setProductStatus] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const configuredIntegrations = setupStatus.filter((provider) => provider.isConfigured).length;
  const missingIntegrations = setupStatus.length - configuredIntegrations;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const mergedProducts = getInitialProducts(products);
      const storedOrders = readStoredArray<OrderWithPersistence>(localOrdersKey);

      setCatalogProducts(mergedProducts);
      setOrders(storedOrders);
      setSelectedProductId((current) => current || String(mergedProducts[0]?.id ?? ""));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [products]);

  const categories = useMemo(() => {
    return ["الكل", ...Array.from(new Set(catalogProducts.map((product) => product.category)))];
  }, [catalogProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ar-SA");

    return catalogProducts.filter((product) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [product.name, product.description, product.sku, product.category]
          .join(" ")
          .toLocaleLowerCase("ar-SA")
          .includes(normalizedQuery);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && product.stock <= 20) ||
        (stockFilter === "available" && product.stock > 20);
      const matchesCategory =
        categoryFilter === "الكل" || product.category === categoryFilter;

      return matchesQuery && matchesStock && matchesCategory;
    });
  }, [catalogProducts, categoryFilter, query, stockFilter]);

  const selectedProduct = useMemo(() => {
    return catalogProducts.find((product) => String(product.id) === selectedProductId) ?? catalogProducts[0];
  }, [catalogProducts, selectedProductId]);

  const quantity = Math.max(1, Math.round(toNumber(checkoutDraft.quantity, 1)));
  const lowStock = catalogProducts.filter((product) => product.stock <= 20);
  const filteredStock = filteredProducts.reduce(
    (sum, product) => sum + product.stock,
    0,
  );
  const filteredValue = filteredProducts.reduce(
    (sum, product) => sum + product.stock * product.price,
    0,
  );

  const shippingQuotes = useMemo(() => {
    if (!selectedProduct) {
      return [];
    }

    return getCarrierQuotes({
      city: checkoutDraft.city,
      weightKg: selectedProduct.weightKg * quantity,
      subtotal: selectedProduct.price * quantity,
      paymentMethod,
    });
  }, [checkoutDraft.city, paymentMethod, quantity, selectedProduct]);

  const selectedQuote = useMemo(() => {
    return shippingQuotes.find((quote) => quote.carrier === carrier) ?? shippingQuotes[0];
  }, [carrier, shippingQuotes]);

  const previewTotals =
    selectedProduct && selectedQuote
      ? calculateTotals({ product: selectedProduct, quantity, shippingQuote: selectedQuote })
      : null;

  function updateDraft(field: keyof ProductDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateCheckout(field: keyof CheckoutDraft, value: string) {
    setCheckoutDraft((current) => ({ ...current, [field]: value }));
  }

  function handleTemplate(template: ProductDraft) {
    setDraft({
      ...template,
      sku: `${template.sku}${String(catalogProducts.length + 1).padStart(3, "0")}`,
    });
    setView("add");
  }

  function storeProduct(product: Product) {
    const storedProducts = readStoredArray<Product>(localProductsKey).filter(isProduct);
    const nextStoredProducts = mergeProducts([], [product, ...storedProducts]).slice(0, 200);

    writeStoredArray(localProductsKey, nextStoredProducts);
    setCatalogProducts((current) => mergeProducts(current, [product]));
    setSelectedProductId(String(product.id));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingProduct(true);
    setProductStatus("جاري حفظ المنتج...");

    const nextProduct: Product = {
      id: `local-${Date.now()}`,
      name: draft.name.trim() || "منتج جديد",
      sku: draft.sku.trim() || `PK-${Date.now().toString().slice(-5)}`,
      category: draft.category,
      description: draft.description.trim() || "وصف مختصر للمنتج.",
      price: Math.max(0, toNumber(draft.price)),
      stock: Math.max(0, Math.round(toNumber(draft.stock))),
      weightKg: Math.max(0.01, toNumber(draft.weightKg, 0.25)),
      shippingProfile: draft.shippingProfile,
      imageUrl: draft.imageUrl,
    };

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextProduct),
      });
      const result = (await response.json()) as {
        product?: Product;
        persisted?: boolean;
      };
      const savedProduct = result.product ?? nextProduct;

      storeProduct(savedProduct);
      setProductStatus(
        result.persisted
          ? "تم حفظ المنتج في قاعدة البيانات."
          : "تم حفظ المنتج محليًا. أضف مفاتيح Supabase للحفظ السحابي.",
      );
      setRecentlyAdded(savedProduct.name);
    } catch {
      storeProduct(nextProduct);
      setProductStatus("تم حفظ المنتج محليًا لأن الاتصال بواجهة الحفظ غير متاح.");
      setRecentlyAdded(nextProduct.name);
    } finally {
      setIsSavingProduct(false);
      setDraft(defaultDraft);
      setCategoryFilter("الكل");
      setStockFilter("all");
      setView("catalog");
    }
  }

  function storeOrder(order: OrderWithPersistence) {
    const nextOrders = [order, ...orders].slice(0, 50);

    setOrders(nextOrders);
    writeStoredArray(localOrdersKey, nextOrders);
  }

  function createLocalOrder(): OrderWithPersistence | null {
    if (!selectedProduct || !selectedQuote) {
      return null;
    }

    const order: OrderWithPersistence = {
      orderNumber: createOrderNumber(),
      customerName: checkoutDraft.customerName.trim() || "عميل باكورة",
      phone: checkoutDraft.phone.trim() || "05xxxxxxxx",
      city: checkoutDraft.city,
      district: checkoutDraft.district.trim() || "غير محدد",
      address: checkoutDraft.address.trim() || "عنوان غير محدد",
      product: selectedProduct,
      quantity,
      paymentMethod,
      paymentLabel: getPaymentLabel(paymentMethod),
      paymentStatus: paymentMethod === "bank_transfer" ? "manual_review" : "pending",
      fulfillmentStatus: initialFulfillmentStatus(paymentMethod),
      shippingQuote: selectedQuote,
      totals: calculateTotals({ product: selectedProduct, quantity, shippingQuote: selectedQuote }),
      createdAt: new Date().toISOString(),
      persisted: false,
    };

    return order;
  }

  async function handleCreateOrder() {
    if (!selectedProduct) {
      setCheckoutStatus("اختر منتجًا قبل إنشاء الطلب.");
      return;
    }

    setIsCreatingOrder(true);
    setCheckoutStatus("جاري إنشاء الطلب وتجهيز الشحنة...");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...checkoutDraft,
          quantity,
          product: selectedProduct,
          paymentMethod,
          carrier: selectedQuote?.carrier,
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        order?: OrderWithPersistence;
        persisted?: boolean;
        payment?: { moyasarConfigured?: boolean };
        message?: string;
      };

      if (!response.ok || !result.order) {
        throw new Error(result.message ?? "checkout_failed");
      }

      storeOrder({ ...result.order, persisted: result.persisted });
      setCheckoutStatus(
        result.persisted
          ? "تم إنشاء الطلب وحفظه في قاعدة البيانات."
          : "تم إنشاء الطلب محليًا. أضف جدول orders في Supabase للحفظ السحابي.",
      );
    } catch {
      const localOrder = createLocalOrder();

      if (localOrder) {
        storeOrder(localOrder);
        setCheckoutStatus("تم إنشاء الطلب محليًا لأن واجهة الطلبات غير متاحة.");
      } else {
        setCheckoutStatus("تعذر إنشاء الطلب. تحقق من المنتج والشحن.");
      }
    } finally {
      setIsCreatingOrder(false);
      setView("checkout");
    }
  }

  return (
    <section className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-5">
        <div
          className="grid gap-2 rounded-lg border border-stone-200 bg-white p-2 text-sm sm:grid-cols-6"
          role="tablist"
          aria-label="مساحة العمل"
        >
          {viewTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setView(tab.value)}
              aria-pressed={view === tab.value}
              className={`h-11 rounded-md px-3 font-semibold transition ${
                view === tab.value
                  ? "bg-orange-700 text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {view === "catalog" ? (
          <section className="min-w-0 rounded-lg border border-stone-200 bg-white">
            <div className="grid gap-3 border-b border-stone-200 px-4 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h3 className="font-bold">كتالوج المنتجات</h3>
                <p className="mt-1 text-sm text-stone-500">
                  {filteredProducts.length} من {catalogProducts.length} منتج
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="relative block">
                  <span className="sr-only">بحث في المنتجات</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="بحث باسم المنتج أو التصنيف أو SKU"
                    className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-orange-600 focus:ring-2 focus:ring-orange-100 sm:w-72"
                  />
                </label>

                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                  aria-label="تصفية حسب التصنيف"
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => downloadCsv(filteredProducts)}
                  disabled={filteredProducts.length === 0}
                  className="h-10 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  تصدير CSV
                </button>
              </div>
            </div>

            <div className="grid gap-3 border-b border-stone-200 px-4 py-3 text-sm text-stone-600 sm:grid-cols-4">
              <span>المعروض: {filteredProducts.length}</span>
              <span>المخزون: {filteredStock}</span>
              <span>القيمة: {formatter.format(filteredValue)}</span>
              <span>منخفض: {filteredProducts.filter((product) => product.stock <= 20).length}</span>
            </div>

            <div className="border-b border-stone-200 px-4 py-3">
              <div
                className="grid h-10 max-w-md grid-cols-3 rounded-md border border-stone-300 bg-stone-100 p-1 text-sm"
                role="group"
                aria-label="تصفية المنتجات حسب المخزون"
              >
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStockFilter(filter.value)}
                    className={`rounded px-3 font-semibold transition ${
                      stockFilter === filter.value
                        ? "bg-white text-orange-700 shadow-sm"
                        : "text-stone-600 hover:text-stone-950"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead className="bg-stone-100 text-stone-600">
                  <tr>
                    <th className="px-4 py-3 text-right font-semibold">المنتج</th>
                    <th className="px-4 py-3 text-right font-semibold">SKU</th>
                    <th className="px-4 py-3 text-right font-semibold">التصنيف</th>
                    <th className="px-4 py-3 text-right font-semibold">السعر</th>
                    <th className="px-4 py-3 text-right font-semibold">المخزون</th>
                    <th className="px-4 py-3 text-right font-semibold">الشحن</th>
                    <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-4">
                        <span className="block font-semibold">{product.name}</span>
                        <span className="mt-1 block max-w-sm text-stone-500">
                          {product.description}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-stone-600">
                        {product.sku}
                      </td>
                      <td className="px-4 py-4">{product.category}</td>
                      <td className="px-4 py-4">{formatter.format(product.price)}</td>
                      <td className="px-4 py-4">{product.stock}</td>
                      <td className="px-4 py-4">
                        {product.shippingProfile}
                        <span className="block text-xs text-stone-500">
                          {product.weightKg} كجم
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            product.stock <= 20
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {product.stock <= 20 ? "منخفض" : "متوفر"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-stone-500">
                  لا توجد منتجات مطابقة للبحث الحالي.
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {view === "add" ? (
          <section className="min-w-0 rounded-lg border border-stone-200 bg-white p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div>
                  <h3 className="font-bold">إدخال منتج سريع</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    المنتج يحفظ فورًا في الجهاز، ويحفظ في Supabase تلقائيًا عند ضبط المفاتيح والجداول.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1 text-sm font-semibold text-stone-700">
                    اسم المنتج
                    <input
                      value={draft.name}
                      onChange={(event) => updateDraft("name", event.target.value)}
                      className="h-11 rounded-md border border-stone-300 px-3 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                      placeholder="مثال: كرتون شحن مقاس صغير"
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-stone-700">
                    رمز المنتج SKU
                    <input
                      value={draft.sku}
                      onChange={(event) => updateDraft("sku", event.target.value)}
                      className="h-11 rounded-md border border-stone-300 px-3 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                      placeholder="PK-SHP-001"
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-stone-700">
                    التصنيف
                    <select
                      value={draft.category}
                      onChange={(event) => updateDraft("category", event.target.value)}
                      className="h-11 rounded-md border border-stone-300 px-3 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                    >
                      {categoryOptions.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-stone-700">
                    نوع الشحن
                    <select
                      value={draft.shippingProfile}
                      onChange={(event) => updateDraft("shippingProfile", event.target.value)}
                      className="h-11 rounded-md border border-stone-300 px-3 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                    >
                      {shippingProfiles.map((profile) => (
                        <option key={profile}>{profile}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-stone-700">
                    السعر بالريال
                    <input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={draft.price}
                      onChange={(event) => updateDraft("price", event.target.value)}
                      className="h-11 rounded-md border border-stone-300 px-3 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                      placeholder="0"
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-stone-700">
                    الكمية
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={draft.stock}
                      onChange={(event) => updateDraft("stock", event.target.value)}
                      className="h-11 rounded-md border border-stone-300 px-3 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                      placeholder="0"
                    />
                  </label>
                </div>

                <label className="grid gap-1 text-sm font-semibold text-stone-700">
                  وصف مختصر
                  <textarea
                    value={draft.description}
                    onChange={(event) => updateDraft("description", event.target.value)}
                    className="min-h-24 rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                    placeholder="اكتب وصفًا واضحًا يظهر للعميل وفريق التجهيز."
                  />
                </label>

                <label className="grid max-w-xs gap-1 text-sm font-semibold text-stone-700">
                  الوزن بالكيلو
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    value={draft.weightKg}
                    onChange={(event) => updateDraft("weightKg", event.target.value)}
                    className="h-11 rounded-md border border-stone-300 px-3 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                  />
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="h-11 rounded-md bg-orange-700 px-5 text-sm font-bold text-white transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                  >
                    {isSavingProduct ? "جاري الحفظ..." : "إضافة للكتالوج"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft(defaultDraft)}
                    className="h-11 rounded-md border border-stone-300 px-5 text-sm font-bold text-stone-700 transition hover:bg-stone-100"
                  >
                    مسح الحقول
                  </button>
                </div>

                {productStatus ? (
                  <p className="rounded-md bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800">
                    {productStatus}
                  </p>
                ) : null}
              </form>

              <aside className="space-y-3">
                <h4 className="text-sm font-bold text-stone-700">قوالب جاهزة</h4>
                {productTemplates.map((template) => (
                  <button
                    key={template.category}
                    type="button"
                    onClick={() => handleTemplate(template)}
                    className="block w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-3 text-right text-sm transition hover:border-orange-300 hover:bg-orange-50"
                  >
                    <span className="block font-semibold text-stone-950">{template.name}</span>
                    <span className="mt-1 block text-stone-500">{template.category}</span>
                  </button>
                ))}
              </aside>
            </div>
          </section>
        ) : null}

        {view === "checkout" ? (
          <section className="min-w-0 rounded-lg border border-stone-200 bg-white p-4">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="grid gap-4">
                <div>
                  <h3 className="font-bold">إنشاء طلب ودفع وشحنة</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    يعمل الآن للدفع اليدوي والدفع عند الاستلام، ويتحول للربط الحي عند إضافة مفاتيح الدفع والشحن.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1 text-sm font-semibold text-stone-700">
                    المنتج
                    <select
                      value={String(selectedProduct?.id ?? "")}
                      onChange={(event) => setSelectedProductId(event.target.value)}
                      className="h-11 rounded-md border border-stone-300 bg-white px-3 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                    >
                      {catalogProducts.map((product) => (
                        <option key={product.id} value={String(product.id)}>
                          {product.name} - {formatter.format(product.price)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-stone-700">
                    الكمية
                    <input
                      type="number"
                      min="1"
                      value={checkoutDraft.quantity}
                      onChange={(event) => updateCheckout("quantity", event.target.value)}
                      className="h-11 rounded-md border border-stone-300 px-3 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-stone-700">
                    اسم العميل
                    <input
                      value={checkoutDraft.customerName}
                      onChange={(event) => updateCheckout("customerName", event.target.value)}
                      className="h-11 rounded-md border border-stone-300 px-3 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-stone-700">
                    رقم الجوال
                    <input
                      value={checkoutDraft.phone}
                      onChange={(event) => updateCheckout("phone", event.target.value)}
                      className="h-11 rounded-md border border-stone-300 px-3 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                      placeholder="05xxxxxxxx"
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-stone-700">
                    المدينة
                    <select
                      value={checkoutDraft.city}
                      onChange={(event) => updateCheckout("city", event.target.value)}
                      className="h-11 rounded-md border border-stone-300 bg-white px-3 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                    >
                      {saudiCities.map((city) => (
                        <option key={city}>{city}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-stone-700">
                    الحي
                    <input
                      value={checkoutDraft.district}
                      onChange={(event) => updateCheckout("district", event.target.value)}
                      className="h-11 rounded-md border border-stone-300 px-3 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                    />
                  </label>
                </div>

                <label className="grid gap-1 text-sm font-semibold text-stone-700">
                  العنوان
                  <textarea
                    value={checkoutDraft.address}
                    onChange={(event) => updateCheckout("address", event.target.value)}
                    className="min-h-20 rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                    placeholder="الشارع، رقم المبنى، أقرب معلم"
                  />
                </label>

                <div>
                  <p className="text-sm font-bold text-stone-700">طريقة الدفع</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.code}
                        type="button"
                        onClick={() => setPaymentMethod(method.code)}
                        className={`rounded-lg border px-3 py-3 text-right text-sm transition ${
                          paymentMethod === method.code
                            ? "border-orange-700 bg-orange-50 text-orange-700"
                            : "border-stone-200 bg-stone-50 text-stone-700 hover:border-orange-300"
                        }`}
                      >
                        <span className="block font-bold">{method.label}</span>
                        <span className="mt-1 block text-xs">{method.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-stone-700">شركة الشحن</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                    {shippingQuotes.map((quote) => (
                      <button
                        key={quote.carrier}
                        type="button"
                        onClick={() => setCarrier(quote.carrier)}
                        className={`rounded-lg border px-3 py-3 text-right text-sm transition ${
                          selectedQuote?.carrier === quote.carrier
                            ? "border-orange-700 bg-orange-50 text-orange-700"
                            : "border-stone-200 bg-stone-50 text-stone-700 hover:border-orange-300"
                        }`}
                      >
                        <span className="block font-bold">{quote.carrierName}</span>
                        <span className="mt-1 block text-xs">
                          {quote.service} - {quote.eta}
                        </span>
                        <span className="mt-2 block font-semibold">
                          {formatter.format(quote.total)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder || !selectedProduct}
                    className="h-11 rounded-md bg-orange-700 px-5 text-sm font-bold text-white transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                  >
                    {isCreatingOrder ? "جاري إنشاء الطلب..." : "إنشاء الطلب"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutDraft(defaultCheckout)}
                    className="h-11 rounded-md border border-stone-300 px-5 text-sm font-bold text-stone-700 transition hover:bg-stone-100"
                  >
                    إعادة تعيين
                  </button>
                </div>

                {checkoutStatus ? (
                  <p className="rounded-md bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800">
                    {checkoutStatus}
                  </p>
                ) : null}
              </div>

              <aside className="rounded-lg border border-stone-200 bg-[#fffdf7] p-4">
                <p className="text-sm font-bold text-stone-500">ملخص الطلب</p>
                <h4 className="mt-2 text-lg font-bold">
                  {selectedProduct?.name ?? "اختر منتجًا"}
                </h4>
                {previewTotals && selectedQuote ? (
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-stone-500">المنتجات</span>
                      <span className="font-semibold">{formatter.format(previewTotals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-stone-500">الشحن</span>
                      <span className="font-semibold">{formatter.format(previewTotals.shipping)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-stone-500">رسوم التحصيل</span>
                      <span className="font-semibold">
                        {formatter.format(previewTotals.cashOnDeliveryFee)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-stone-500">ضريبة تقديرية</span>
                      <span className="font-semibold">{formatter.format(previewTotals.vat)}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-stone-200 pt-3">
                      <span className="text-stone-500">الإجمالي</span>
                      <span className="font-bold">{formatter.format(previewTotals.total)}</span>
                    </div>
                    <div className="rounded-md bg-stone-100 px-3 py-2">
                      <p className="font-semibold">{selectedQuote.carrierName}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        رقم تتبع تجريبي: {selectedQuote.trackingNumber}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-stone-500">أضف منتجًا أولًا لإنشاء طلب.</p>
                )}
              </aside>
            </div>
          </section>
        ) : null}

        {view === "shipping" ? (
          <section className="min-w-0 rounded-lg border border-stone-200 bg-white p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <div>
                <h3 className="font-bold">ربط شركات الشحن السعودية</h3>
                <p className="mt-1 text-sm text-stone-500">
                  التسعير يعمل داخل التطبيق، والربط الحي يحتاج مفاتيح API من شركة الشحن المختارة.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {carriers.map((shippingCarrier) => (
                    <article
                      key={shippingCarrier.code}
                      className="rounded-lg border border-stone-200 bg-stone-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">{shippingCarrier.name}</p>
                          <p className="mt-1 text-sm text-stone-500">{shippingCarrier.service}</p>
                        </div>
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-bold ${
                            shippingCarrier.liveReady
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {shippingCarrier.liveReady ? "جاهز للربط" : "قابل للتفعيل"}
                        </span>
                      </div>
                      <p className="mt-4 text-sm text-stone-600">
                        المدن الرئيسية: {shippingCarrier.etaMajor}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-stone-900">
                        يبدأ من {formatter.format(shippingCarrier.baseFee)}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="rounded-lg border border-orange-100 bg-orange-50 p-4">
                <h4 className="font-bold text-orange-700">قواعد التشغيل</h4>
                <div className="mt-4 space-y-3 text-sm text-orange-700">
                  <p>الدفع عند الاستلام يستبعد الشركات التي لا تدعم التحصيل.</p>
                  <p>المدينة خارج المدن الرئيسية تضيف رسوم منطقة تقديرية.</p>
                  <p>الوزن المحاسبي لا يقل عن 1 كجم لكل شحنة.</p>
                  <p>الربط الحي يولد بوليصة الشحن من مزود الخدمة عند إضافة المفاتيح.</p>
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        {view === "customer" ? (
          <section className="min-w-0 rounded-lg border border-stone-200 bg-white p-4">
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div>
                <h3 className="font-bold">تجربة العميل</h3>
                <p className="mt-1 text-sm text-stone-500">
                  رحلة شراء عربية مختصرة من البحث حتى تتبع الشحنة.
                </p>
                <ol className="mt-5 grid gap-3">
                  {customerJourney.map((step, index) => (
                    <li
                      key={step}
                      className="flex gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-700 text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="pt-1 text-stone-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <aside className="rounded-lg border border-stone-200 bg-[#fffdf7] p-4">
                <p className="text-sm font-bold text-stone-500">معاينة طلب</p>
                <h4 className="mt-2 text-lg font-bold">باكورة الرياض</h4>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-stone-500">المنتج</span>
                    <span className="font-semibold">{selectedProduct?.name ?? "منتج باكورة"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-stone-500">الشحن</span>
                    <span className="font-semibold">{selectedQuote?.carrierName ?? "SPL"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-stone-500">الدفع</span>
                    <span className="font-semibold">{getPaymentLabel(paymentMethod)}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-stone-200 pt-3">
                    <span className="text-stone-500">الإجمالي</span>
                    <span className="font-bold">
                      {formatter.format(previewTotals?.total ?? 0)}
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        {view === "setup" ? (
          <section className="min-w-0 rounded-lg border border-stone-200 bg-white p-4">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <div>
                  <h3 className="font-bold">إعدادات الموقع والربط</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    اللغة العربية، السوق السعودي، والريال السعودي مفعلة كأساس التشغيل.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <span className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm">
                    <span className="block text-stone-500">اللغة</span>
                    <strong className="mt-2 block text-lg">العربية RTL</strong>
                  </span>
                  <span className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm">
                    <span className="block text-stone-500">الموقع</span>
                    <strong className="mt-2 block text-lg">السعودية</strong>
                  </span>
                  <span className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm">
                    <span className="block text-stone-500">العملة والضريبة</span>
                    <strong className="mt-2 block text-lg">﷼ / VAT 15%</strong>
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {setupProviders.map((provider) => {
                    const status = setupStatus.find((item) => item.id === provider.id);
                    const configuredKeys = status?.configuredKeys ?? 0;
                    const isConfigured = Boolean(status?.isConfigured);

                    return (
                      <article
                        key={provider.id}
                        className="rounded-lg border border-stone-200 bg-stone-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-blue-800">
                              {integrationTypeLabels[provider.type]}
                            </p>
                            <h4 className="mt-1 font-bold">{provider.name}</h4>
                          </div>
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-bold ${
                              isConfigured
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isConfigured ? "مكتمل" : `${configuredKeys}/${provider.envKeys.length}`}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-stone-600">
                          {provider.summary}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {provider.envKeys.map((key) => (
                            <span
                              key={key}
                              className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-600"
                            >
                              {key}
                            </span>
                          ))}
                        </div>
                        <a
                          href={provider.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex h-9 items-center rounded-md bg-stone-950 px-3 text-sm font-bold text-white transition hover:bg-stone-800"
                        >
                          {provider.actionLabel}
                        </a>
                      </article>
                    );
                  })}
                </div>
              </div>

              <aside className="space-y-4">
                <section className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <h4 className="font-bold text-blue-900">تسليم لوحة التاجر</h4>
                  <div className="mt-4 space-y-3 text-sm text-blue-900">
                    <p>رابط اللوحة المحلي: /merchant</p>
                    <p>رابط تجربة العميل: /customer</p>
                    <p>مفتاح اللوحة: CONTROL_PANEL_KEY</p>
                    <p>لا يتم عرض قيمة المفتاح داخل المتصفح لحماية الوصول.</p>
                  </div>
                </section>

                <section className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                  <h4 className="font-bold text-emerald-900">فكرة الصفقات</h4>
                  <ul className="mt-4 space-y-3 text-sm text-emerald-900">
                    {marketplacePlaybook.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-lg border border-stone-200 bg-[#fffdf7] p-4">
                  <h4 className="font-bold">حالة الإطلاق</h4>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <span className="rounded-md bg-white p-3">
                      <span className="block text-stone-500">مكتمل</span>
                      <strong className="mt-1 block text-lg">{configuredIntegrations}</strong>
                    </span>
                    <span className="rounded-md bg-white p-3">
                      <span className="block text-stone-500">ينقصه مفاتيح</span>
                      <strong className="mt-1 block text-lg text-amber-700">
                        {missingIntegrations}
                      </strong>
                    </span>
                  </div>
                </section>
              </aside>
            </div>
          </section>
        ) : null}
      </div>

      <aside className="space-y-5">
        <section className="rounded-lg border border-stone-200 bg-white p-4">
          <h3 className="font-bold">ملخص التشغيل</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <span className="rounded-md bg-stone-50 p-3">
              <span className="block text-stone-500">المنتجات</span>
              <strong className="mt-1 block text-lg">{catalogProducts.length}</strong>
            </span>
            <span className="rounded-md bg-stone-50 p-3">
              <span className="block text-stone-500">الطلبات</span>
              <strong className="mt-1 block text-lg">{orders.length}</strong>
            </span>
            <span className="rounded-md bg-stone-50 p-3">
              <span className="block text-stone-500">منخفض</span>
              <strong className="mt-1 block text-lg text-rose-700">{lowStock.length}</strong>
            </span>
            <span className="rounded-md bg-stone-50 p-3">
              <span className="block text-stone-500">العملة</span>
              <strong className="mt-1 block text-lg">﷼</strong>
            </span>
          </div>
          {recentlyAdded ? (
            <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
              تمت إضافة {recentlyAdded}
            </p>
          ) : null}
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          <h3 className="font-bold">آخر الطلبات</h3>
          <div className="mt-4 space-y-3">
            {orders.length > 0 ? (
              orders.slice(0, 4).map((order) => (
                <div
                  key={order.orderNumber}
                  className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">{order.orderNumber}</span>
                    <span className="text-xs text-stone-500">
                      {order.persisted ? "محفوظ" : "محلي"}
                    </span>
                  </div>
                  <p className="mt-1 text-stone-600">{order.customerName}</p>
                  <p className="mt-1 font-semibold">{formatter.format(order.totals.total)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">لم يتم إنشاء طلبات بعد.</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          <h3 className="font-bold">تنبيهات المخزون</h3>
          <div className="mt-4 space-y-3">
            {lowStock.length > 0 ? (
              lowStock.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800"
                >
                  {product.name}: تبقى {product.stock}
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">
                لا توجد منتجات منخفضة ضمن النتائج الحالية.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          <h3 className="font-bold">حالة الربط</h3>
          <div className="mt-4 space-y-3 text-sm text-stone-600">
            <p>إضافة المنتجات تعمل محليًا وفوق Supabase عند ضبط الجداول.</p>
            <p>الدفع اليدوي والدفع عند الاستلام يعملان فورًا، وبوابات الدفع تظهر ضمن الاختيار.</p>
            <p>اكتملت {configuredIntegrations} إعدادات، وتبقى {missingIntegrations} تحتاج مفاتيح رسمية.</p>
            <button
              type="button"
              onClick={() => setView("setup")}
              className="h-10 rounded-md bg-stone-950 px-4 text-sm font-bold text-white transition hover:bg-stone-800"
            >
              فتح الإعدادات
            </button>
          </div>
        </section>
      </aside>
    </section>
  );
}
