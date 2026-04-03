const fs = require('fs');

async function main() {
  const sourcePath = 'C:/Users/91620/Downloads/Product.json';
  
  try {
    if (!fs.existsSync(sourcePath)) {
       console.log("File not found at", sourcePath);
       return;
    }
    const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    console.log(`Loaded ${data.length} products from JSON`);

    // Modify images
    for (let product of data) {
      if (product.name) {
        const category = product.category || 'misc';
        const encodedPrompt = encodeURIComponent(`Product photography of ${product.name}, category ${category}, minimalist white background, 4k high quality`);
        const uniqueId = String(product.numericId || product.id || Math.floor(Math.random() * 10000));
        product.image = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=600&nologo=true&seed=${uniqueId}`;
      }
    }

    fs.writeFileSync(sourcePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Successfully updated product images in Downloads/Product.json');
  } catch (e) {
    console.error('Failed to process JSON:', e);
  }
}

main();
