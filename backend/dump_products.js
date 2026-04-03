const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    take: 500,
    orderBy: { numericId: 'desc' }
  });

  let sql = 'INSERT INTO "Product" ("id", "numericId", "name", "price", "oldPrice", "description", "category", "image", "rating", "brand", "stock", "isFeatured", "createdAt", "updatedAt") VALUES \n';
  
  const escapeString = (str) => {
    if (str === null || str === undefined) return 'NULL';
    return "'" + str.replace(/'/g, "''") + "'";
  };

  const values = products.map(p => {
    return `(${escapeString(p.id)}, ${p.numericId}, ${escapeString(p.name)}, ${p.price}, ${p.oldPrice}, ${escapeString(p.description)}, ${escapeString(p.category)}, ${escapeString(p.image)}, ${p.rating}, ${escapeString(p.brand)}, ${p.stock}, ${p.isFeatured ? 'true' : 'false'}, ${escapeString(p.createdAt.toISOString())}, ${escapeString(p.updatedAt.toISOString())})`;
  });

  sql += values.join(',\n') + ';';

  fs.writeFileSync('c:/Users/91620/Desktop/nehashop/backend/products_dump.sql', sql);
  console.log('SQL dump created successfully!');
}

main().finally(() => prisma.$disconnect());
