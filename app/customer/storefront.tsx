"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  calculateTotals,
  getCarrierQuotes,
  getFulfillmentStatus,
  paymentMethods,
  saudiCities,
  type CarrierCode,
  type PaymentMethodCode,
} from "@/lib/checkout";
import { normalizeStoredOrder, type StoredOrder } from "@/lib/orders";
import type { Product } from "@/lib/products";
import {
  localCartKey,
  localCustomerKey,
  localOrdersKey,
  localProductsKey,
} from "@/lib/storage-keys";
import { ProductConfigurator } from "./product-configurator";

const formatter = {
  format(value: number) {
    return `${new Intl.NumberFormat("ar-SA", {
      maximumFractionDigits: 0,
    }).format(value)} ﷼`;
  },
};

type CustomerStorefrontProps = {
  products: Product[];
};

type CustomerDraft = {
  name: string;
  phone: string;
  city: string;
  district: string;
  address: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

const defaultCustomer: CustomerDraft = {
  name: "",
  phone: "05",
  city: "الرياض",
  district: "",
  address: "",
};

const checkoutSteps = ["السلة", "العنوان", "الدفع", "الشحن"];

function readLocalProducts() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(localProductsKey) ?? "[]");
    return Array.isArray(parsed) ? (parsed as Product[]) : [];
  } catch {
    return [];
  }
}

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStoredValue<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function mergeProducts(serverProducts: Product[], localProducts: Product[]) {
  const seen = new Set<string>();

  return [...localProducts, ...serverProducts].filter((product) => {
    const key = String(product.id);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return Boolean(product.name && product.price >= 0);
  });
}

function getProductKey(product: Product) {
  return String(product.id);
}

