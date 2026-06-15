import { prisma } from "@/lib/prisma";

const statusLabels: Record<string, string> = {
  pending: "جديد",
  processing: "قيد التجهيز",
  shipped: "جاهز للشحن",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const dateFormatter = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeStyle: "short",
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const normalizedId = decodeURIComponent(id).trim();
  const order = await findOrder(normalizedId);

  if (!order) {
    return Response.json(
      {
        error: "Order not found",
        message:
          "استخدم رقم الطلب الحقيقي من صفحة الطلبات أو صفحة التتبع، وليس رقمًا تجريبيًا مثل 1.",
      },
      {
        status: 404,
      }
    );
  }

  return new Response(renderInvoiceHtml(order), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function getOrderInclude() {
  return {
    items: true,
  } as const;
}

async function findOrder(id: string) {
  const include = getOrderInclude();
  const exactOrder = await prisma.order.findUnique({
    where: {
      id,
    },
    include,
  });

  if (exactOrder) {
    return exactOrder;
  }

  if (id.length >= 4) {
    return prisma.order.findFirst({
      where: {
        id: {
          startsWith: id,
        },
      },
      include,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  return null;
}

type InvoiceOrder = NonNullable<Awaited<ReturnType<typeof findOrder>>>;

function renderInvoiceHtml(order: InvoiceOrder) {
  const total =
    order.total ||
    order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const rows = order.items
    .map((item) => {
      const lineTotal = item.price * item.quantity;

      return `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${item.quantity}</td>
          <td>${formatMoney(item.price)}</td>
          <td>${formatMoney(lineTotal)}</td>
        </tr>
      `;
    })
    .join("");

  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>فاتورة Packora - ${escapeHtml(order.id.slice(0, 8))}</title>
    <style>
      :root {
        --navy: #070b2a;
        --blue: #1766e8;
        --mint: #4fe7c5;
        --soft: #f7fcff;
        --border: #d5ebff;
        --muted: #64748b;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--soft);
        color: var(--navy);
        font-family: Tahoma, Arial, sans-serif;
      }

      main {
        max-width: 920px;
        margin: 32px auto;
        padding: 0 16px;
      }

      .invoice {
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 28px;
        overflow: hidden;
      }

      header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 24px;
        padding: 32px;
        border-bottom: 1px solid var(--border);
      }

      .brand {
        font-size: 34px;
        font-weight: 900;
        letter-spacing: -0.03em;
      }

      .tag {
        color: var(--blue);
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
      }

      h1 {
        margin: 10px 0 0;
        font-size: 30px;
      }

      .meta {
        text-align: left;
        color: var(--muted);
        line-height: 1.9;
      }

      .content {
        padding: 32px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 28px;
      }

      .box {
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 16px;
        background: #fff;
      }

      .label {
        color: var(--muted);
        font-size: 13px;
        margin-bottom: 8px;
      }

      .value {
        font-weight: 800;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        overflow: hidden;
        border-radius: 18px;
      }

      th,
      td {
        padding: 16px;
        border-bottom: 1px solid var(--border);
        text-align: right;
      }

      th {
        background: var(--soft);
        color: var(--muted);
        font-size: 13px;
      }

      .summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        margin-top: 24px;
        padding: 22px;
        border-radius: 22px;
        background: linear-gradient(135deg, var(--blue), var(--mint));
        color: white;
      }

      .summary strong {
        font-size: 34px;
      }

      .actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin: 18px 0 0;
      }

      button {
        border: 0;
        border-radius: 999px;
        background: var(--navy);
        color: white;
        padding: 14px 24px;
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }

      @media print {
        body {
          background: white;
        }

        main {
          margin: 0;
          max-width: none;
          padding: 0;
        }

        .invoice {
          border: 0;
          border-radius: 0;
        }

        .actions {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="invoice">
        <header>
          <div>
            <div class="brand">Packora</div>
            <div class="tag">فاتورة طلب</div>
            <h1>#${escapeHtml(order.id.slice(0, 8))}</h1>
          </div>
          <div class="meta">
            <div>التاريخ: ${dateFormatter.format(order.createdAt)}</div>
            <div>الحالة: ${escapeHtml(statusLabels[order.status] || order.status)}</div>
          </div>
        </header>

        <div class="content">
          <section class="grid">
            <div class="box">
              <div class="label">اسم العميل</div>
              <div class="value">${escapeHtml(order.customer)}</div>
            </div>
            <div class="box">
              <div class="label">رقم الجوال</div>
              <div class="value">${escapeHtml(order.phone)}</div>
            </div>
            <div class="box">
              <div class="label">المدينة</div>
              <div class="value">${escapeHtml(order.city)}</div>
            </div>
            <div class="box">
              <div class="label">العنوان</div>
              <div class="value">${escapeHtml(order.address || "غير محدد")}</div>
            </div>
          </section>

          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="summary">
            <span>الإجمالي</span>
            <strong>${formatMoney(total)}</strong>
          </div>
        </div>
      </section>

      <div class="actions">
        <button onclick="window.print()">طباعة الفاتورة</button>
      </div>
    </main>
  </body>
</html>`;
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("ar-SA", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)} ﷼`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
