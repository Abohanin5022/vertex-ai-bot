import { randomUUID } from "crypto";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const allowedExtensions = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
]);

function getSafeExtension(filename: string, type: string) {
  const ext = path.extname(filename).toLowerCase();

  if (allowedExtensions.has(ext)) {
    return ext;
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
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "products"
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
      url: `/uploads/products/${filename}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
