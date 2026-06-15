import { ClipboardList } from "lucide-react";
import { VendorApplicationActions } from "@/components/vendor-application-actions";
import { WhatsAppVendorLogin } from "@/components/whatsapp-vendor-login";
import { prisma } from "@/lib/prisma";

function fallbackEmail(id: string) {
  return `vendor-${id.slice(0, 8)}@packora.local`;
}

export default async function AdminVendorApplicationsPage() {
  const applications = await prisma.vendorApplication.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <section>
      <header className="mb-6 border-b border-[#E5E7EB] pb-6">
        <p className="text-sm text-[#6B7280]">Admin Dashboard</p>

        <h1 className="mt-2 text-[36px] font-semibold leading-tight">
          طلبات انضمام الموردين
        </h1>

        <p className="mt-3 text-[#6B7280]">
          راجع طلبات الموردين وافتح واتساب برسالة بيانات الدخول الجاهزة.
        </p>
      </header>

      {applications.length === 0 ? (
        <div className="rounded-[28px] border border-[#E5E7EB] p-10 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#E5E7EB] text-[#9CA3AF]">
            <ClipboardList size={38} strokeWidth={1.7} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold">لا توجد طلبات</h2>

          <p className="mt-2 text-[#6B7280]">
            ستظهر طلبات الموردين الجديدة هنا.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {applications.map((app) => {
            const email = app.email || fallbackEmail(app.id);
            const password = app.tempPassword || "Packora@12345";

            return (
              <article
                key={app.id}
                className="rounded-[28px] border border-[#E5E7EB] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{app.name}</h2>

                    <p className="mt-2 text-sm text-[#6B7280]">
                      {app.city} · {app.category}
                    </p>
                  </div>

                  <span className="rounded-full border border-[#E5E7EB] px-3 py-1 text-xs font-semibold text-[#6B7280]">
                    {app.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-2 text-sm text-[#6B7280]">
                  <p>الجوال: {app.phone}</p>
                  <p>البريد: {email}</p>
                  <p>كلمة المرور: {password}</p>
                </div>

                {app.notes && (
                  <p className="mt-4 line-clamp-3 rounded-[20px] bg-[#F9FAFB] p-4 text-sm leading-7 text-[#6B7280]">
                    {app.notes}
                  </p>
                )}

                <WhatsAppVendorLogin
                  phone={app.phone}
                  email={email}
                  password={password}
                />

                <VendorApplicationActions
                  applicationId={app.id}
                  status={app.status}
                />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
