export const mobileConfig = {
  appName: "Packora",
  maxWidthClassName: "mx-auto w-full max-w-md",
  pageClassName:
    "min-h-screen overflow-x-hidden bg-white pb-[calc(6rem+env(safe-area-inset-bottom))] text-[var(--packora-navy)]",
  sectionClassName: "mx-auto w-full max-w-md bg-white",
  touchTargetClassName:
    "min-h-11 min-w-11 touch-manipulation select-none rounded-full",
  bottomNavPaddingClassName: "pb-[calc(5.5rem+env(safe-area-inset-bottom))]",
  imageSizes: {
    productCard: "(max-width: 768px) 50vw, 220px",
    hero: "(max-width: 768px) 100vw, 640px",
    logo: "96px",
  },
  routes: {
    customer: "/customer",
    stores: "/stores",
    cart: "/cart",
    checkout: "/checkout",
    track: "/track",
    appDownload: "/app-download",
    offline: "/offline",
  },
};

export const mobileApiEndpoints = {
  orders: "/api/orders",
  ratings: "/api/ratings",
  moyasarVerify: "/api/payments/moyasar/verify",
  products: "/api/products",
  stores: "/stores",
};
