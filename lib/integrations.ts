export type IntegrationType =
  | "database"
  | "payment"
  | "finance"
  | "shipping"
  | "control";

export type IntegrationProvider = {
  id: string;
  name: string;
  type: IntegrationType;
  url: string;
  envKeys: string[];
  summary: string;
  actionLabel: string;
};

export const setupProviders: IntegrationProvider[] = [
  {
    id: "supabase",
    name: "Supabase",
    type: "database",
    url: "https://supabase.com/dashboard/projects",
    envKeys: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ],
    summary: "قاعدة بيانات المنتجات والطلبات وإعدادات الموقع.",
    actionLabel: "فتح Supabase",
  },
  {
    id: "control-panel",
    name: "مفتاح لوحة التاجر",
    type: "control",
    url: "https://packora.com/merchant",
    envKeys: ["CONTROL_PANEL_KEY"],
    summary: "مفتاح تسليم داخلي للوصول الإداري لا يعرض كاملًا داخل الواجهة.",
    actionLabel: "موقع Packora",
  },
  {
    id: "moyasar",
    name: "Moyasar",
    type: "payment",
    url: "https://docs.moyasar.com/",
    envKeys: ["NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY", "MOYASAR_SECRET_KEY"],
    summary: "مدى، بطاقات، Apple Pay، وروابط دفع عبر مزود سعودي.",
    actionLabel: "توثيق Moyasar",
  },
  {
    id: "hyperpay",
    name: "HyperPay",
    type: "payment",
    url: "https://www.hyperpay.com/payment/",
    envKeys: ["HYPERPAY_ENTITY_ID", "HYPERPAY_ACCESS_TOKEN"],
    summary: "بوابة دفع إقليمية للبطاقات والمحافظ وخيارات محلية.",
    actionLabel: "فتح HyperPay",
  },
  {
    id: "paytabs",
    name: "PayTabs",
    type: "payment",
    url: "https://docs.paytabs.com/",
    envKeys: ["PAYTABS_PROFILE_ID", "PAYTABS_SERVER_KEY"],
    summary: "بوابة دفع وروابط دفع وفواتير إلكترونية للمتاجر.",
    actionLabel: "توثيق PayTabs",
  },
  {
    id: "tamara",
    name: "Tamara",
    type: "finance",
    url: "https://docs.tamara.co/",
    envKeys: ["TAMARA_API_TOKEN"],
    summary: "اشتر الآن وادفع لاحقًا بعد تفعيل حساب التاجر.",
    actionLabel: "توثيق Tamara",
  },
  {
    id: "tabby",
    name: "Tabby",
    type: "finance",
    url: "https://docs.tabby.ai/api-reference/overview",
    envKeys: ["TABBY_SECRET_KEY", "TABBY_MERCHANT_CODE"],
    summary: "تمويل وتقسيط للعميل مع نطاق سعودي خاص.",
    actionLabel: "توثيق Tabby",
  },
  {
    id: "spl",
    name: "SPL",
    type: "shipping",
    url: "https://splonline.com.sa/en/",
    envKeys: ["SPL_API_KEY"],
    summary: "الشحن المحلي والعنوان الوطني بعد اعتماد حساب الأعمال.",
    actionLabel: "فتح SPL",
  },
  {
    id: "smsa",
    name: "SMSA Express",
    type: "shipping",
    url: "https://ecom.smsaexpress.com/docs/api",
    envKeys: ["SMSA_API_KEY"],
    summary: "بوابة التجارة الإلكترونية من سمسا للشحن والتتبع.",
    actionLabel: "توثيق SMSA",
  },
  {
    id: "aramex",
    name: "Aramex",
    type: "shipping",
    url: "https://www.aramex.com/ag/en/developers-solution-center/aramex-apis",
    envKeys: [
      "ARAMEX_USERNAME",
      "ARAMEX_PASSWORD",
      "ARAMEX_ACCOUNT_NUMBER",
    ],
    summary: "احتساب أسعار، إنشاء بوليصات، وتتبع عبر واجهات Aramex.",
    actionLabel: "توثيق Aramex",
  },
  {
    id: "imile",
    name: "iMile",
    type: "shipping",
    url: "https://en.imile.com/",
    envKeys: ["IMILE_API_KEY"],
    summary: "شحن تجارة إلكترونية داخل السعودية والمنطقة.",
    actionLabel: "فتح iMile",
  },
  {
    id: "jt",
    name: "J&T Express",
    type: "shipping",
    url: "https://jtexpress.com/en/contactUs",
    envKeys: ["JT_API_KEY"],
    summary: "شحن اقتصادي وتواصل أعمال للحسابات التجارية.",
    actionLabel: "فتح J&T",
  },
  {
    id: "redbox",
    name: "RedBox",
    type: "shipping",
    url: "https://redboxsa.com/en/send/",
    envKeys: ["REDBOX_API_KEY"],
    summary: "خزائن استلام وشحن سريع داخل السعودية.",
    actionLabel: "فتح RedBox",
  },
];

export const marketplacePlaybook = [
  "صفقات سريعة بكميات جاهزة بدل بحث طويل داخل الكتالوج.",
  "اختيار واضح لطريقة الدفع قبل الشحن، مع إخفاء الشركات غير المناسبة.",
  "طلب عميل مختصر يجمع المنتج والمدينة والدفع والشحن في خطوة واحدة.",
  "لوحة تشغيل تعرض حالة الربط والمفاتيح الناقصة قبل الإطلاق.",
];
