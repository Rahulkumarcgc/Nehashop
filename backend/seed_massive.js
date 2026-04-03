const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = ['Electronics', 'Fashion', 'Grocery', 'Home', 'Sports', 'Beauty'];
const brands = {
  Electronics: ['Sony', 'Samsung', 'Apple', 'LG', 'Dell', 'HP', 'Asus', 'Razer'],
  Fashion: ['Nike', 'Adidas', 'Puma', 'Levis', 'Zara', 'H&M', 'Gucci', 'Prada'],
  Grocery: ['Nestle', 'Lays', 'Kelloggs', 'Britannia', 'Amul', 'Tropicana', 'Oreo'],
  Home: ['IKEA', 'Philips', 'Dyson', 'Bombay Dyeing', 'Prestige', 'Bajaj', 'Havells'],
  Sports: ['Wilson', 'Yonex', 'Nivia', 'Spalding', 'Decathlon', 'Cosco', 'Grip'],
  Beauty: ['Lakme', 'Loreal', 'Maybelline', 'MAC', 'Clinique', 'Dove', 'Nivea']
};

const adjectives = ['Premium', 'Advanced', 'Ultra', 'Pro', 'Classic', 'Sleek', 'Durable', 'Essential', 'Luxury', 'Smart'];
const nouns = {
  Electronics: ['Headphones', 'Laptop', 'Smartphone', 'Tablet', 'Monitor', 'Speaker', 'Mouse', 'Keyboard'],
  Fashion: ['T-Shirt', 'Jeans', 'Sneakers', 'Jacket', 'Watch', 'Sunglasses', 'Backpack', 'Dress'],
  Grocery: ['Coffee', 'Snacks', 'Cereal', 'Biscuits', 'Juice', 'Chocolate', 'Tea', 'Nuts'],
  Home: ['Lamp', 'Vase', 'Cushion', 'Blanket', 'Blender', 'Mixer', 'Fan', 'Heater'],
  Sports: ['Racket', 'Ball', 'Bat', 'Mat', 'Gloves', 'Dumbbell', 'Rope', 'Helmet'],
  Beauty: ['Lipstick', 'Foundation', 'Perfume', 'Lotion', 'Serum', 'Mascara', 'Cream', 'Scrub']
};

const images = [
  '/products/product1.jpg',
  '/products/product2.jpg',
  '/products/product3.jpg',
  '/products/product4.jpg',
  '/products/product5.jpg',
  '/products/product6.jpg',
  '/products/product7.jpg',
  '/products/product8.jpg'
];

async function main() {
  console.log('Generating 1,000 randomized products...');
  const newProducts = [];
  let startId = 213;

  for (let i = 0; i < 1000; i++) {
    const currentId = startId + i;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const brand = brands[category][Math.floor(Math.random() * brands[category].length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[category][Math.floor(Math.random() * nouns[category].length)];
    
    const name = `${adjective} ${brand} ${noun}`;
    const price = Math.floor(Math.random() * (10000 - 100) + 100);
    const oldPrice = Math.floor(price * (1 + (Math.random() * 0.4 + 0.1)));
    
    const image = images[Math.floor(Math.random() * images.length)];
    const rating = parseFloat((Math.random() * (5.0 - 3.5) + 3.5).toFixed(1));
    const desc = `Experience the best of ${category.toLowerCase()} with this ${name}. Guaranteed quality and performance.`;
    const isFeatured = Math.random() > 0.8;

    newProducts.push({
      id: `prod_${currentId.toString().padStart(3, '0')}`,
      name,
      brand,
      price,
      oldPrice,
      image,
      rating,
      category,
      description: desc,
      isFeatured,
      stock: 100
    });
  }

  console.log('Inserting into database safely via Prisma...');
  
  try {
    const result = await prisma.product.createMany({
      data: newProducts,
      skipDuplicates: true
    });
    console.log(`✅ Success! Inserted ${result.count} new products into the database.`);
  } catch (error) {
    console.error('Failed to seed:', error);
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
