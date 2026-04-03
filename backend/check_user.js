const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const u = await prisma.user.findFirst();
  console.log("Logged In User:", u);
}
run().finally(() => prisma.$disconnect());
