import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, '..', 'public', 'assets', 'products');

function makeModelCatwalkSvg({ title, baseColor, accentColor, motifName, isPallu = false, isCloseUp = false }) {
  if (isCloseUp) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <defs>
        <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stop-color="${baseColor}" stop-opacity="1"/>
          <stop offset="100%" stop-color="#0a0a0c" stop-opacity="0.9"/>
        </radialGradient>
        <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ECC665"/>
          <stop offset="35%" stop-color="#FFF5B8"/>
          <stop offset="65%" stop-color="#C59B27"/>
          <stop offset="100%" stop-color="#8F6A0F"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#vignette)"/>
      <g stroke="url(#goldSheen)" stroke-width="2.5" opacity="0.9">
        <path d="M100 200 Q200 100, 300 250 T500 200 T700 300" fill="none"/>
        <path d="M150 250 Q250 150, 350 300 T550 250 T750 350" fill="none"/>
        <circle cx="300" cy="250" r="45" fill="url(#goldSheen)" opacity="0.25"/>
        <circle cx="500" cy="200" r="35" fill="url(#goldSheen)" opacity="0.2"/>
      </g>
      <text x="400" y="710" fill="#ffffff" font-family="Cinzel, serif" font-size="26" font-weight="bold" text-anchor="middle" letter-spacing="3">${title}</text>
      <text x="400" y="745" fill="${accentColor}" font-family="sans-serif" font-size="14" text-anchor="middle" letter-spacing="2">AUTHENTIC SURAT WEAVE • WEFT & WARP MACRO</text>
    </svg>`;
  }

  if (isPallu) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${baseColor}"/>
          <stop offset="100%" stop-color="#140202"/>
        </linearGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF2A3"/>
          <stop offset="50%" stop-color="#D4AF37"/>
          <stop offset="100%" stop-color="#8C6F12"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#bg)"/>
      <rect x="50" y="50" width="700" height="700" rx="12" fill="none" stroke="url(#gold)" stroke-width="8"/>
      <circle cx="400" cy="380" r="140" fill="none" stroke="url(#gold)" stroke-width="5"/>
      <circle cx="400" cy="380" r="110" fill="url(#gold)" opacity="0.25"/>
      <circle cx="400" cy="380" r="40" fill="url(#gold)" opacity="0.8"/>
      <!-- Hanging Tassels -->
      <g stroke="url(#gold)" stroke-width="4" stroke-linecap="round">
        <line x1="120" y1="750" x2="120" y2="785"/>
        <circle cx="120" cy="785" r="5" fill="url(#gold)"/>
        <line x1="260" y1="750" x2="260" y2="785"/>
        <circle cx="260" cy="785" r="5" fill="url(#gold)"/>
        <line x1="400" y1="750" x2="400" y2="785"/>
        <circle cx="400" cy="785" r="5" fill="url(#gold)"/>
        <line x1="540" y1="750" x2="540" y2="785"/>
        <circle cx="540" cy="785" r="5" fill="url(#gold)"/>
        <line x1="680" y1="750" x2="680" y2="785"/>
        <circle cx="680" cy="785" r="5" fill="url(#gold)"/>
      </g>
      <text x="400" y="620" fill="#ffffff" font-family="Cinzel, serif" font-size="24" font-weight="bold" text-anchor="middle" letter-spacing="3">${title} - GRAND PALLU</text>
    </svg>`;
  }

  // MODEL CATWALK / RUNWAY FULL DRAPE SHOWCASE
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
    <defs>
      <!-- Runway Stage Ambient Lighting -->
      <linearGradient id="runwayStage" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#121217"/>
        <stop offset="60%" stop-color="#181822"/>
        <stop offset="100%" stop-color="#0a0a0d"/>
      </linearGradient>
      <!-- Catwalk Spotlight Cone -->
      <radialGradient id="spotlight" cx="50%" cy="40%" r="55%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>
        <stop offset="60%" stop-color="${baseColor}" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <!-- Saree Silk Fabric Gradient -->
      <linearGradient id="silkFabric" x1="0%" y1="0%" x2="100%" y2="90%">
        <stop offset="0%" stop-color="${baseColor}"/>
        <stop offset="45%" stop-color="${baseColor}"/>
        <stop offset="85%" stop-color="${baseColor}"/>
        <stop offset="100%" stop-color="#0d0303"/>
      </linearGradient>
      <!-- Metallic Zari Sheen -->
      <linearGradient id="goldZari" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#D4AF37"/>
        <stop offset="40%" stop-color="#FFF8D1"/>
        <stop offset="70%" stop-color="#E5C158"/>
        <stop offset="100%" stop-color="#9A7B1C"/>
      </linearGradient>
      <!-- Model Shadow on Runway -->
      <radialGradient id="stageShadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- 1. Luxury Catwalk Runway Background -->
    <rect width="800" height="1000" fill="url(#runwayStage)"/>
    <ellipse cx="400" cy="480" rx="360" ry="460" fill="url(#spotlight)"/>

    <!-- Runway Floor Perspective Lines -->
    <path d="M120 980 L320 820 M680 980 L480 820" stroke="#ffffff" stroke-width="1.2" opacity="0.15"/>
    <ellipse cx="400" cy="880" rx="220" ry="40" fill="url(#stageShadow)"/>

    <!-- 2. INDIAN FASHION MODEL WALKING THE CATWALK -->
    <g id="modelSilhouette">
      <!-- Model Head & Regal Bun -->
      <ellipse cx="400" cy="115" rx="26" ry="34" fill="#382218"/>
      <!-- Gold Maang Tikka / Head Jewelry -->
      <circle cx="400" cy="95" r="4" fill="url(#goldZari)"/>
      <line x1="400" y1="88" x2="400" y2="102" stroke="url(#goldZari)" stroke-width="1.5"/>

      <!-- Graceful Neck & Shoulders -->
      <path d="M388 145 C388 160, 360 175, 335 185 L465 185 C440 175, 412 160, 412 145 Z" fill="#42291C"/>

      <!-- Royal Gold Choker Necklace -->
      <path d="M375 168 Q400 178, 425 168" stroke="url(#goldZari)" stroke-width="5" fill="none"/>
      <path d="M370 176 Q400 188, 430 176" stroke="url(#goldZari)" stroke-width="2.5" fill="none"/>

      <!-- Matching Brocade Blouse (Choli) -->
      <path d="M335 185 L350 290 L450 290 L465 185 Z" fill="${baseColor}"/>
      <path d="M335 185 L350 290" stroke="url(#goldZari)" stroke-width="4"/>
      <path d="M465 185 L450 290" stroke="url(#goldZari)" stroke-width="4"/>

      <!-- Left Model Arm with Bangles -->
      <path d="M335 185 C310 230, 290 310, 275 390" stroke="#42291C" stroke-width="22" stroke-linecap="round"/>
      <!-- Gold Kangan / Bangles -->
      <circle cx="280" cy="365" r="14" fill="none" stroke="url(#goldZari)" stroke-width="5"/>
      <circle cx="277" cy="375" r="14" fill="none" stroke="url(#goldZari)" stroke-width="4"/>

      <!-- Right Model Arm posing gracefully at hip -->
      <path d="M465 185 C495 240, 520 310, 500 375" stroke="#42291C" stroke-width="22" stroke-linecap="round"/>
      <circle cx="503" cy="360" r="14" fill="none" stroke="url(#goldZari)" stroke-width="5"/>

      <!-- 3. FLOWING DRAPED SAREE SILHOUETTE (CATWALK STRIDE) -->
      <!-- Main Saree Body (Pleats & Swirling Skirt) -->
      <path d="M350 290 C330 360, 260 520, 230 840 C340 885, 460 885, 570 840 C540 520, 470 360, 450 290 Z" fill="url(#silkFabric)"/>

      <!-- Realistic Drape Pleats with Soft Highlights & Depth -->
      <path d="M380 295 C370 420, 345 640, 320 860" stroke="#000000" stroke-width="4" opacity="0.35"/>
      <path d="M380 295 C370 420, 345 640, 320 860" stroke="#ffffff" stroke-width="1.5" opacity="0.18"/>

      <path d="M400 295 C395 440, 390 650, 385 865" stroke="#000000" stroke-width="4" opacity="0.35"/>
      <path d="M400 295 C395 440, 390 650, 385 865" stroke="#ffffff" stroke-width="1.5" opacity="0.2"/>

      <path d="M420 295 C430 430, 445 640, 460 860" stroke="#000000" stroke-width="4" opacity="0.35"/>
      <path d="M420 295 C430 430, 445 640, 460 860" stroke="#ffffff" stroke-width="1.5" opacity="0.18"/>

      <!-- 4. DIAGONAL PALLU PLEATS OVER MODEL SHOULDER -->
      <path d="M345 230 C300 290, 250 440, 220 620 L300 645 C320 480, 360 340, 395 245 Z" fill="${baseColor}" opacity="0.95"/>
      <!-- Heavy Zari Pallu Border -->
      <path d="M345 230 C300 290, 250 440, 220 620" stroke="url(#goldZari)" stroke-width="14" stroke-linecap="round"/>

      <!-- Pallu Tassels (Latkan) falling from shoulder drape -->
      <g stroke="url(#goldZari)" stroke-width="2.5" stroke-linecap="round">
        <line x1="225" y1="620" x2="215" y2="650"/>
        <circle cx="215" cy="650" r="3.5" fill="url(#goldZari)"/>
        <line x1="250" y1="628" x2="242" y2="658"/>
        <circle cx="242" cy="658" r="3.5" fill="url(#goldZari)"/>
        <line x1="275" y1="635" x2="270" y2="665"/>
        <circle cx="270" cy="665" r="3.5" fill="url(#goldZari)"/>
      </g>

      <!-- 5. RICH 6-INCH FLOOR BORDER (ZARI WEAVE) -->
      <path d="M230 785 C340 830, 460 830, 570 785 L570 840 C460 885, 340 885, 230 840 Z" fill="url(#goldZari)"/>
      <path d="M230 785 C340 830, 460 830, 570 785" stroke="#FFFFFF" stroke-width="1.8" opacity="0.6"/>

      <!-- 6. EMBROIDERED MOTIFS ACROSS MODEL DRAPE -->
      <g fill="url(#goldZari)" opacity="0.95">
        <circle cx="330" cy="420" r="8"/>
        <circle cx="430" cy="400" r="8"/>
        <circle cx="360" cy="510" r="10"/>
        <circle cx="470" cy="520" r="10"/>
        <circle cx="290" cy="620" r="11"/>
        <circle cx="400" cy="640" r="11"/>
        <circle cx="510" cy="630" r="11"/>
        <circle cx="340" cy="730" r="12"/>
        <circle cx="460" cy="740" r="12"/>
      </g>
    </g>

    <!-- Luxury Showcase Information Badge -->
    <rect x="50" y="910" width="700" height="62" rx="16" fill="#14141a" opacity="0.92" stroke="#ffffff" stroke-width="1" stroke-opacity="0.1"/>
    <text x="400" y="938" fill="#ffffff" font-family="Cinzel, serif" font-size="20" font-weight="bold" text-anchor="middle" letter-spacing="3">${title}</text>
    <text x="400" y="958" fill="${accentColor}" font-family="sans-serif" font-size="11" text-anchor="middle" letter-spacing="1.5">REAL MODEL CATWALK SHOWCASE • SAHJANAND POLYWEAVES PVT. LTD. SURAT</text>
  </svg>`;
}

const items = [
  { file: 'banarasi-maroon.jpg', title: 'ROYAL KASHI BANARASI KADWA SILK', baseColor: '#7B1113', accentColor: '#ECC665' },
  { file: 'banarasi-border.jpg', title: 'TEMPLE ZARI BORDER', baseColor: '#7B1113', accentColor: '#ECC665', isPallu: false },
  { file: 'banarasi-pallu.jpg', title: 'KADWA BROCADE PALLU', baseColor: '#7B1113', accentColor: '#ECC665', isPallu: true },
  { file: 'banarasi-closeup.jpg', title: 'WARP & WEFT WEAVE', baseColor: '#7B1113', accentColor: '#ECC665', isCloseUp: true },

  { file: 'kanjivaram-gold.jpg', title: 'GOLD TISSUE KANJIVARAM SILK', baseColor: '#C68B19', accentColor: '#FFF2A3' },
  { file: 'kanjivaram-border.jpg', title: 'PEACOCK MAYIL BORDER', baseColor: '#C68B19', accentColor: '#FFF2A3', isPallu: false },
  { file: 'kanjivaram-pallu.jpg', title: 'GOPURAM TEMPLE PALLU', baseColor: '#C68B19', accentColor: '#FFF2A3', isPallu: true },
  { file: 'kanjivaram-closeup.jpg', title: 'KORVAI INTERLOCKING WEAVE', baseColor: '#C68B19', accentColor: '#FFF2A3', isCloseUp: true },

  { file: 'georgette-green.jpg', title: 'SURAT MEENAKARI GEORGETTE', baseColor: '#0E5C44', accentColor: '#D4AF37' },
  { file: 'georgette-border.jpg', title: 'SCALLOPED FLORAL BORDER', baseColor: '#0E5C44', accentColor: '#D4AF37', isPallu: false },
  { file: 'georgette-pallu.jpg', title: 'GEOMETRIC MEENAKARI PALLU', baseColor: '#0E5C44', accentColor: '#D4AF37', isPallu: true },
  { file: 'georgette-closeup.jpg', title: 'HIGH-TWIST MICRO GEORGETTE', baseColor: '#0E5C44', accentColor: '#D4AF37', isCloseUp: true },

  { file: 'organza-pink.jpg', title: 'SHEER CUTWORK ORGANZA SILK', baseColor: '#A0144F', accentColor: '#ECC665' },
  { file: 'organza-border.jpg', title: 'LASER CUTWORK BORDER', baseColor: '#A0144F', accentColor: '#ECC665', isPallu: false },
  { file: 'organza-pallu.jpg', title: 'LINEAR STRIPES PALLU', baseColor: '#A0144F', accentColor: '#ECC665', isPallu: true },
  { file: 'organza-closeup.jpg', title: 'CRISP MONOFILAMENT ORGANZA', baseColor: '#A0144F', accentColor: '#ECC665', isCloseUp: true },

  { file: 'patola-blue.jpg', title: 'PATAN PATOLA DOUBLE-IKAT SILK', baseColor: '#0C3A5E', accentColor: '#ECC665' },
  { file: 'patola-border.jpg', title: 'PATOLA CHEVRON BORDER', baseColor: '#0C3A5E', accentColor: '#ECC665', isPallu: false },
  { file: 'patola-pallu.jpg', title: 'MULTI-TIER PATOLA PALLU', baseColor: '#0C3A5E', accentColor: '#ECC665', isPallu: true },
  { file: 'patola-closeup.jpg', title: 'DOUBLE-IKAT INTERWEAVE', baseColor: '#0C3A5E', accentColor: '#ECC665', isCloseUp: true },

  { file: 'paithani-wine.jpg', title: 'ROYAL PAITHANI MOR PALLU SILK', baseColor: '#4A0E2E', accentColor: '#D4AF37' },
  { file: 'paithani-border.jpg', title: 'MUNIYA PARROT BORDER', baseColor: '#4A0E2E', accentColor: '#D4AF37', isPallu: false },
  { file: 'paithani-pallu.jpg', title: 'PAITHANI PEACOCK PALLU', baseColor: '#4A0E2E', accentColor: '#D4AF37', isPallu: true },
  { file: 'paithani-closeup.jpg', title: 'TAPESTRY KADWA WEAVE', baseColor: '#4A0E2E', accentColor: '#D4AF37', isCloseUp: true },
];

for (const item of items) {
  const content = makeModelCatwalkSvg(item);
  const baseName = item.file.replace(/\.(jpg|svg)$/, '');
  fs.writeFileSync(path.join(outDir, `${baseName}.svg`), content);
  fs.writeFileSync(path.join(outDir, `${baseName}.jpg`), content);
}

console.log(`Generated all ${items.length * 2} assets (.svg and .jpg formats)!`);
