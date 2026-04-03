import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  try {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Product" (
        "id", "numericId", "name", "brand", "price", "oldPrice", "image", "rating", "category", "description", "updatedAt"
      ) VALUES (
        gen_random_uuid(), 
        (SELECT COALESCE(MAX("numericId"), 0) + 1 FROM "Product"),
        'Premium Smartphone Pro', 
        'Samsung', 
        89999, 
        99999, 
        'https://images.unsplash.com/photo-1598327105666-5b89351cb315?w=500', 
        4.9, 
        'Electronics', 
        'The latest incredibly powerful flagship smartphone with an insane camera and battery life.', 
        NOW()
      );
    `);
    console.log("SUCCESS!");
  } catch (e) {
    console.error("ERROR:");
    console.error(e.message);
  }
}
run();
