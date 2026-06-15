import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "يرجى رفع صورة فقط" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "حجم الصورة يجب أن يكون أقل من 4MB" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const extension = path.extname(file.name).toLowerCase() || ".png";
  const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const filepath = path.join(uploadDir, filename);

  await writeFile(filepath, buffer);

  return NextResponse.json({
    url: `/uploads/logos/${filename}`,
  });
}
