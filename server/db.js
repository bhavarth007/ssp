import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'sahjanand.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance and durability
db.pragma('journal_mode = WAL');

export function initDatabase() {
  // 1. Company Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY,
      company_name TEXT NOT NULL,
      slogan TEXT,
      address TEXT NOT NULL,
      gstin TEXT NOT NULL,
      pan TEXT,
      email TEXT,
      phone TEXT,
      website TEXT,
      bank_name TEXT,
      account_no TEXT,
      ifsc_code TEXT,
      default_gst_rate REAL DEFAULT 5.0,
      terms_and_conditions TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Colours Library
  db.exec(`
    CREATE TABLE IF NOT EXISTS colours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      hex_code TEXT NOT NULL,
      surcharge_per_saree REAL DEFAULT 0.0,
      is_active INTEGER DEFAULT 1
    );
  `);

  // 3. Zari Options Library
  db.exec(`
    CREATE TABLE IF NOT EXISTS zari_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      grade TEXT,
      finish_tone TEXT,
      thickness_count TEXT,
      consumption_grams REAL DEFAULT 180,
      rate_per_gram REAL DEFAULT 2.5,
      additional_cost REAL DEFAULT 0.0,
      is_active INTEGER DEFAULT 1
    );
  `);

  // 4. Design Options Library
  db.exec(`
    CREATE TABLE IF NOT EXISTS designs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      design_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      motif_type TEXT,
      thumbnail TEXT,
      design_charge REAL DEFAULT 0.0,
      is_active INTEGER DEFAULT 1
    );
  `);

  // 5. Thread Options Library
  db.exec(`
    CREATE TABLE IF NOT EXISTS thread_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      count_spec TEXT,
      consumption_meters REAL DEFAULT 400,
      additional_cost REAL DEFAULT 0.0,
      is_active INTEGER DEFAULT 1
    );
  `);

  // 6. Manufacturing Processes Library
  db.exec(`
    CREATE TABLE IF NOT EXISTS manufacturing_processes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      process_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      rate_type TEXT DEFAULT 'per_saree',
      rate REAL NOT NULL DEFAULT 0.0,
      is_mandatory INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );
  `);

  // 7. Products Master
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL UNIQUE,
      qr_identifier TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      collection TEXT,
      fabric_composition TEXT NOT NULL,
      base_fabric_type TEXT NOT NULL,
      gsm INTEGER,
      fabric_width TEXT,
      saree_length TEXT,
      base_colour TEXT NOT NULL,
      base_colour_hex TEXT NOT NULL,
      pattern_description TEXT,
      border_type TEXT,
      pallu_design TEXT,
      weave_type TEXT,
      base_price REAL NOT NULL,
      moq INTEGER DEFAULT 10,
      lead_time_days INTEGER DEFAULT 10,
      status TEXT DEFAULT 'active',
      hero_image TEXT,
      border_image TEXT,
      pallu_image TEXT,
      close_up_image TEXT,
      demo_video_url TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 8. Orders & Quotations CRM
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      doc_type TEXT NOT NULL, -- 'QUOTATION' or 'PURCHASE_ORDER'
      status TEXT NOT NULL DEFAULT 'Draft',
      buyer_company_name TEXT NOT NULL,
      buyer_contact_person TEXT,
      buyer_mobile TEXT,
      buyer_whatsapp TEXT,
      buyer_email TEXT,
      buyer_gstin TEXT,
      buyer_billing_address TEXT,
      buyer_shipping_address TEXT,
      product_id INTEGER NOT NULL,
      product_code TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      base_price REAL NOT NULL,
      selected_colour_name TEXT,
      selected_colour_hex TEXT,
      colour_cost REAL DEFAULT 0,
      selected_zari_name TEXT,
      zari_cost REAL DEFAULT 0,
      selected_design_name TEXT,
      design_cost REAL DEFAULT 0,
      selected_thread_name TEXT,
      thread_cost REAL DEFAULT 0,
      selected_processes_json TEXT,
      manufacturing_cost REAL DEFAULT 0,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      discount_percentage REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      taxable_amount REAL NOT NULL,
      gst_rate REAL DEFAULT 5.0,
      gst_amount REAL NOT NULL,
      grand_total REAL NOT NULL,
      delivery_date TEXT,
      payment_terms TEXT,
      shipping_terms TEXT,
      special_notes TEXT,
      preview_image_snapshot TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // 9. Audit Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default company settings if not present
  const checkSettings = db.prepare('SELECT COUNT(*) as count FROM company_settings').get();
  if (checkSettings.count === 0) {
    db.prepare(`
      INSERT INTO company_settings (
        id, company_name, slogan, address, gstin, pan, email, phone, website,
        bank_name, account_no, ifsc_code, default_gst_rate, terms_and_conditions
      ) VALUES (
        1,
        'SAHJANAND POLYWEAVES PVT. LTD.',
        'Weaving Quality, Creating Excellence',
        'Plot No. 42-45, Surat Textile Park, Sachin GIDC, Surat - 394230, Gujarat, India',
        '24AAACS3829P1Z5',
        'AAACS3829P',
        'sales@sahjanandpolyweaves.com',
        '+91 98251 44550 / +91 261 2899400',
        'www.sahjanandpolyweaves.com',
        'HDFC Bank, Ring Road Branch, Surat',
        '50200088921478',
        'HDFC0000241',
        5.0,
        '1. Goods once sold will not be taken back unless manufacturing defect is notified within 7 days.\n2. Payment terms as agreed; interest @18% p.a. charged after due date.\n3. All disputes subject to Surat jurisdiction only.\n4. Delivery schedules subject to force majeure textile mill operations.'
      )
    `).run();
  }

  // Seed Colours (8 records)
  const checkColours = db.prepare('SELECT COUNT(*) as count FROM colours').get();
  if (checkColours.count === 0) {
    const insertColour = db.prepare('INSERT INTO colours (name, hex_code, surcharge_per_saree) VALUES (?, ?, ?)');
    const colours = [
      ['Deep Crimson Maroon', '#7B1113', 0.0],
      ['Royal Peacock Blue', '#0C3A5E', 0.0],
      ['Emerald Forest Green', '#0E5C44', 0.0],
      ['Rani Magenta Pink', '#A0144F', 40.0],
      ['Imperial Mustard Gold', '#C68B19', 0.0],
      ['Regal Wine Plum', '#4A0E2E', 50.0],
      ['Pure Ivory Pearl', '#F5F2E9', 60.0],
      ['Midnight Black Gold', '#1A1A1A', 80.0],
    ];
    for (const c of colours) {
      insertColour.run(c[0], c[1], c[2]);
    }
  }

  // Seed Zari Options (5 records)
  const checkZari = db.prepare('SELECT COUNT(*) as count FROM zari_options').get();
  if (checkZari.count === 0) {
    const insertZari = db.prepare(`
      INSERT INTO zari_options (name, grade, finish_tone, thickness_count, consumption_grams, rate_per_gram, additional_cost)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const zaris = [
      ['Surat Tested Gold Zari (Standard)', 'Surat Grade A', 'Gold', '120D / 240TPI', 180, 2.5, 0.0],
      ['Pure Antique Matte Gold Zari', 'Brocade Classic', 'Antique Gold', '150D / 280TPI', 210, 3.2, 180.0],
      ['Rose Gold Metallic Lurex', 'Imported Japanese Spec', 'Rose Gold', '110D / 220TPI', 160, 3.8, 220.0],
      ['Silver Platinum Fine Zari', 'Surat Premium 120D', 'Silver', '120D / 240TPI', 175, 3.0, 150.0],
      ['Champagne Gold Micro Zari', 'Micro-Filament 75D', 'Champagne', '75D / 300TPI', 140, 4.5, 260.0],
    ];
    for (const z of zaris) {
      insertZari.run(z[0], z[1], z[2], z[3], z[4], z[5], z[6]);
    }
  }

  // Seed Designs (5 records)
  const checkDesigns = db.prepare('SELECT COUNT(*) as count FROM designs').get();
  if (checkDesigns.count === 0) {
    const insertDesign = db.prepare(`
      INSERT INTO designs (design_code, name, motif_type, thumbnail, design_charge)
      VALUES (?, ?, ?, ?, ?)
    `);
    const designs = [
      ['DSG-KALKA-01', 'Traditional Royal Kalka Paisley Jaal', 'Heritage Kalka Paisley', '/assets/patterns/kalka.svg', 0.0],
      ['DSG-MEENA-02', 'Mughal Meenakari Floral Brocade', 'Multi-colour Floral Jaal', '/assets/patterns/meenakari.svg', 180.0],
      ['DSG-TEMPLE-03', 'Geometric Chevron Temple Weave', 'Architectural Temple Gopuram', '/assets/patterns/temple.svg', 120.0],
      ['DSG-KAMAL-04', 'Lotus Bud (Kamal) Heritage Motifs', 'Sacred Lotus Boota', '/assets/patterns/lotus.svg', 160.0],
      ['DSG-TREE-05', 'Tree of Life (Kalpavriksha) Grand Weave', 'Elaborate Master Brocade', '/assets/patterns/kalpavriksha.svg', 280.0],
    ];
    for (const d of designs) {
      insertDesign.run(d[0], d[1], d[2], d[3], d[4]);
    }
  }

  // Seed Threads (5 records)
  const checkThreads = db.prepare('SELECT COUNT(*) as count FROM thread_options').get();
  if (checkThreads.count < 5) {
    db.prepare('DELETE FROM thread_options').run();
    const insertThread = db.prepare(`
      INSERT INTO thread_options (thread_code, name, count_spec, consumption_meters, additional_cost)
      VALUES (?, ?, ?, ?, ?)
    `);
    const threads = [
      ['TH-POLY-01', 'Standard Poly Filament Weft Thread', '150D/48F Textured High-Twist', 400, 0.0],
      ['TH-RESH-02', 'Premium Resham Silk Accent Thread', '2/80s Combed Mercerized Pure Silk', 450, 75.0],
      ['TH-MERC-03', 'High-Tenacity Mercerized Cotton-Poly Thread', '2/60s High Glaze Dual Core', 420, 95.0],
      ['TH-VISC-04', 'Imported Viscose Rayon Dual-Tone Thread', '120D Bright Multi-Filament', 480, 130.0],
      ['TH-MET-05', 'Micro-Filament Metallic Wrap Thread', '70D Zari Wrapped Core Weft', 380, 160.0],
    ];
    for (const t of threads) {
      insertThread.run(t[0], t[1], t[2], t[3], t[4]);
    }
  }

  // Seed Manufacturing Processes (5 records)
  const checkProcesses = db.prepare('SELECT COUNT(*) as count FROM manufacturing_processes').get();
  if (checkProcesses.count === 0) {
    const insertProc = db.prepare(`
      INSERT INTO manufacturing_processes (process_code, name, description, rate_type, rate, is_mandatory)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const procs = [
      ['PROC-CUT-01', 'Ultrasonic Edge Slitting & Anti-Fray Cutting', 'Automated laser edge cutting preventing weft fraying', 'per_saree', 45.0, 1], // Mandatory
      ['PROC-DIANG-02', 'Diang / High-Luster Calendering & Steaming', 'Proprietary Surat high-pressure calendering for silky handfeel and mirror luster', 'per_saree', 110.0, 0],
      ['PROC-BOOTA-03', 'Precision Boota Embroidery & Clip-Cutting', 'Secondary jacquard clip cutting of extra floating zari weft', 'per_saree', 85.0, 0],
      ['PROC-TASSEL-04', 'Traditional Pallu Zari Tassels (Latkan Finishing)', 'Handcrafted matching resham and zari hanging tassels on pallu border', 'per_saree', 95.0, 0],
      ['PROC-BOX-05', 'Rigid Luxury Box & Poly-Shield Packaging', 'Rigid embossed presentation box with anti-moisture velvet sleeve', 'per_saree', 125.0, 0],
    ];
    for (const p of procs) {
      insertProc.run(p[0], p[1], p[2], p[3], p[4], p[5]);
    }
  }

  // Seed Products (At least 6 real-world Saree records with model catwalk demo videos)
  const existingProductCodes = new Set(db.prepare('SELECT product_code FROM products').all().map(p => p.product_code));
  
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

  const products = [
    [
      'SP-MEENA-01',
      'QR-SP-MEENA-01',
      'Surat Heritage Royal Crimson Meenakari Silk Saree',
      'Bridal Weaves',
      'Heritage Royal Surat Collection',
      'Pure Poly-Silk Filament Warp x Art Silk Weft (120D/75D)',
      'Heavy Jacquard Satin Brocade Weave',
      185,
      '44 inches (112 cm)',
      '6.30 meters (includes 80cm unstitched blouse piece)',
      'Deep Crimson Maroon',
      '#7B1113',
      'High-fashion runway showcase featuring all-over floral meenakari jaal with authentic Gujarati kalash and peacock motifs',
      '4-inch Rich Contrast Temple & Scalloped Zari Border',
      'Heavy Kadwa Jacquard Pallu with Intricate Jhumar Motifs',
      'Electronic Jacquard Loom with Kadwa Brocade Weaving',
      2950.0,
      10,
      10,
      'active',
      '/assets/products/model-crimson-runway.jpg',
      '/assets/products/model-crimson-border.jpg',
      '/assets/products/model-crimson-pallu.jpg',
      '/assets/products/model-crimson-closeup.jpg',
      '/assets/videos/saree-crimson-runway-walk.mp4',
      'High-density warp with double beam tensioning. Flagship bridal saree worn by international model on stage.'
    ],
    [
      'SP-INDIGO-02',
      'QR-SP-INDIGO-02',
      'Royal Indigo Purple Elephant Medallion Brocade Saree',
      'Royal Heritage',
      'Rajwada Haute Couture Series',
      'High-Twist Poly-Silk Warp x Mercerized Resham Weft (110D/80D)',
      'Rich Royal Brocade Weave with Gold-Silver Dual Zari',
      '190',
      '45 inches (114 cm)',
      '6.30 meters (includes 80cm blouse)',
      'Royal Indigo Purple',
      '#2E1065',
      'International runway showcase with imperial elephant and floral medallions woven in contrast antique gold zari',
      '5-inch Architectural Regal Elephant & Vine Border',
      'Grand Royal Elephant Medallion Kadwa Pallu',
      'Surat High-Precision Electronic Jacquard Weave',
      3250.0,
      12,
      12,
      'active',
      '/assets/products/model-indigo-runway.jpg',
      '/assets/products/model-indigo-border.jpg',
      '/assets/products/model-indigo-pallu.jpg',
      '/assets/products/model-indigo-closeup.jpg',
      '/assets/videos/saree-indigo-runway-walk.mp4',
      'Vibrant deep purple tone paired with warm golden antique zari. Catwalk verified.'
    ],
    [
      'SP-RANI-03',
      'QR-SP-RANI-03',
      'Vibrant Rani Pink Scalloped Zari Silk Saree',
      'Festive Silk',
      'Utsav Designer Luxe Line',
      'Micro-Filament Poly-Silk (80D x 80D)',
      'Lustrous Satin Jacquard with Metallic Resham Highlights',
      170,
      '44 inches (112 cm)',
      '6.30 meters (includes 80cm contrast blouse piece)',
      'Vibrant Rani Pink',
      '#BE185D',
      'Model ramp walk featuring all-over diagonal floral vine jaal and scalloped architectural border',
      '3.5-inch Scalloped Cutwork Floral Zari Border',
      'Opulent Multi-Weft Floral Jaal Pallu with Resham Tassels',
      'High-Speed Rapier Jacquard Loom',
      2850.0,
      15,
      8,
      'active',
      '/assets/products/model-rani-pink-runway.jpg',
      '/assets/products/model-rani-pink-border.jpg',
      '/assets/products/model-rani-pink-pallu.jpg',
      '/assets/products/model-rani-pink-closeup.jpg',
      '/assets/videos/saree-rani-runway-walk.mp4',
      'Dynamic vibrant pink engineered for festive celebration and high-end retailer showrooms.'
    ],
    [
      'SP-GOLD-04',
      'QR-SP-GOLD-04',
      'Imperial Mustard Gold Peacock Brocade Silk Saree',
      'Brocade Jacquard',
      'Parampara Heritage Weaves',
      'Metallic Poly-Tissue Filament x Mercerized Resham (100D/80D)',
      '3-Ply Warp Korvai Interlocking Jacquard Weave',
      210,
      '45 inches (114 cm)',
      '6.30 meters (includes 80cm unstitched blouse piece)',
      'Imperial Mustard Gold',
      '#CA8A04',
      'Catwalk model presentation highlighting sacred Mayil (Peacock) and Kamalam (Lotus) embossed brocade medallions',
      '6-inch Traditional Peacock & Mayil Contrast Border',
      'Grand Architectural Temple Gopuram Pallu with Rich Resham',
      'Heavy Electronic Jacquard with Real Gold Tone Zari',
      3450.0,
      10,
      14,
      'active',
      '/assets/products/model-mustard-gold-runway.jpg',
      '/assets/products/model-mustard-gold-border.jpg',
      '/assets/products/model-mustard-gold-pallu.jpg',
      '/assets/products/model-mustard-gold-closeup.jpg',
      '/assets/videos/saree-mustard-runway-walk.mp4',
      'Regal yellow-gold metallic hue with high luminosity under luxury showroom lighting.'
    ],
    [
      'SP-TEAL-05',
      'QR-SP-TEAL-05',
      'Deep Peacock Teal Green Antique Zari Silk Saree',
      'Contemporary Poly-Silk',
      'Noor Luxe Collection',
      'Poly-Georgette Micro-Twist with Resham Weft (80D/80D)',
      'Micro-Twist Silk with Antique Zari Weaving',
      165,
      '44 inches (112 cm)',
      '6.30 meters (includes 80cm unstitched blouse piece)',
      'Peacock Teal Green',
      '#0F766E',
      'International runway model walk featuring antique gold vines and delicate heritage peacock bootas',
      '4-inch Vintage Antique Floral Zari Border',
      'Subtle Geometric Chevron Pallu with Handcrafted Tassels',
      'High-Speed Rapier Jacquard Loom with Diang Calender Luster',
      2750.0,
      10,
      7,
      'active',
      '/assets/products/model-teal-green-runway.jpg',
      '/assets/products/model-teal-green-border.jpg',
      '/assets/products/model-teal-green-pallu.jpg',
      '/assets/products/model-teal-green-closeup.jpg',
      '/assets/videos/saree-teal-runway-walk.mp4',
      'Striking peacock teal tone with antique brushed zari finish. Modern haute couture styling.'
    ]
  ];

  for (const p of products) {
    if (!existingProductCodes.has(p[0])) {
      insertProduct.run(...p);
    }
  }
}

export default db;
