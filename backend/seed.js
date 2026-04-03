const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = [
  { numericId: 1, name: 'Wireless Headphones', brand: 'Sony', price: 1299, oldPrice: 2499, image: '/products/product1.jpg', rating: 4.5, category: 'Electronics', description: 'Experience pure sound with these noise-canceling wireless headphones. Features 30-hour battery life and fast charging.' },
  { numericId: 2, name: 'Running Shoes', brand: 'Nike', price: 899, oldPrice: 1799, image: '/products/product2.jpg', rating: 4.2, category: 'Sports', description: 'Lightweight and breathable running shoes designed for ultimate comfort and performance on any terrain.' },
  { numericId: 3, name: 'Smart Watch', brand: 'Apple', price: 2499, oldPrice: 4999, image: '/products/product3.jpg', rating: 4.7, category: 'Electronics', description: 'Track your fitness, heart rate, and notifications on the go with this sleek, water-resistant smartwatch.' },
  { numericId: 4, name: 'Sunglasses', brand: 'Ray-Ban', price: 499, oldPrice: 999, image: '/products/product4.jpg', rating: 4.0, category: 'Fashion', description: 'UV400 protection stylish sunglasses. Perfect for outdoor activities and elevating your everyday look.' },
  { numericId: 5, name: 'Backpack', brand: 'Puma', price: 799, oldPrice: 1499, image: '/products/product5.jpg', rating: 4.3, category: 'Fashion', description: 'Durable, weather-resistant backpack with laptop compartment and multiple pockets for all your essentials.' },
  { numericId: 6, name: 'Perfume', brand: 'Lakme', price: 649, oldPrice: 1299, image: '/products/product6.jpg', rating: 4.6, category: 'Beauty', description: 'Long-lasting premium fragrance with floral and woody notes. Perfect for evening wear and special occasions.' },
  { numericId: 7, name: 'Laptop', brand: 'Samsung', price: 999, oldPrice: 1999, image: '/products/product7.jpg', rating: 4.4, category: 'Electronics', description: 'High-performance laptop featuring a fast processor, ample storage, and a stunning HD display for work and play.' },
  { numericId: 8, name: 'Water Bottle', brand: 'Milton', price: 299, oldPrice: 599, image: '/products/product8.jpg', rating: 4.1, category: 'Sports', description: 'Stainless steel insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours.' },
]

async function main() {
  console.log('Seeding Database...');
  
  // Clear existing items in case of a retry
  await prisma.product.deleteMany({});
  
  // Insert all mock data
  for (const prod of products) {
    await prisma.product.create({ data: prod });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch(e => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
