import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildDir = join(__dirname, 'build');

// Ensure build directory exists
if (!existsSync(buildDir)) {
  mkdirSync(buildDir, { recursive: true });
}

const sourceIcon = join(__dirname, 'public', 'favicon.png');

// Create 512x512 PNG icon (for Linux and macOS)
await sharp(sourceIcon)
  .resize(512, 512, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .png()
  .toFile(join(buildDir, 'icon.png'));

console.log('✓ Created icon.png (512x512)');

// Create 256x256 version for Windows
await sharp(sourceIcon)
  .resize(256, 256, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .png()
  .toFile(join(buildDir, 'icon-256.png'));

console.log('✓ Created icon-256.png (256x256)');

// Create 1024x1024 version for macOS (retina)
await sharp(sourceIcon)
  .resize(1024, 1024, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .png()
  .toFile(join(buildDir, 'icon-1024.png'));

console.log('✓ Created icon-1024.png (1024x1024)');

console.log('\nAll icons created successfully!');
