const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Homepage.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace framer-motion import
content = content.replace(
  "import { motion } from 'framer-motion'",
  "import gsap from 'gsap'\nimport { useGSAP } from '@gsap/react'\nimport { ScrollTrigger } from 'gsap/ScrollTrigger'\n\ngsap.registerPlugin(ScrollTrigger)"
);

// Add container ref & GSAP logic top of HomePage
let gsapLogic = `  const container = useRef(null)

  useGSAP(() => {
    // Hero entry
    gsap.from('.hero-container', { opacity: 0, y: 20, duration: 1, ease: 'power3.out' })
    
    // Feature bar stagger
    gsap.from('.feature-item', {
      scrollTrigger: { trigger: '.feature-container', start: 'top 90%' },
      y: 30, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)'
    })

    // Categories stagger
    gsap.from('.category-btn', {
      scrollTrigger: { trigger: '.categories-section', start: 'top 85%' },
      y: 40, opacity: 0, stagger: 0.05, duration: 0.6, ease: 'power2.out'
    })

    // Filtered Products
    gsap.from('.product-card', {
      scrollTrigger: { trigger: '.products-grid', start: 'top 90%' },
      y: 30, opacity: 0, scale: 0.95, stagger: 0.05, duration: 0.5, ease: 'power2.out'
    })

    // Top brands stagger
    gsap.from('.brand-pill', {
      scrollTrigger: { trigger: '.brands-section', start: 'top 90%' },
      y: 20, opacity: 0, stagger: 0.05, duration: 0.5, ease: 'power2.out'
    })

    // Double Banner
    gsap.from('.top-deal-card', {
      scrollTrigger: { trigger: '.top-deals-section', start: 'top 85%' },
      scale: 0.9, opacity: 0, stagger: 0.2, duration: 0.8, ease: 'power3.out'
    })

    // Why Choose Us
    gsap.from('.why-choose-us-card', {
      scrollTrigger: { trigger: '.why-choose-us-section', start: 'top 85%' },
      y: 30, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out'
    })

    // Testimonials & Newsletter
    gsap.from('.testimonial-card', {
      scrollTrigger: { trigger: '.testimonials-section', start: 'top 85%' },
      x: -50, opacity: 0, stagger: 0.2, duration: 0.6, ease: 'power2.out'
    })
    gsap.from('.newsletter-card', {
      scrollTrigger: { trigger: '.testimonials-section', start: 'top 85%' },
      x: 50, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.2
    })
  }, { scope: container, dependencies: [filteredProducts, categoryParam] })

  // Slide content animation (text inside hero)
  useGSAP(() => {
    gsap.from('.slide-content h1, .slide-content p, .slide-content div', {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', clearProps: 'all'
    })
  }, { scope: container, dependencies: [currentSlide] })
`;

content = content.replace("  const { products } = useProducts()", gsapLogic + "\n  const { products } = useProducts()");

// Hook ref to root
content = content.replace('<div className="bg-gray-50 min-h-screen">', '<div className="bg-gray-50 min-h-screen" ref={container}>');

// Replace Hero Slider motion wrapper
content = content.replace(
  /<motion\.div[\s\S]*?className="relative h-\[420px\] md:h-\[500px\] overflow-hidden group"/, 
  '<div className="relative h-[420px] md:h-[500px] overflow-hidden group hero-container"'
);
content = content.replace(
  '        {/* Slides */}\n        {bannerSlides',
  '        {/* Slides */}\n        {bannerSlides'
); // Just making sure the div replacement is localized. Actually, let's just do a specific string replace:
content = content.replace(
  /<motion\.div\n\s+initial=\{\{ opacity: 0, y: 20 \}\}\n\s+animate=\{\{ opacity: 1, y: 0 \}\}\n\s+transition=\{\{ duration: 0.8, ease: "easeOut" \}\}\n\s+className="relative h-\[420px\] md:h-\[500px\] overflow-hidden group"\n\s+>/,
  '<div className="relative h-[420px] md:h-[500px] overflow-hidden group hero-container">'
);
content = content.replace(/(?<=<\!-- Dot Indicators -->[\s\S]*?<\/div>\n\s+)<\/motion\.div>/, '      </div>');

// Add slide-content class to the inside of hero slide
content = content.replace('<div className="px-8 md:px-16 max-w-2xl">', '<div className="px-8 md:px-16 max-w-2xl slide-content">');

// Features bar (add class)
content = content.replace('<div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">', '<div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 feature-container">');
content = content.replace(
  '            <div key={i} className="flex items-center gap-3 p-2">',
  '            <div key={i} className="flex items-center gap-3 p-2 feature-item">'
);

