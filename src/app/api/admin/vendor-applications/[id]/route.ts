import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { getUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";

type ActionPayload = {
  action?: "accept" | "reject";
};

function fallbackEmail(id: string) {
  return `vendor-${id.slice(0, 8)}@packora.local`;
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueStoreSlug(base: string) {
  const normalized = normalizeSlug(base) || "store";
  let slug = normalized;
  let index = 2;

  while (await prisma.user.findUnique({ where: { storeSlug: slug } })) {
    slug = `${normalized}-${index}`;
    index += 1;
  }

  return slug;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getUser();

  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await req.json()) as ActionPayload;

  if (body.action !== "accept" && body.action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const application = await prisma.vendorApplication.findUnique({
    where: { id },
  });

  if (!application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  if (body.action === "reject") {
    const rejected = await prisma.vendorApplication.update({
      where: { id },
      data: { status: "rejected" },
    });

    return NextResponse.json(rejected);
  }

  const email = application.email || fallbackEmail(application.id);
  const tempPassword = application.tempPassword || "Packora@12345";
  const hashedPassword = await hashPassword(tempPassword);
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  const storeSlug =
    existingUser?.storeSlug || (await uniqueStoreSlug(application.name));

  await prisma.user.upsert({
    where: { email },
    create: {
      name: application.name,
      email,
      password: hashedPassword,
      role: "merchant",
      isActive: true,
      storeName: application.name,
      storeSlug,
      storeCity: application.city,
      storeDescription: application.notes,
    },
    update: {
      name: application.name,
      role: "merchant",
      isActive: true,
      storeName: existingUser?.storeName || application.name,
      storeSlug,
      storeCity: existingUser?.storeCity || application.city,
      storeDescription: existingUser?.storeDescription || application.notes,
    },
  });

  const accepted = await prisma.vendorApplication.update({
    where: { id },
    data: {
      status: "accepted",
      email,
      tempPassword,
    },
  });

  return NextResponse.json(accepted);
}
