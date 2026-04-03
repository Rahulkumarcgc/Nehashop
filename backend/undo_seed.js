const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Reversing the 1,000 massively seeded products...');
  
  try {
    const result = await prisma.product.deleteMany({
      where: {
        id: {
          startsWith: 'prod_'
        }
      }
    });
    console.log(`✅ Success! Removed ${result.count} seeded products from the database. The inventory is back to its original state.`);
  } catch (error) {
    console.error('Failed to undo seed:', error);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