// Categories section (Replace motion wrapper)
content = content.replace(
  /<motion\.div\n\s+initial="hidden"\n\s+whileInView="visible"\n\s+viewport=\{\{ once: true, margin: "-50px" \}\}\n\s+variants=\{\{\n\s+hidden: \{ opacity: 0 \},\n\s+visible: \{ opacity: 1, transition: \{ staggerChildren: 0.1 \} \}\n\s+\}\}\n\s+className="grid grid-cols-3 md:grid-cols-7 gap-3"\n\s+>/,
  '<div className="grid grid-cols-3 md:grid-cols-7 gap-3 categories-section">'
);
content = content.replace(/(?<=<p className=\{`text-xs font-bold text-center py-2[\s\S]*?<\/p>\n\s+)<\/motion\.button>/g, '</button>');
content = content.replace(
  /<motion\.button\n\s+variants=\{\{[\s\S]*?\}\}\n\s+key=\{cat\.name\}\n\s+onClick=\{\(\) => handleCategoryClick\(cat\.name\)\}\n\s+className=\{`\$\{cat\.color\} rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105\n\s+\$\{categoryParam === cat\.name \? 'ring-2 ring-\[#F97316\] ring-offset-2 scale-105' : ''\}`\}/g,
  '<button\n              key={cat.name}\n              onClick={() => handleCategoryClick(cat.name)}\n              className={`category-btn ${cat.color} rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105\n                ${categoryParam === cat.name ? \'ring-2 ring-[#F97316] ring-offset-2 scale-105\' : \'\'}`}'
);

// We still need to replace the closing </motion.div> for categories.
content = content.replace('          </motion.div>\n      </div>\n\n      {/* Featured Products */}', '          </div>\n      </div>\n\n      {/* Featured Products */}');


// Products section
content = content.replace(
  /<motion\.div\n\s+initial="hidden"\n\s+animate="visible"\n\s+variants=\{\{\n\s+hidden: \{ opacity: 0 \},\n\s+visible: \{ opacity: 1, transition: \{ staggerChildren: 0.05 \} \}\n\s+\}\}\n\s+className="grid grid-cols-2 md:grid-cols-4 gap-4"\n\s+>/,
  '<div className="grid grid-cols-2 md:grid-cols-4 gap-4 products-grid">'
);

content = content.replace(
  /<motion\.div\n\s+variants=\{\{\n\s+hidden: \{ opacity: 0, scale: 0\.95 \},\n\s+visible: \{ opacity: 1, scale: 1 \}\n\s+\}\}\n\s+key=\{product\.id\}\n\s+className="relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group hover:-translate-y-1"/g,
  '<div\n                key={product.id}\n                className="product-card relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group hover:-translate-y-1"'
);

content = content.replace(/(?<=<\/button>\n\s+<\/div>\n\s+)<\/motion\.div>/g, '              </div>');
content = content.replace(/(?<=<\/div>\n\s+)<\/motion\.div>\n\s+\)}\n\s+<\/div>/, '          </div>\n        )}\n      </div>');


// Trusted brands
content = content.replace('        <div className="flex flex-wrap justify-center gap-6">', '        <div className="flex flex-wrap justify-center gap-6 brands-section">');
content = content.replace('className="bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 rounded-2xl px-6 py-3 text-sm font-black text-gray-500 hover:text-[#F97316] cursor-pointer hover:-translate-y-0.5"', 'className="brand-pill bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 rounded-2xl px-6 py-3 text-sm font-black text-gray-500 hover:text-[#F97316] cursor-pointer hover:-translate-y-0.5"');

// Double banner
content = content.replace('      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">', '      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 top-deals-section">');
content = content.replace(/className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-\[#1E3A5F\] to-\[#2d6aad\] p-8 flex flex-col justify-between min-h-\[180px\]"/g, 'className="top-deal-card relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E3A5F] to-[#2d6aad] p-8 flex flex-col justify-between min-h-[180px]"');
content = content.replace(/className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 p-8 flex flex-col justify-between min-h-\[180px\]"/g, 'className="top-deal-card relative rounded-3xl overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 p-8 flex flex-col justify-between min-h-[180px]"');

// Why Choose Us
content = content.replace('        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">', '        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 why-choose-us-section">');
content = content.replace('            <div key={f.title} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-50 hover:border-orange-100 transition-all hover:-translate-y-0.5 text-center">', '            <div key={f.title} className="why-choose-us-card bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-50 hover:border-orange-100 transition-all hover:-translate-y-0.5 text-center">');

// Testimonials & Newsletter
content = content.replace('      <div className="mt-14 mb-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">', '      <div className="mt-14 mb-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch testimonials-section">');
content = content.replace('            <div key={t.name} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-50 flex gap-4 items-start hover:shadow-md transition-all">', '            <div key={t.name} className="testimonial-card bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-50 flex gap-4 items-start hover:shadow-md transition-all">');
content = content.replace('        <div className="bg-gradient-to-br from-[#1E3A5F] via-[#2d5a8e] to-[#1E3A5F] rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden">', '        <div className="newsletter-card bg-gradient-to-br from-[#1E3A5F] via-[#2d5a8e] to-[#1E3A5F] rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden">');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Homepage.jsx updated');
