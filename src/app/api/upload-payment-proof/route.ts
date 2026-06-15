import { randomUUID } from "crypto";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const allowedTypes = new Set([
  "application/pdf",
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const allowedExtensions = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".pdf",
  ".png",
  ".webp",
]);

function getSafeExtension(filename: string, type: string) {
  const ext = path.extname(filename).toLowerCase();

  if (allowedExtensions.has(ext)) {
    return ext;
  }

  if (type === "application/pdf") {
    return ".pdf";
  }

  if (type === "image/png") {
    return ".png";
  }

  if (type === "image/webp") {
    return ".webp";
  }

  if (type === "image/gif") {
    return ".gif";
  }

  return ".jpg";
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "No file uploaded" },
      { status: 400 }
    );
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json(
      { error: "Only image or PDF files are allowed" },
      { status: 400 }
    );
  }

  const maxSize = 8 * 1024 * 1024;

  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "File size must be 8MB or less" },
      { status: 400 }
    );
  }

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "payment-proofs"
  );

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const extension = getSafeExtension(file.name, file.type);
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const filepath = path.join(uploadDir, filename);
  const bytes = await file.arrayBuffer();

  await writeFile(filepath, Buffer.from(bytes));

  return NextResponse.json({
    url: `/uploads/payment-proofs/${filename}`,
  });
}
