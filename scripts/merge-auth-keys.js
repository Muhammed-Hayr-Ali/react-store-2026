import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enPath = path.join(__dirname, '..', 'messages', 'en.json');
const arPath = path.join(__dirname, '..', 'messages', 'ar.json');
const missingEnPath = path.join(__dirname, 'missing-auth-keys-en.json');
const missingArPath = path.join(__dirname, 'missing-auth-keys-ar.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const missingEn = JSON.parse(fs.readFileSync(missingEnPath, 'utf8'));
const missingAr = JSON.parse(fs.readFileSync(missingArPath, 'utf8'));

// Add missing keys to Auth
en.Auth = { ...en.Auth, ...missingEn };
ar.Auth = { ...ar.Auth, ...missingAr };

// Write back
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));

console.log('✅ Added missing Auth translation keys!');
console.log(`English keys: ${Object.keys(en.Auth).length}`);
console.log(`Arabic keys: ${Object.keys(ar.Auth).length}`);
