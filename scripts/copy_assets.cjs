const fs = require('fs');
const path = require('path');

const brain = 'C:/Users/admin/.gemini/antigravity/brain/df252c45-d5b5-4106-bedb-57a8f86ed625';
const dest = 'C:/SSP/public/assets/products';
const dist = 'C:/SSP/dist/assets/products';

if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });

const copies = [
  { src: path.join(brain, '.user_uploaded/media_1791953312199.jpg'), dstName: 'saree-stack-5colors.jpg' },
  { src: path.join(brain, '.user_uploaded/media_1791953332248.jpg'), dstName: 'saree-crimson-meenakari-real.jpg' },
  { src: path.join(brain, 'intl_model_crimson_saree_1791953742993.jpg'), dstName: 'model-crimson-runway.jpg' },
  { src: path.join(brain, 'intl_model_indigo_saree_1791953764815.jpg'), dstName: 'model-indigo-runway.jpg' },
  { src: path.join(brain, 'intl_model_rani_pink_saree_1791953784190.jpg'), dstName: 'model-rani-pink-runway.jpg' },
  { src: path.join(brain, 'intl_model_mustard_gold_saree_1791953803750.jpg'), dstName: 'model-mustard-gold-runway.jpg' },
  { src: path.join(brain, 'intl_model_teal_green_saree_1791953823780.jpg'), dstName: 'model-teal-green-runway.jpg' },
];

for (const c of copies) {
  if (fs.existsSync(c.src)) {
    const targetPublic = path.join(dest, c.dstName);
    const targetDist = path.join(dist, c.dstName);
    fs.copyFileSync(c.src, targetPublic);
    fs.copyFileSync(c.src, targetDist);
    console.log(`Copied ${c.dstName} (${(fs.statSync(c.src).size / 1024).toFixed(1)} KB)`);
  } else {
    console.warn(`File not found: ${c.src}`);
  }
}
