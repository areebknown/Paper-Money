// One-time script to upload public background images to Cloudinary
// Run: node scripts/migrate-images-to-cloudinary.mjs

import { v2 as cloudinary } from 'cloudinary';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

cloudinary.config({
    cloud_name: 'dzsr4olmn',
    api_key: '423223688626779',
    api_secret: 'HHmUO9-vXLfKEZibbbbtQ0MzjKI',
});

const images = [
    { file: 'invest.png', publicId: 'market-bg/invest' },
    { file: 'pawn.png', publicId: 'market-bg/pawn' },
    { file: 'dig.png', publicId: 'market-bg/dig' },
    { file: 'consumer.png', publicId: 'market-bg/consumer' },
    { file: 'shutter-bronze.png', publicId: 'shutter/bronze' },
    { file: 'shutter-silver.png', publicId: 'shutter/silver' },
    { file: 'shutter-gold.png', publicId: 'shutter/gold' },
    { file: 'bid-wars-logo.png', publicId: 'ui/bid-wars-logo' },
];

console.log('🚀 Uploading images to Cloudinary...\n');

for (const img of images) {
    const filePath = path.join(publicDir, img.file);
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            public_id: img.publicId,
            overwrite: true,
            fetch_format: 'auto',
            quality: 'auto',
        });
        console.log(`✅ ${img.file}`);
        console.log(`   → ${result.secure_url}\n`);
    } catch (err) {
        console.error(`❌ ${img.file}: ${err.message}\n`);
    }
}

console.log('Done! Copy the URLs above into your code.');
