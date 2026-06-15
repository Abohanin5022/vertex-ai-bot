"use client";

function normalizeSaudiPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("966")) {
    return digits;
  }

  if (digits.startsWith("05")) {
    return `966${digits.slice(1)}`;
  }

  if (digits.startsWith("5")) {
    return `966${digits}`;
  }

  return digits;
}

export function WhatsAppVendorLogin({
  phone,
  email,
  password,
}: {
  phone: string;
  email: string;
  password: string;
}) {
  const cleanPhone = normalizeSaudiPhone(phone);

  const message = `مرحبًا بك في Packora

تم قبول طلبك كمورد.

بيانات الدخول:
البريد الإلكتروني: ${email}
كلمة المرور المؤقتة: ${password}

رابط الدخول:
https://packora-dashboard.vercel.app/packora-2/login

يرجى تغيير كلمة المرور بعد تسجيل الدخول.`;

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-4 inline-block rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
    >
      إرسال واتساب
    </a>
  );
}
