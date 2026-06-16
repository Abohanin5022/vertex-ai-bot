import PDFDocument from "pdfkit";

type InvoiceOrder = {
  id?: string;
  customer: string;
  phone: string;
  city: string;
  address?: string | null;
  total: number;
  subtotal?: number;
  shippingCost?: number;
  discountAmount?: number;
  finalTotal?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;
  createdAt?: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
};

const statusLabels: Record<string, string> = {
  bank_transfer_review: "Bank transfer review",
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  processing: "Preparing",
  shipped: "Shipped",
  completed: "Completed",
  payment_rejected: "Payment rejected",
  cancelled: "Cancelled",
};

const paymentMethodLabels: Record<string, string> = {
  cod: "Cash on delivery",
  bank_transfer: "Bank transfer",
  apple_pay: "Apple Pay",
  mada: "Mada",
  visa: "Visa",
  mastercard: "Mastercard",
  tabby: "Tabby",
  tamara: "Tamara",
};

const paymentStatusLabels: Record<string, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  manual_review: "Manual review",
  manual_review_rejected: "Manual review rejected",
  pending: "Pending",
  failed: "Failed",
};

const dateFormatter = new Intl.DateTimeFormat("en-SA", {
  dateStyle: "medium",
  timeStyle: "short",
});

const moneyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export async function generateInvoice(order: InvoiceOrder) {
  const doc = new PDFDocument({
    margin: 48,
    size: "A4",
  });

  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => {
    chunks.push(chunk);
  });

  return new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on("error", reject);

    drawHeader(doc, order);
    drawCustomerDetails(doc, order);
    drawItemsTable(doc, order);
    drawSummary(doc, order);
    drawFooter(doc);

    doc.end();
  });
}

function drawHeader(doc: PDFKit.PDFDocument, order: InvoiceOrder) {
  const invoiceId = order.id ? order.id.slice(0, 8) : "N/A";

  doc.roundedRect(48, 48, 499, 96, 20).fill("#070B2A");
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(28)
    .text("Packora", 74, 72);
  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#4FE7C5")
    .text("Packaging and plastics marketplace", 76, 106);
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#FFFFFF")
    .text("Invoice", 390, 72, { width: 130, align: "right" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#DDEBFF")
    .text(`#${invoiceId}`, 390, 100, { width: 130, align: "right" });
}

function drawCustomerDetails(doc: PDFKit.PDFDocument, order: InvoiceOrder) {
  const top = 170;
  const dateValue = order.createdAt ? dateFormatter.format(order.createdAt) : "-";

  doc
    .fillColor("#070B2A")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Order details", 48, top);

  drawInfoBox(doc, 48, top + 28, "Customer", order.customer || "-");
  drawInfoBox(doc, 300, top + 28, "Phone", order.phone || "-");
  drawInfoBox(doc, 48, top + 104, "City", order.city || "-");
  drawInfoBox(doc, 300, top + 104, "Date", dateValue);
  drawInfoBox(doc, 48, top + 180, "Address", order.address || "-", 499);
}

function drawInfoBox(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  label: string,
  value: string,
  width = 230
) {
  doc.roundedRect(x, y, width, 58, 14).strokeColor("#D5EBFF").stroke();
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#64748B")
    .text(label, x + 14, y + 12, { width: width - 28 });
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#070B2A")
    .text(value, x + 14, y + 30, { width: width - 28 });
}

function drawItemsTable(doc: PDFKit.PDFDocument, order: InvoiceOrder) {
  let y = 440;

  doc
    .fillColor("#070B2A")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Products", 48, y);

  y += 28;
  drawTableHeader(doc, y);
  y += 34;

  order.items.forEach((item, index) => {
    if (y > 690) {
      doc.addPage();
      y = 60;
      drawTableHeader(doc, y);
      y += 34;
    }

    const lineTotal = item.price * item.quantity;
    const rowHeight = 38;

    doc
      .moveTo(48, y + rowHeight)
      .lineTo(547, y + rowHeight)
      .strokeColor("#E5E7EB")
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#64748B")
      .text(`${index + 1}`, 54, y + 12, { width: 28 });
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#070B2A")
      .text(item.name || "-", 86, y + 12, { width: 210 });
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#070B2A")
      .text(String(item.quantity), 306, y + 12, {
        width: 58,
        align: "center",
      });
    doc.text(formatMoney(item.price), 372, y + 12, {
      width: 76,
      align: "right",
    });
    doc
      .font("Helvetica-Bold")
      .text(formatMoney(lineTotal), 456, y + 12, {
        width: 84,
        align: "right",
      });

    y += rowHeight;
  });

  doc.y = y + 20;
}

function drawTableHeader(doc: PDFKit.PDFDocument, y: number) {
  doc.roundedRect(48, y, 499, 30, 12).fill("#F0F7FF");
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#1766E8")
    .text("#", 54, y + 10, { width: 28 });
  doc.text("Product", 86, y + 10, { width: 210 });
  doc.text("Qty", 306, y + 10, { width: 58, align: "center" });
  doc.text("Price", 372, y + 10, { width: 76, align: "right" });
  doc.text("Total", 456, y + 10, { width: 84, align: "right" });
}

function drawSummary(doc: PDFKit.PDFDocument, order: InvoiceOrder) {
  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const subtotal = order.subtotal || itemsSubtotal;
  const shippingCost = order.shippingCost || 0;
  const discountAmount = order.discountAmount || 0;
  const finalTotal =
    order.finalTotal || order.total || subtotal + shippingCost - discountAmount;

  if (doc.y > 620) {
    doc.addPage();
    doc.y = 60;
  }

  const x = 300;
  let y = doc.y;

  drawSummaryRow(doc, x, y, "Subtotal", subtotal);
  y += 26;
  drawSummaryRow(doc, x, y, "Shipping", shippingCost);
  y += 26;

  if (discountAmount > 0) {
    drawSummaryRow(doc, x, y, "Discount", -discountAmount);
    y += 26;
  }

  doc.roundedRect(x, y + 8, 247, 58, 16).fill("#1766E8");
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#DDEBFF")
    .text("Final total", x + 16, y + 22);
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#FFFFFF")
    .text(formatMoney(finalTotal), x + 16, y + 20, {
      width: 215,
      align: "right",
    });

  y += 88;
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#070B2A")
    .text("Payment", 48, y);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#64748B")
    .text(
      `Method: ${
        paymentMethodLabels[order.paymentMethod || ""] ||
        order.paymentMethod ||
        "-"
      }`,
      48,
      y + 22
    )
    .text(
      `Status: ${
        paymentStatusLabels[order.paymentStatus || ""] ||
        order.paymentStatus ||
        "-"
      }`,
      48,
      y + 40
    )
    .text(
      `Order status: ${statusLabels[order.status || ""] || order.status || "-"}`,
      48,
      y + 58
    );

  doc.y = y + 88;
}

function drawSummaryRow(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  label: string,
  value: number
) {
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#64748B")
    .text(label, x, y, { width: 105 });
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#070B2A")
    .text(formatMoney(value), x + 115, y, { width: 132, align: "right" });
}

function drawFooter(doc: PDFKit.PDFDocument) {
  const y = doc.page.height - 72;

  doc
    .moveTo(48, y - 16)
    .lineTo(547, y - 16)
    .strokeColor("#D5EBFF")
    .stroke();
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#64748B")
    .text("Thank you for choosing Packora.", 48, y, {
      width: 499,
      align: "center",
    });
}

function formatMoney(value: number) {
  return `${moneyFormatter.format(value)} SAR`;
}
