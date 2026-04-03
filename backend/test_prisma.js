const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const p = await prisma.product.findFirst();
    const u = await prisma.user.findFirst();

    if(!p || !u) {
      console.log('No product or user found', { p, u });
      return;
    }

    const review = await prisma.review.create({
      data: {
        clerkUserId: u.clerkUserId,
        productId: p.id,
        rating: 5,
        comment: 'Direct prisma test'
      }
    });
    console.log("SUCCESS:", review);
  } catch(e) {
    console.error("ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
