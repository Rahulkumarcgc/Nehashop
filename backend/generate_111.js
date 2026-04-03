const fs = require('fs');

const categories = [
  { name: 'Electronics', brands: ['Apple', 'Samsung', 'Sony', 'LG', 'Bose'], images: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500', products: ['Smartphone', 'Laptop', 'Smartwatch', 'Headphones', 'Tablet', 'Monitor', 'Camera', 'Speaker', 'Router', 'Power Bank', 'Charger'] },
  { name: 'Beauty', brands: ['Loreal', 'Maybelline', 'MAC', 'Clinique', 'Olay'], images: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500', products: ['Lipstick', 'Foundation', 'Moisturizer', 'Mascara', 'Eyeliner', 'Perfume', 'Body Lotion', 'Face Wash', 'Hair Serum', 'Sunscreen'] },
  { name: 'Furniture', brands: ['IKEA', 'Ashley', 'West Elm', 'Wayfair', 'Herman Miller'], images: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500', products: ['Sofa', 'Dining Table', 'Office Chair', 'Bed Frame', 'Bookshelf', 'Coffee Table', 'TV Stand', 'Wardrobe', 'Nightstand', 'Recliner'] },
  { name: 'Toys', brands: ['LEGO', 'Hasbro', 'Mattel', 'Fisher-Price', 'Nerf'], images: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500', products: ['Building Blocks', 'Action Figure', 'Board Game', 'Puzzle', 'Doll', 'RC Car', 'Plush Toy', 'Water Gun', 'Educational Kit', 'Yo-Yo'] },
  { name: 'Pets', brands: ['Pedigree', 'Purina', 'Whiskas', 'KONG', 'Blue Buffalo'], images: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500', products: ['Dog Food', 'Cat Litter', 'Chew Toy', 'Pet Bed', 'Aquarium Filter', 'Bird Cage', 'Scratching Post', 'Dog Leash', 'Flea Collar', 'Pet Carrier'] },
  { name: 'Office', brands: ['Pilot', '3M', 'HP', 'Epson', 'Logitech'], images: 'https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=500', products: ['Printer Paper', 'Gel Pens', 'Sticky Notes', 'Stapler', 'Desk Organizer', 'Whiteboard', 'Shredder', 'Filing Cabinet', 'Highlighters', 'Desk Lamp'] },
  { name: 'Tools', brands: ['DeWalt', 'Makita', 'Bosch', 'Stanley', 'Craftsman'], images: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500', products: ['Power Drill', 'Hammer', 'Screwdriver Set', 'Tape Measure', 'Wrench', 'Pliers', 'Saw', 'Toolbox', 'Utility Knife', 'Level'] },
  { name: 'Groceries', brands: ['Nestle', 'Kelloggs', 'Coca-Cola', 'Kraft', 'Heinz'], images: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500', products: ['Coffee Beans', 'Cereal', 'Olive Oil', 'Pasta', 'Oats', 'Green Tea', 'Honey', 'Almonds', 'Peanut Butter', 'Dark Chocolate'] },
  { name: 'Automotive', brands: ['Michelin', 'Castrol', 'Meguiars', 'Bosch', 'Armor All'], images: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=500', products: ['Motor Oil', 'Car Wax', 'Wiper Blades', 'Air Freshener', 'Floor Mats', 'Jumper Cables', 'Tire Inflator', 'Car Cover', 'Dash Cam', 'Phone Mount'] },
  { name: 'Health', brands: ['Optimum Nutrition', 'GNC', 'Nature Made', 'Centrum', 'Theragun'], images: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500', products: ['Multivitamins', 'Protein Powder', 'Massage Gun', 'Blood Pressure Monitor', 'Heating Pad', 'First Aid Kit', 'Fish Oil', 'Thermometer', 'Knee Brace', 'Yoga Block'] },
  { name: 'Garden', brands: ['Scotts', 'Miracle-Gro', 'Fiskars', 'Weber', 'Greenworks'], images: 'https://images.unsplash.com/photo-1416879598555-220b8b64eaf5?w=500', products: ['Lawn Mower', 'Pruning Shears', 'Garden Hose', 'BBQ Grill', 'Potting Soil', 'Plant Fertilizer', 'Shovel', 'Watering Can', 'Patio Umbrella', 'Hammock'] }
];

const outputLines = [];
let idCounter = 1;

categories.forEach((catObj, cIdx) => {
  catObj.products.forEach((prodName, pIdx) => {
    let id = `prod_${idCounter.toString().padStart(3, '0')}`;
    idCounter++;
    
    let brand = catObj.brands[pIdx % catObj.brands.length];
    let price = Math.floor(Math.random() * 5000) + 500; 
    let oldPrice = price + Math.floor(Math.random() * 1000) + 100;
    let rating = (4.0 + Math.random() * 0.9).toFixed(1);
    let isFeatured = Math.random() > 0.8;
    let desc = `Premium quality ${catObj.name.toLowerCase()} product for daily use.`;
    
    let tuple = `('${id}', '${prodName}', '${brand}', ${price}, ${oldPrice}, '${catObj.images}', ${rating}, '${catObj.name}', '${desc}', ${isFeatured}, NOW())`;
    outputLines.push(tuple);
  });
});

const prefix = `INSERT INTO "Product" (
  "id", "name", "brand", "price", "oldPrice", "image", "rating", "category", "description", "isFeatured", "updatedAt"
) VALUES`;

const finalSQL = prefix + '\n' + outputLines.join(',\n') + ';';
fs.writeFileSync('output_artifact_111.md', '```sql\n' + finalSQL + '\n```');