export function CustomerStorefront({ products }: CustomerStorefrontProps) {
  const [catalogProducts, setCatalogProducts] = useState(products);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("الكل");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodCode>("cod");
  const [carrier, setCarrier] = useState<CarrierCode>("spl");
  const [customer, setCustomer] = useState<CustomerDraft>(defaultCustomer);
  const [lastOrder, setLastOrder] = useState<StoredOrder | null>(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const mergedProducts = mergeProducts(products, readLocalProducts());
      const storedCart = readStoredValue<CartItem[]>(localCartKey, [])
        .filter((item) => item?.product?.name && item.quantity > 0);
      const storedCustomer = readStoredValue<CustomerDraft>(localCustomerKey, defaultCustomer);
      const storedOrders = readStoredValue<unknown[]>(localOrdersKey, [])
        .map(normalizeStoredOrder)
        .filter((order): order is StoredOrder => Boolean(order));

      setCatalogProducts(mergedProducts);
      setCartItems((current) => (current.length > 0 ? current : storedCart));
      setCustomer(storedCustomer);
      setLastOrder(storedOrders[0] ?? null);
      setHasLoadedStorage(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [products]);

  useEffect(() => {
    if (hasLoadedStorage) {
      writeStoredValue(localCartKey, cartItems);
    }
  }, [cartItems, hasLoadedStorage]);

  useEffect(() => {
    if (hasLoadedStorage) {
      writeStoredValue(localCustomerKey, customer);
    }
  }, [customer, hasLoadedStorage]);

  const categories = useMemo(() => {
    return ["الكل", ...Array.from(new Set(catalogProducts.map((product) => product.category)))];
  }, [catalogProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ar-SA");

    return catalogProducts.filter((product) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [product.name, product.description, product.category, product.sku]
          .join(" ")
          .toLocaleLowerCase("ar-SA")
          .includes(normalizedQuery);
      const matchesCategory = category === "الكل" || product.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [catalogProducts, category, query]);

  const heroProducts = filteredProducts.slice(0, 3);
  const featuredProducts = filteredProducts.slice(0, 4);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const cartWeight = cartItems.reduce(
    (sum, item) => sum + item.product.weightKg * item.quantity,
    0,
  );
  const checkoutProduct = useMemo<Product | null>(() => {
    if (cartItems.length === 0) {
      return null;
    }

    return {
      id: "cart-summary",
      name: `سلة مشتريات (${cartItems.length} منتجات)`,
      description: cartItems
        .map((item) => `${item.product.name} × ${item.quantity}`)
        .join("، "),
      category: "سلة مشتريات",
      sku: `PK-CART-${cartItems.length}`,
      price: cartSubtotal,
      stock: 1,
      weightKg: Math.max(0.01, cartWeight),
      shippingProfile: "سلة متعددة",
      imageUrl: cartItems[0]?.product.imageUrl ?? "/products/shipping-box.svg",
    };
  }, [cartItems, cartSubtotal, cartWeight]);
  const quotes = useMemo(() => {
    if (!checkoutProduct) {
      return [];
    }

    return getCarrierQuotes({
      city: customer.city,
      weightKg: checkoutProduct.weightKg,
      subtotal: cartSubtotal,
      paymentMethod,
    });
  }, [cartSubtotal, checkoutProduct, customer.city, paymentMethod]);
  const selectedQuote = quotes.find((quote) => quote.carrier === carrier) ?? quotes[0];
  const checkoutStepIndex =
    cartItems.length === 0
      ? 0
      : customer.address.trim()
        ? 3
        : customer.name.trim() || customer.phone.trim().length > 2
          ? 1
          : 0;
  const totals =
    checkoutProduct && selectedQuote
      ? calculateTotals({ product: checkoutProduct, quantity: 1, shippingQuote: selectedQuote })
      : null;

  function updateCustomer(field: keyof CustomerDraft, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  function addToCart(product: Product, quantity = 1) {
    setCartItems((current) => {
      const key = getProductKey(product);
      const exists = current.find((item) => getProductKey(item.product) === key);

      if (exists) {
        return current.map((item) =>
          getProductKey(item.product) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...current, { product, quantity }];
    });
    setOrderStatus("");
  }

  function setCartQuantity(product: Product, quantity: number) {
    const safeQuantity = Math.max(1, Math.round(quantity));

    setCartItems((current) =>
      current.map((item) =>
        getProductKey(item.product) === getProductKey(product)
          ? { ...item, quantity: safeQuantity }
          : item,
      ),
    );
  }

  function removeFromCart(product: Product) {
    setCartItems((current) =>
      current.filter((item) => getProductKey(item.product) !== getProductKey(product)),
    );
  }

  function storeCustomerOrder(order: StoredOrder) {
    const storedOrders = readStoredValue<unknown[]>(localOrdersKey, [])
      .map(normalizeStoredOrder)
      .filter((item): item is StoredOrder => Boolean(item));
    const nextOrders = [
      order,
      ...storedOrders.filter((item) => item.orderNumber !== order.orderNumber),
    ].slice(0, 80);

    writeStoredValue(localOrdersKey, nextOrders);
    setLastOrder(order);
  }

  async function createOrder() {
    if (!checkoutProduct || !selectedQuote || cartItems.length === 0) {
      setOrderStatus("السلة فارغة. أضف منتجًا قبل تأكيد الطلب.");
      return;
    }

    if (customer.phone.trim().length < 10 || customer.address.trim().length < 8) {
      setOrderStatus("أكمل رقم الجوال والعنوان حتى نقدر نجهز الشحنة بدقة.");
      return;
    }

    setIsCreatingOrder(true);
    setOrderStatus("جاري تجهيز طلبك...");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customer.name || "عميل باكورة",
          phone: customer.phone,
          city: customer.city,
          district: customer.district,
          address: customer.address,
          product: checkoutProduct,
          quantity: 1,
          paymentMethod,
          carrier: selectedQuote.carrier,
        }),
      });
      const result = (await response.json()) as {
        order?: StoredOrder;
        persisted?: boolean;
        message?: string;
      };

      if (!response.ok || !result.order) {
        throw new Error(result.message ?? "order_failed");
      }

      const nextOrder = { ...result.order, persisted: result.persisted };

      storeCustomerOrder(nextOrder);
      setCartItems([]);
      setOrderStatus(`تم استلام طلبك. رقم الطلب: ${nextOrder.orderNumber}`);
    } catch {
      setOrderStatus("تعذر إرسال الطلب الآن. جرّب مرة أخرى أو تواصل معنا.");
    } finally {
      setIsCreatingOrder(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f4f8f6] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-black text-emerald-700">Packora Plastics</p>
            <h1 className="text-xl font-black">سوق البلاستيكيات والتغليف</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-black text-white">
              السلة {cartCount}
            </span>
            <Link
              href="/become-vendor"
              className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-bold text-sky-900 transition hover:bg-sky-100"
            >
              التاجر
            </Link>
            <Link
              href="/track"
              className="rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50"
            >
              تتبع
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-5">
          <section className="grid gap-4 overflow-hidden rounded-lg border border-emerald-100 bg-white p-4 shadow-sm lg:grid-cols-[1fr_320px] lg:items-center">
            <div>
              <p className="text-sm font-black text-emerald-700">عروض توريد يومية</p>
              <h2 className="mt-2 max-w-2xl text-3xl font-black leading-tight md:text-5xl">
                اختر منتجاتك وأكمل الطلب بسلة واحدة
              </h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {["خصومات كمية", "دفع مرن", "شحن محسوب"].map((item) => (
                  <span key={item} className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {heroProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addToCart(product)}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-right transition hover:border-emerald-400"
                >
                  <ProductVisual product={product} className="h-28" />
                  <span className="mt-2 block truncate text-xs font-black">{product.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-emerald-100 bg-white p-3 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث عن منتج"
                className="h-12 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`h-10 shrink-0 rounded-md px-3 text-sm font-bold transition ${
                      category === item
                        ? "bg-emerald-700 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <ProductConfigurator />

          {featuredProducts.length > 0 ? (
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-emerald-700">صفقات مختارة</p>
                  <h2 className="text-2xl font-black">باقات جاهزة</h2>
                </div>
                <span className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-900">
                  وفر بالكمية
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {featuredProducts.map((product, index) => {
                  const dealQuantity = [10, 25, 50, 100][index] ?? 10;

                  return (
                    <article key={product.id} className="overflow-hidden rounded-lg border border-slate-200 bg-[#fbfcf8]">
                      <ProductVisual product={product} className="h-40 rounded-none border-0" />
                      <div className="p-3">
                        <p className="text-xs font-black text-emerald-700">باقة {dealQuantity} قطعة</p>
                        <h3 className="mt-2 min-h-12 font-black">{product.name}</h3>
                        <p className="mt-3 text-2xl font-black">
                          {formatter.format(product.price * dealQuantity)}
                        </p>
                        <button
                          type="button"
                          onClick={() => addToCart(product, dealQuantity)}
                          className="mt-3 h-10 w-full rounded-md bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-emerald-800"
                        >
                          أضف الباقة
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="rounded-lg border border-slate-200 bg-white p-3 transition hover:border-emerald-300"
              >
                <ProductVisual product={product} className="h-48" />
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-emerald-700">{product.category}</p>
                    <h3 className="mt-1 text-lg font-black">{product.name}</h3>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                    {product.stock > 0 ? "متوفر" : "غير متوفر"}
                  </span>
                </div>
                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                  {product.description}
                </p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">السعر</p>
                    <p className="text-2xl font-black">{formatter.format(product.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-emerald-800"
                  >
                    أضف للسلة
                  </button>
                </div>
              </article>
            ))}
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-emerald-100 bg-white p-4 shadow-sm xl:sticky xl:top-20">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">سلة المشتريات</h2>
            <span className="rounded-md bg-emerald-700 px-2 py-1 text-xs font-black text-white">
              {cartCount} قطعة
            </span>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-1 text-center text-xs font-black">
            {checkoutSteps.map((step, index) => (
              <span
                key={step}
                className={`rounded-md px-2 py-2 ${
                  index <= checkoutStepIndex
                    ? "bg-emerald-50 text-emerald-900"
                    : "bg-slate-50 text-slate-400"
                }`}
              >
                {step}
              </span>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <article
                  key={item.product.id}
                  className="grid grid-cols-[72px_1fr] gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2"
                >
                  <ProductVisual product={item.product} className="h-20" />
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black">{item.product.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatter.format(item.product.price)} للقطعة
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product)}
                        className="h-8 rounded-md px-2 text-xs font-black text-rose-700 transition hover:bg-rose-50"
                      >
                        حذف
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-md border border-slate-200 bg-white">
                        <button
                          type="button"
                          onClick={() => setCartQuantity(item.product, item.quantity - 1)}
                          className="h-8 w-8 font-black"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-black">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setCartQuantity(item.product, item.quantity + 1)}
                          className="h-8 w-8 font-black"
                        >
                          +
                        </button>
                      </div>
                      <strong className="text-sm">{formatter.format(item.product.price * item.quantity)}</strong>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                السلة فارغة.
              </p>
            )}
          </div>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">قيمة المنتجات</span>
              <strong>{formatter.format(cartSubtotal)}</strong>
            </div>
            <div className="mt-2 flex justify-between gap-4">
              <span className="text-slate-500">الشحن والتحصيل</span>
              <strong>
                {formatter.format((totals?.shipping ?? 0) + (totals?.cashOnDeliveryFee ?? 0))}
              </strong>
            </div>
            <div className="mt-2 flex justify-between gap-4">
              <span className="text-slate-500">الضريبة</span>
              <strong>{formatter.format(totals?.vat ?? 0)}</strong>
            </div>
            <div className="mt-3 flex justify-between gap-4 border-t border-slate-200 pt-3 text-base">
              <span className="font-black">الإجمالي</span>
              <strong>{formatter.format(totals?.total ?? 0)}</strong>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                الاسم
                <input
                  value={customer.name}
                  onChange={(event) => updateCustomer("name", event.target.value)}
                  className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  placeholder="اسم العميل"
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                الجوال
                <input
                  value={customer.phone}
                  onChange={(event) => updateCustomer("phone", event.target.value)}
                  className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  placeholder="05xxxxxxxx"
                />
              </label>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                المدينة
                <select
                  value={customer.city}
                  onChange={(event) => updateCustomer("city", event.target.value)}
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                >
                  {saudiCities.map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                الحي
                <input
                  value={customer.district}
                  onChange={(event) => updateCustomer("district", event.target.value)}
                  className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
            </div>

            <label className="grid gap-1 text-sm font-bold text-slate-700">
              العنوان
              <textarea
                value={customer.address}
                onChange={(event) => updateCustomer("address", event.target.value)}
                className="min-h-20 rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="الشارع، رقم المبنى، أقرب معلم"
              />
            </label>

            <div>
              <p className="text-sm font-black text-slate-700">الدفع</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.code}
                    type="button"
                    onClick={() => setPaymentMethod(method.code)}
                    className={`min-h-10 rounded-md border px-3 py-2 text-right text-sm font-bold ${
                      paymentMethod === method.code
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <span className="block">{method.label}</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">
                      {method.immediate ? "جاهز الآن" : "يتطلب تفعيل التاجر"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-black text-slate-700">الشحن</p>
              <div className="mt-2 grid gap-2">
                {quotes.map((quote) => (
                  <button
                    key={quote.carrier}
                    type="button"
                    onClick={() => setCarrier(quote.carrier)}
                    className={`rounded-md border px-3 py-2 text-right text-sm ${
                      selectedQuote?.carrier === quote.carrier
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                    >
                    <span className="block font-bold">{quote.carrierName}</span>
                    <span className="mt-1 block text-xs">
                      {quote.service} / {quote.eta} / {formatter.format(quote.total)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={createOrder}
              disabled={isCreatingOrder || cartItems.length === 0}
              className="h-12 rounded-md bg-emerald-700 px-4 text-base font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isCreatingOrder ? "جاري إرسال الطلب..." : "تأكيد الطلب"}
            </button>

            {orderStatus ? (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900">
                {orderStatus}
              </p>
            ) : null}

            {lastOrder ? (
              <section className="rounded-lg border border-emerald-100 bg-[#fbfdf9] p-3 text-sm">
                <p className="font-black text-slate-950">آخر طلب</p>
                <div className="mt-3 grid gap-2">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">رقم الطلب</span>
                    <strong>{lastOrder.orderNumber}</strong>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">الحالة</span>
                    <strong>{getFulfillmentStatus(lastOrder.fulfillmentStatus).customerLabel}</strong>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">التتبع</span>
                    <strong>{lastOrder.shippingQuote.trackingNumber}</strong>
                  </div>
                </div>
                <Link
                  href={`/track?order=${encodeURIComponent(lastOrder.orderNumber)}`}
                  className="mt-3 flex h-10 items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  فتح صفحة التتبع
                </Link>
              </section>
            ) : null}
          </div>
        </aside>
      </section>
    </main>
  );
}

function ProductVisual({ product, className }: { product: Product; className: string }) {
  return (
    <div
      role="img"
      aria-label={product.name}
      className={`${className} rounded-lg border bg-slate-100 bg-cover bg-center`}
      style={{ backgroundImage: `url("${product.imageUrl || "/products/shipping-box.svg"}")` }}
    />
  );
}
