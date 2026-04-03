require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'connection_limit=1&pool_timeout=40'
    }
  }
});

async function main() {
  console.log('Fetching all products except our 8 test products...');
  const products = await prisma.product.findMany({
    where: {
      id: { not: { startsWith: 'prod_mock_' } }
    }
  });
  console.log(`Found ${products.length} products to update. Starting massive image update...`);

  let updatedCount = 0;
  const batchSize = 50;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    await Promise.all(batch.map(product => {
      // Create a specific, unique and relatable prompt per product
      const prompt = `Product photography of ${product.name}, category ${product.category}, minimalist white background, 4k high quality`;
      const encodedPrompt = encodeURIComponent(prompt);
      
      const uniqueUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=600&nologo=true&seed=${product.numericId}`;
      
      return prisma.product.update({
        where: { id: product.id },
        data: { image: uniqueUrl }
      });
    }));
    
    updatedCount += batch.length;
    console.log(`Updated ${updatedCount} / ${products.length} product images...`);
  }

  console.log('✅ Successfully updated all product images to unique AI-generated URLs!');
}

main()
  .catch(e => {
    console.error('ERROR MESSAGE:', e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
