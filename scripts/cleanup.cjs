const fs = require('fs');
const path = require('path');

const junkFiles = [
  'banarasi-border.jpg', 'banarasi-border.svg', 'banarasi-closeup.jpg', 'banarasi-closeup.svg', 'banarasi-maroon.jpg', 'banarasi-maroon.svg', 'banarasi-pallu.jpg', 'banarasi-pallu.svg',
  'georgette-border.jpg', 'georgette-border.svg', 'georgette-closeup.jpg', 'georgette-closeup.svg', 'georgette-green.jpg', 'georgette-green.svg', 'georgette-pallu.jpg', 'georgette-pallu.svg',
  'kanjivaram-border.jpg', 'kanjivaram-border.svg', 'kanjivaram-closeup.jpg', 'kanjivaram-closeup.svg', 'kanjivaram-gold.jpg', 'kanjivaram-gold.svg', 'kanjivaram-pallu.jpg', 'kanjivaram-pallu.svg',
  'organza-border.jpg', 'organza-border.svg', 'organza-closeup.jpg', 'organza-closeup.svg', 'organza-pink.jpg', 'organza-pink.svg', 'organza-pallu.jpg', 'organza-pallu.svg',
  'paithani-border.jpg', 'paithani-border.svg', 'paithani-closeup.jpg', 'paithani-closeup.svg', 'paithani-wine.jpg', 'paithani-wine.svg', 'paithani-pallu.jpg', 'paithani-pallu.svg',
  'patola-border.jpg', 'patola-border.svg', 'patola-closeup.jpg', 'patola-closeup.svg', 'patola-blue.jpg', 'patola-blue.svg', 'patola-pallu.jpg', 'patola-pallu.svg'
];

const dirs = [
  'C:/SSP/public/assets/products',
  'C:/SSP/dist/assets/products'
];

let count = 0;
for (const dir of dirs) {
  for (const f of junkFiles) {
    const full = path.join(dir, f);
    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
      count++;
    }
  }
}

const scratch = [
  'C:/SSP/scripts/find_video.js',
  'C:/SSP/scripts/find_video.cjs',
  'C:/SSP/scripts/update_db_videos.cjs'
];

for (const s of scratch) {
  if (fs.existsSync(s)) {
    fs.unlinkSync(s);
    count++;
  }
}

console.log(`Cleaned up ${count} unwanted legacy dummy files and scratch scripts successfully!`);
