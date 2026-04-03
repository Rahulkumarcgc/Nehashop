require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
console.log("Trying to connect to pooler...");

const url = process.env.DATABASE_URL.replace('.c-5.', '-pooler.c-5.');
const prisma = new PrismaClient({
  datasources: { db: { url: url + '&pgbouncer=true&connect_timeout=30' } }
});

async function main() {
  await prisma.$connect();
  console.log("YES CONNECTED TO POOLED URL!");
  const p = await prisma.product.findFirst();
  console.log("Product:", p ? p.name : "None");
}
main().catch(console.error).finally(()=>prisma.$disconnect());
