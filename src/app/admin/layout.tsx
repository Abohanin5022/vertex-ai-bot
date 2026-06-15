import Link from "next/link";
import {
  ClipboardList,
  DollarSign,
  LayoutDashboard,
  Store,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { PackoraLogo } from "@/components/packora-logo";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

const links = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/vendor-applications", label: "طلبات الموردين", icon: ClipboardList },
  { href: "/admin/vendors", label: "الموردون", icon: Store },
  { href: "/admin/monetization", label: "الربحية", icon: DollarSign },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");

  const usersCount = await prisma.user.count();
  const vendorsCount = await prisma.user.count({
    where: { role: "merchant" },
  });
  const applicationsCount = await prisma.vendorApplication.count({
    where: { status: "pending" },
  });

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[var(--packora-cyan)] text-[#111827]"
    >
      <div className="grid min-h-screen lg:grid-cols-[300px_1fr]">
        <aside className="border-l border-[var(--packora-border)] bg-white p-5">
          <div className="rounded-[26px] border border-[var(--packora-border)] p-5 shadow-[0_18px_50px_rgba(47,101,230,0.10)]">
            <PackoraLogo href="/admin" size="desktop" />
            <p className="mt-4 text-sm leading-7 text-[#6B7280]">
              لوحة الإدارة العامة لمنصة Packora.
            </p>
          </div>

          <div className="mt-5 grid gap-2">
            <Stat label="المستخدمون" value={usersCount} />
            <Stat label="الموردون" value={vendorsCount} />
            <Stat label="طلبات جديدة" value={applicationsCount} />
          </div>

          <nav className="mt-5 grid gap-2">
            {links.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-full border border-[var(--packora-border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--packora-blue)] hover:bg-[var(--packora-cyan)] hover:text-[var(--packora-blue)]"
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-5">
            <LogoutButton redirectTo="/admin-login" />
          </div>
        </aside>

        <section className="min-w-0 p-4 lg:p-8">{children}</section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[20px] border border-[var(--packora-border)] bg-white p-4">
      <p className="text-xs text-[#6B7280]">{label}</p>
      <strong className="mt-1 block text-2xl font-semibold text-[var(--packora-blue)]">
        {value}
      </strong>
    </div>
  );
}
