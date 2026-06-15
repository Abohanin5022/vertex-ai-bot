import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const merchant = await prisma.user.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!merchant) {
    throw new Error("Create a merchant user before seeding products.");
  }

  await prisma.product.createMany({
    data: [
      {
        name: "صحون بلاستيك أبيض",
        category: "صحون",
        price: 12,
        stock: 120,
        image:
          "https://images.unsplash.com/photo-1585032226651-759b368d7246",
        userId: merchant.id,
      },
      {
        name: "علب طعام شفافة",
        category: "علب",
        price: 18,
        stock: 80,
        image:
          "https://images.unsplash.com/photo-1603190287605-e6ade32fa852",
        userId: merchant.id,
      },
      {
        name: "أكواب بلاستيك",
        category: "أكواب",
        price: 9,
        stock: 220,
        image:
          "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd",
        userId: merchant.id,
      },
      {
        name: "أكياس تغليف",
        category: "أكياس",
        price: 22,
        stock: 150,
        image:
          "https://images.unsplash.com/photo-1586075010923-2dd4570fb338",
        userId: merchant.id,
      },
    ],
  });

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
