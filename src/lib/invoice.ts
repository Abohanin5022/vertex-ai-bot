import PDFDocument from "pdfkit";

type InvoiceOrder = {
  id?: string;
  customer: string;
  phone: string;
  city: string;
  address?: string | null;
  total: number;
  status?: string;
  createdAt?: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
};

const statusLabels: Record<string, string> = {
  pending: "New",
  processing: "Processing",
  shipped: "Ready to ship",
  completed: "Completed",
  cancelled: "Cancelled",
};

export async function generateInvoice(order: InvoiceOrder) {
  const doc = new PDFDocument({
    margin: 48,
    size: "A4",
  });

  const chunks: Uint8Array[] = [];

  doc.on("data", (chunk) => {
    chunks.push(chunk);
  });

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.fontSize(24).fillColor("#070B2A").text("Packora Invoice");
    doc
      .fontSize(10)
      .fillColor("#64748B")
      .text(`Invoice ID: ${order.id ? order.id.slice(0, 8) : "N/A"}`);

    doc.moveDown(1.5);

    doc.fontSize(12).fillColor("#070B2A").text(`Customer: ${order.customer}`);
    doc.text(`Phone: ${order.phone}`);
    doc.text(`City: ${order.city}`);

    if (order.address) {
      doc.text(`Address: ${order.address}`);
    }

    if (order.createdAt) {
      doc.text(`Date: ${order.createdAt.toLocaleString("en-SA")}`);
    }

    if (order.status) {
      doc.text(`Status: ${statusLabels[order.status] || order.status}`);
    }

    doc.moveDown();
    doc.moveTo(48, doc.y).lineTo(545, doc.y).strokeColor("#D5EBFF").stroke();
    doc.moveDown();

    doc.fontSize(13).fillColor("#070B2A").text("Items", { underline: true });
    doc.moveDown(0.5);

    order.items.forEach((item, index) => {
      const lineTotal = item.price * item.quantity;

      doc
        .fontSize(11)
        .fillColor("#070B2A")
        .text(`${index + 1}. ${item.name}`);
      doc
        .fontSize(10)
        .fillColor("#64748B")
        .text(
          `Quantity: ${item.quantity} | Unit Price: ${item.price.toFixed(
            2
          )} ﷼ | Total: ${lineTotal.toFixed(2)} ﷼`
        );
      doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.moveTo(48, doc.y).lineTo(545, doc.y).strokeColor("#D5EBFF").stroke();
    doc.moveDown();

    doc
      .fontSize(18)
      .fillColor("#1766E8")
      .text(`Grand Total: ${order.total.toFixed(2)} ﷼`, {
        align: "right",
      });

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor("#64748B")
      .text("Thank you for choosing Packora.", {
        align: "center",
      });

    doc.end();
  });
}
