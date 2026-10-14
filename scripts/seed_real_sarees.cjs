const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'sahjanand.db');
const db = new Database(dbPath);

console.log('Seeding Real-World Sarees from 4K Photographs...');

db.pragma('foreign_keys = OFF');

// Clear existing products and re-seed with authentic 4K saree collection
db.prepare('DELETE FROM products').run();

const insertProduct = db.prepare(`
  INSERT INTO products (
    product_code, qr_identifier, name, category, collection, fabric_composition,
    base_fabric_type, gsm, fabric_width, saree_length, base_colour, base_colour_hex,
    pattern_description, border_type, pallu_design, weave_type, base_price, moq,
    lead_time_days, status, hero_image, border_image, pallu_image, close_up_image,
    demo_video_url, notes
  ) VALUES (
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?
  )
`);

const realProducts = [
  [
    'SP-MEENA-01',
    'QR-SP-MEENA01',
    'Surat Heritage Royal Crimson Meenakari Silk Saree',
    'Bridal & Festive Weaves',
    'Virasat Couture Silk Collection',
    'Pure High-Twist Georgette Poly-Silk Warp x Fine Resham Weft (100D/80D)',
    'Heavy Jacquard Brocade with Meenakari Inlay',
    195,
    '44 inches (112 cm)',
    '6.30 meters (includes 80cm unstitched blouse piece)',
    'Deep Crimson Maroon',
    '#7B1113',
    'Authentic royal saree featuring exquisite circular gold zari medallions with pink meenakari floral inlay and an opulent scalloped embroidered border with delicate beadwork.',
    '4.5-inch Heavy Scalloped Zari Embroidered Border with Fine Resham Work',
    'Rich Kadwa Meenakari Floral Pallu with Scalloped Edge Finish',
    'Surat Electronic Jacquard Loom with Precision Meenakari Weave',
    3450.0,
    10,
    10,
    'active',
    '/assets/products/model-crimson-runway.jpg', // 4K International Model Runway
    '/assets/products/saree-crimson-meenakari-real.jpg', // Authentic 4K Saree Photo
    '/assets/products/saree-crimson-meenakari-real.jpg',
    '/assets/products/saree-crimson-meenakari-real.jpg',
    '/assets/videos/saree-traditional-drape.webm',
    'Master bridal collection. Ultra-high definition real product photography with international model runway demonstration.'
  ],
  [
    'SP-INDIGO-02',
    'QR-SP-INDIGO02',
    'Royal Indigo Purple Elephant Medallion Brocade Saree',
    'Heritage Royal Weaves',
    'Rajwadi Brocade Series',
    'High-Density Poly-Silk Warp x Pure Metallic Tested Zari Weft (120D/75D)',
    'Brocade Satin Weave with Embossed Zari Medallions',
    205,
    '45 inches (114 cm)',
    '6.30 meters (includes 80cm unstitched blouse piece)',
    'Royal Peacock Blue',
    '#2E1065',
    'Stunning royal indigo-purple silk saree featuring embossed circular gold zari medallions with majestic elephant (Hathi / Kunjar) motifs and a regal multi-layered border.',
    '5-inch Traditional Temple Gopuram & Floral Vine Zari Border',
    'Grand Elephant & Kalpavriksha Master Brocade Pallu',
    'High-Speed Jacquard Loom with Embossed Zari Jacquard',
    3250.0,
    12,
    12,
    'active',
    '/assets/products/model-indigo-runway.jpg', // 4K International Model Runway
    '/assets/products/saree-stack-5colors.jpg', // Authentic 4K Saree Flatlay
    '/assets/products/saree-stack-5colors.jpg',
    '/assets/products/saree-stack-5colors.jpg',
    '/assets/videos/saree-weaving-loom.webm',
    'Heirloom quality royal purple. Tested gold zari ensures brilliant shine under ambient and showroom lighting.'
  ],
  [
    'SP-RANI-03',
    'QR-SP-RANI03',
    'Vibrant Rani Pink Scalloped Zari Silk Saree',
    'Festive Brocade',
    'Utsav Celebration Series',
    'Premium Poly-Silk Warp x Dual-Tone Resham & Gold Zari Weft',
    'Soft Lustrous Poly-Silk Brocade Weave',
    180,
    '44 inches (112 cm)',
    '6.30 meters (includes 80cm unstitched blouse piece)',
    'Rani Magenta Pink',
    '#BE185D',
    'Vibrant Rani Pink festive silk saree adorned with all-over elephant and floral boota zari motifs, paired with an intricate handcrafted scalloped border.',
    '4-inch Scalloped Cutwork Floral Zari Border with Hand Pearls',
    'Intricate Kadwa Floral Boota Pallu with Gold Zari Finishing',
    'Surat High-Precision Jacquard Weave',
    2950.0,
    15,
    8,
    'active',
    '/assets/products/model-rani-pink-runway.jpg', // 4K International Model Runway
    '/assets/products/saree-stack-5colors.jpg', // Authentic 4K Saree Flatlay
    '/assets/products/saree-stack-5colors.jpg',
    '/assets/products/saree-stack-5colors.jpg',
    '/assets/videos/saree-handloom-weaving.webm',
    'Best-seller for weddings and festive retail across Gujarat, Maharashtra, and North India.'
  ],
  [
    'SP-GOLD-04',
    'QR-SP-GOLD04',
    'Imperial Mustard Gold Peacock Brocade Silk Saree',
    'Traditional Classic',
    'Parampara Heritage Collection',
    'Micro-Filament Poly-Silk x Antique Gold Zari Weft',
    'Rich Kanjivaram-style Heavy Jacquard Brocade',
    215,
    '45 inches (114 cm)',
    '6.30 meters (includes 80cm unstitched blouse piece)',
    'Imperial Mustard Gold',
    '#C68B19',
    'Majestic warm mustard orange-gold silk saree with sacred Mayil (Peacock) embossed medallions and rich antique gold zari borders.',
    '5.5-inch Heavy Peacock & Mayil Contrast Zari Border',
    'Grand Temple Architectural Brocade Pallu',
    '3-Ply Warp Korvai Interlocking Jacquard Weave',
    3150.0,
    10,
    10,
    'active',
    '/assets/products/model-mustard-gold-runway.jpg', // 4K International Model Runway
    '/assets/products/saree-stack-5colors.jpg',
    '/assets/products/saree-stack-5colors.jpg',
    '/assets/products/saree-stack-5colors.jpg',
    '/assets/videos/saree-weaving-loom.webm',
    'Warm radiant luster. Highly favored for puja, morning rituals, and auspicious occasions.'
  ],
  [
    'SP-TEAL-05',
    'QR-SP-TEAL05',
    'Deep Peacock Teal Green Antique Zari Silk Saree',
    'Exclusive Couture',
    'Aarambh Luxury Series',
    'High-Twist Poly-Silk Warp x Fine Resham Silk Accent (110D/75D)',
    'Fine Satin Brocade with Antique Matte Zari',
    190,
    '44 inches (112 cm)',
    '6.30 meters (includes 80cm unstitched blouse piece)',
    'Emerald Forest Green',
    '#0F766E',
    'Sophisticated peacock teal green silk saree with dancing peacock motifs in dual gold-silver zari and heavy ornamental pallu work.',
    '4.5-inch Regal Antique Gold Zari Border with Floral Jaal',
    'Heavy Kadwa Pallu with Dancing Peacock & Lotus Motifs',
    'Surat Electronic Jacquard with Real Gold Tone Finish',
    3350.0,
    10,
    14,
    'active',
    '/assets/products/model-teal-green-runway.jpg', // 4K International Model Runway
    '/assets/products/saree-stack-5colors.jpg',
    '/assets/products/saree-stack-5colors.jpg',
    '/assets/products/saree-stack-5colors.jpg',
    '/assets/videos/saree-traditional-drape.webm',
    'Deep jewel-tone green with exceptional contrast against antique zari.'
  ]
];

for (const p of realProducts) {
  insertProduct.run(...p);
  console.log(`Inserted ${p[0]} - ${p[2]}`);
}

const count = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
console.log(`Successfully seeded ${count} real-world saree records with 4K model runway imagery!`);
db.close();
