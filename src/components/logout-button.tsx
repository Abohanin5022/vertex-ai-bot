"use client";

export function LogoutButton({
  redirectTo = "/packora-2/login",
}: {
  redirectTo?: string;
}) {
  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    location.href = redirectTo;
  }

  return (
    <button
      onClick={logout}
      className="w-full rounded-full border border-red-200 bg-red-50 px-5 py-3 text-center text-sm font-semibold text-red-600 hover:bg-red-100"
    >
      تسجيل الخروج
    </button>
  );
}
