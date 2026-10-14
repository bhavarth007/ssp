const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'sahjanand.db');
const db = new Database(dbPath);

console.log('Purging old records and updating master products in SQLite...');

db.pragma('foreign_keys = OFF');

// Delete any products that are not our 5 authentic records
db.prepare(`
  DELETE FROM products 
  WHERE product_code IN ('SP-BAN-01', 'SP-KAN-02', 'SP-JAC-03', 'SP-ORG-04', 'SP-PAT-05', 'SP-PAI-06')
`).run();

// Check if any product has old videos and update
const updates = [
  {
    code: 'SP-MEENA-01',
    hero: '/assets/products/model-crimson-runway.jpg',
    border: '/assets/products/crimson-border-detail.jpg',
    pallu: '/assets/products/saree-crimson-meenakari-real.jpg',
    closeup: '/assets/products/crimson-medallion-detail.jpg',
    video: '/assets/videos/saree-crimson-runway-walk.mp4'
  },
  {
    code: 'SP-INDIGO-02',
    hero: '/assets/products/model-indigo-runway.jpg',
    border: '/assets/products/indigo-fabric-detail.jpg',
    pallu: '/assets/products/saree-stack-5colors.jpg',
    closeup: '/assets/products/indigo-fabric-detail.jpg',
    video: '/assets/videos/saree-indigo-runway-walk.mp4'
  },
  {
    code: 'SP-RANI-03',
    hero: '/assets/products/model-rani-pink-runway.jpg',
    border: '/assets/products/rani-fabric-detail.jpg',
    pallu: '/assets/products/saree-stack-5colors.jpg',
    closeup: '/assets/products/rani-fabric-detail.jpg',
    video: '/assets/videos/saree-rani-runway-walk.mp4'
  },
  {
    code: 'SP-GOLD-04',
    hero: '/assets/products/model-mustard-gold-runway.jpg',
    border: '/assets/products/mustard-fabric-detail.jpg',
    pallu: '/assets/products/saree-stack-5colors.jpg',
    closeup: '/assets/products/mustard-fabric-detail.jpg',
    video: '/assets/videos/saree-mustard-runway-walk.mp4'
  },
  {
    code: 'SP-TEAL-05',
    hero: '/assets/products/model-teal-green-runway.jpg',
    border: '/assets/products/teal-fabric-detail.jpg',
    pallu: '/assets/products/saree-stack-5colors.jpg',
    closeup: '/assets/products/teal-fabric-detail.jpg',
    video: '/assets/videos/saree-teal-runway-walk.mp4'
  }
];

const updateStmt = db.prepare(`
  UPDATE products 
  SET hero_image = ?, border_image = ?, pallu_image = ?, close_up_image = ?, demo_video_url = ?, updated_at = CURRENT_TIMESTAMP
  WHERE product_code = ?
`);

for (const u of updates) {
  updateStmt.run(u.hero, u.border, u.pallu, u.closeup, u.video, u.code);
}

// Make sure orders reference a valid product
const validProds = db.prepare('SELECT id, product_code, name FROM products').all();
if (validProds.length > 0) {
  const first = validProds[0];
  db.prepare('UPDATE orders SET product_id = ?, product_code = ?, product_name = ? WHERE id = 2').run(first.id, first.product_code, first.name);
}

console.log('Active Products after purge:');
console.table(db.prepare('SELECT id, product_code, name, hero_image, demo_video_url FROM products').all());

db.close();
