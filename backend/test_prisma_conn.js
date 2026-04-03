const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({ take: 1 });
    console.log('Success:', products);
  } catch (e) {
    console.error('Stack:', e.stack);
    console.error('Message:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
