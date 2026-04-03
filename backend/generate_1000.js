const fs = require('fs');
const path = require('path');

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

let outputLines = [];
let startNumericId = 213;

for (let i = 0; i < 1000; i++) {
  const currentId = startNumericId + i;
  const category = categories[Math.floor(Math.random() * categories.length)];
  const brand = brands[category][Math.floor(Math.random() * brands[category].length)];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[category][Math.floor(Math.random() * nouns[category].length)];
  
  const name = `${adjective} ${brand} ${noun}`;
  const price = Math.floor(Math.random() * (10000 - 100) + 100);
  const oldPrice = Math.floor(price * (1 + (Math.random() * 0.4 + 0.1))); // 10% to 50% more
  
  const image = images[Math.floor(Math.random() * images.length)];
  const rating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);
  const desc = `Experience the best of ${category.toLowerCase()} with this ${name}. Guaranteed quality and performance.`;
  const isFeatured = Math.random() > 0.8 ? 'true' : 'false';

  const idString = `'prod_${currentId.toString().padStart(3, '0')}'`;
  
  // Omit numericId as requested by the user's previous script
  let tuple = `(${idString}, '${name.replace(/'/g, "''")}', '${brand.replace(/'/g, "''")}', ${price}, ${oldPrice}, '${image}', ${rating}, '${category}', '${desc.replace(/'/g, "''")}', ${isFeatured}, NOW())`;
  
  outputLines.push(tuple);
}

const prefix = `INSERT INTO "Product" (
  "id", "name", "brand", "price", "oldPrice", "image", "rating", "category", "description", "isFeatured", "updatedAt"
) VALUES`;

const finalSQL = prefix + '\\n' + outputLines.join(',\\n') + ';';

const artifactDir = 'C:\\\\Users\\\\91620\\\\.gemini\\\\antigravity\\\\brain\\\\33a24dc9-b5d4-4a74-81d9-d25ba1b828e1\\\\artifacts';
if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
}

const outPath = path.join(artifactDir, 'products_213_to_1212.md');
fs.writeFileSync(outPath, '```sql\\n' + finalSQL + '\\n```');

console.log('Successfully generated 1000 products in ' + outPath);
