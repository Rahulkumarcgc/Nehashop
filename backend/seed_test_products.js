require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Supabase database with 8 modern test products...');

  const testProducts = [
    {
      id: "prod_mock_01",
      name: "Beats Studio Pro Wireless Headphones",
      description: "Experience premium sound with personalized spatial audio, active noise cancelling, and an immersive listening journey.",
      price: 349,
      oldPrice: 399,
      image: "/products/product1.jpg",
      category: "Electronics",
      rating: 4.8,
      brand: "Beats",
      stock: 45
    },
    {
      id: "prod_mock_02",
      name: "Nike Air Zoom Pegasus 40",
      description: "A springy ride for every run, the Pegasus's familiar, just-for-you feel returns to help you accomplish your goals.",
      price: 130,
      oldPrice: 150,
      image: "/products/product2.jpg",
      category: "Footwear",
      rating: 4.7,
      brand: "Nike",
      stock: 120
    },
    {
      id: "prod_mock_03",
      name: "Nordgreen Pioneer Smartwatch",
      description: "Minimalist Scandinavian design meets modern technology. Features interchangeable straps and fitness tracking.",
      price: 249,
      oldPrice: 300,
      image: "/products/product3.jpg",
      category: "Accessories",
      rating: 4.6,
      brand: "Nordgreen",
      stock: 25
    },
    {
      id: "prod_mock_04",
      name: "Ray-Ban Classic Wayfarer",
      description: "The most recognizable style in the history of sunglasses. Classic, iconic, and effortless.",
      price: 165,
      oldPrice: 180,
      image: "/products/product4.jpg",
      category: "Accessories",
      rating: 4.9,
      brand: "Ray-Ban",
      stock: 80
    },
    {
      id: "prod_mock_05",
      name: "Herschel Little America Backpack",
      description: "A popular mountaineering silhouette, elevated with modern functionality and premium materials.",
      price: 110,
      oldPrice: 130,
      image: "/products/product5.jpg",
      category: "Bags",
      rating: 4.5,
      brand: "Herschel",
      stock: 60
    },
    {
      id: "prod_mock_06",
      name: "Chanel Coco Mademoiselle",
      description: "Irresistibly sexy, irrepressibly spirited. A sparkling, bold floral-woody fragrance.",
      price: 145,
      oldPrice: 160,
      image: "/products/product6.jpg",
      category: "Beauty",
      rating: 4.9,
      brand: "Chanel",
      stock: 35
    },
    {
      id: "prod_mock_07",
      name: "MacBook Pro 16-inch M3 Max",
      description: "Mind-blowing performance, amazing battery life, and a brilliant Liquid Retina XDR display.",
      price: 3499,
      oldPrice: 3699,
      image: "/products/product7.jpg",
      category: "Electronics",
      rating: 5.0,
      brand: "Apple",
      stock: 15
    },
    {
      id: "prod_mock_08",
      name: "Owala FreeSip Water Bottle",
      description: "Insulated stainless steel bottle featuring a patented FreeSip spout with built-in straw.",
      price: 28,
      oldPrice: 32,
      image: "/products/product8.jpg",
      category: "Home",
      rating: 4.8,
      brand: "Owala",
      stock: 200
    }
  ];

  for (const product of testProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }

  console.log('✅ Successfully seeded all 8 high-quality test products!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
