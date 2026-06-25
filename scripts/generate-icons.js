const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG inspired by the golden recurve bow and arrow reference
const svgCode = `
<svg width="1024" height="1024" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Radiant golden glow emitting from the arrowhead -->
    <radialGradient id="goldenGlow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#FEF08A" stop-opacity="1" />
      <stop offset="20%" stop-color="#FDE047" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#CA8A04" stop-opacity="0.7" />
      <stop offset="100%" stop-color="#451A03" stop-opacity="1" />
    </radialGradient>
    
    <!-- Metallic gold gradient for the bow and arrow -->
    <linearGradient id="goldMetal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="40%" stop-color="#EAB308" />
      <stop offset="60%" stop-color="#CA8A04" />
      <stop offset="100%" stop-color="#854D0E" />
    </linearGradient>
  </defs>
  
  <rect width="100" height="100" rx="20" fill="url(#goldenGlow)" />
  
  <!-- Bow string (drawn back in a V-shape) -->
  <path d="M 13 52 L 50 82 L 87 52" stroke="#FEF08A" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.8" />
  
  <!-- Recurve Bow (majestic curves matching reference) -->
  <!-- Tips curl outwards, limbs dip down, handle rises up -->
  <path d="M 13 52 
           C 13 75, 35 72, 45 62 
           Q 50 57, 55 62 
           C 65 72, 87 75, 87 52" 
        stroke="url(#goldMetal)" stroke-width="4.5" stroke-linecap="round" fill="none" />
        
  <!-- Curled decorative tips -->
  <path d="M 13 52 C 8 52, 6 45, 12 45 C 16 45, 16 50, 13 52" stroke="url(#goldMetal)" stroke-width="2" fill="none" />
  <path d="M 87 52 C 92 52, 94 45, 88 45 C 84 45, 84 50, 87 52" stroke="url(#goldMetal)" stroke-width="2" fill="none" />
  
  <!-- Arrow Shaft -->
  <line x1="50" y1="84" x2="50" y2="24" stroke="url(#goldMetal)" stroke-width="2.5" stroke-linecap="round" />
  
  <!-- Arrow Head (sharp and glowing) -->
  <polygon points="50 14, 44 28, 50 25, 56 28" fill="#FEF08A" />
  
  <!-- Arrow Fletching (feathers at the bottom) -->
  <path d="M 50 78 L 44 86 M 50 72 L 44 80 M 50 66 L 44 74 
           M 50 78 L 56 86 M 50 72 L 56 80 M 50 66 L 56 74" 
        stroke="url(#goldMetal)" stroke-width="1.5" stroke-linecap="round" />
</svg>
`;

const svgBuffer = Buffer.from(svgCode);

async function generate() {
  const desktopDir = path.join(__dirname, '../reclaim-desktop/build');
  if (!fs.existsSync(desktopDir)) fs.mkdirSync(desktopDir, { recursive: true });
  await sharp(svgBuffer).resize(256, 256).png().toFile(path.join(desktopDir, 'icon.png'));

  const extDir = path.join(__dirname, '../reclaim-extension/icons');
  if (!fs.existsSync(extDir)) fs.mkdirSync(extDir, { recursive: true });
  await sharp(svgBuffer).resize(16, 16).png().toFile(path.join(extDir, 'icon16.png'));
  await sharp(svgBuffer).resize(48, 48).png().toFile(path.join(extDir, 'icon48.png'));
  await sharp(svgBuffer).resize(128, 128).png().toFile(path.join(extDir, 'icon128.png'));

  const androidResDir = path.join(__dirname, '../reclaim-android/app/src/main/res');
  const dens = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
  };
  
  for (const [folder, size] of Object.entries(dens)) {
    const d = path.join(androidResDir, folder);
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    await sharp(svgBuffer).resize(size, size).webp().toFile(path.join(d, 'ic_launcher.webp'));
    
    const circleSvg = `<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" /></svg>`;
    await sharp(svgBuffer)
      .resize(size, size)
      .composite([{ input: Buffer.from(circleSvg), blend: 'dest-in' }])
      .webp()
      .toFile(path.join(d, 'ic_launcher_round.webp'));
  }

  const webDir = path.join(__dirname, '../reclaim-web/app');
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(webDir, 'favicon.ico'));
  console.log('✅ All icons generated with majestic golden bow and glow!');
}

generate().catch(console.error);
