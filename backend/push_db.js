require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      // Adding a longer connect timeout for serverless wake-up delays
      url: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'connect_timeout=60&pool_timeout=60'
    }
  }
});

async function main() {
  const jsonPath = 'C:/Users/91620/Downloads/Product.json';
  if (!fs.existsSync(jsonPath)) throw new Error('Product.json not found!');
  
  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${rawData.length} products to push...`);

  console.log('Connecting to Neon DB (Make take up to 30s to wake up)...');
  
  // Test connection with retry for sleepy databases
  for (let i = 0; i < 5; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Connected to database successfully!');
      break;
    } catch (e) {
      console.log(`Connection attempt ${i+1} failed. Retrying in 5 seconds...`);
      await new Promise(r => setTimeout(r, 5000));
      if (i === 4) throw e;
    }
  }

  console.log('Clearing old products (Except numericId 1 to 10)...');
  // Delete related items first to satisfy foreign key constraints, STRICTLY WHERE numericId > 10
  await prisma.review.deleteMany({ where: { product: { numericId: { gt: 10 } } } });
  await prisma.wishlistItem.deleteMany({ where: { product: { numericId: { gt: 10 } } } });
  await prisma.cartItem.deleteMany({ where: { product: { numericId: { gt: 10 } } } });
  await prisma.orderItem.deleteMany({ where: { product: { numericId: { gt: 10 } } } });
  await prisma.product.deleteMany({ where: { numericId: { gt: 10 } } });

  console.log('Filtering data from JSON (Excluding numericId 1 to 10)...');
  
  const productsToInsert = rawData
    .filter(p => !p.numericId || p.numericId > 10)
    .map(p => ({
      id: p.id.startsWith('prod_') ? p.id : `prod_${Math.floor(Math.random()*100000)}`,
      numericId: p.numericId,
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice,
      description: p.description,
      category: p.category,
      image: p.image,
      rating: p.rating,
      brand: p.brand,
      stock: p.stock,
      isFeatured: p.isFeatured
    }));

  console.log(`Pushing ${productsToInsert.length} new products to DB in batches...`);

  // Prisma createMany has a limit per query, chunk it
  const chunkSize = 200;
  for (let i = 0; i < productsToInsert.length; i += chunkSize) {
    const chunk = productsToInsert.slice(i, i + chunkSize);
    try {
      await prisma.product.createMany({
        data: chunk,
        skipDuplicates: true
      });
      console.log(`Pushed chunk ${Math.floor(i/chunkSize) + 1} (${chunk.length} products)...`);
    } catch(e) {
      console.error('Error inserting chunk:', e.message);
    }
  }

  console.log('✅ Database successfuly synchronized!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
