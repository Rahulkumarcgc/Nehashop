const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const p = await prisma.product.count();
    console.log('Products:', p);
  } catch(e) {
    console.error('ERROR_MSG:', e.message);
  }
}
main().catch(console.error).finally(()=>prisma.$disconnect());
