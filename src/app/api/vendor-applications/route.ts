import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const application = await prisma.vendorApplication.create({
    data: {
      name: String(body.name || ""),
      email: body.email ? String(body.email) : null,
      phone: String(body.phone || ""),
      city: String(body.city || ""),
      category: String(body.category || ""),
      notes: body.notes ? String(body.notes) : null,
      tempPassword: "Packora@12345",
    },
  });

  return NextResponse.json(application);
}
