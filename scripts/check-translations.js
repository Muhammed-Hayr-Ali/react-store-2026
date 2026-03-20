import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enPath = path.join(__dirname, '..', 'messages', 'en.json');
const arPath = path.join(__dirname, '..', 'messages', 'ar.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = getAllKeys(en).sort();
const arKeys = getAllKeys(ar).sort();

console.log('=== Translation Keys Comparison ===\n');
console.log(`English keys: ${enKeys.length}`);
console.log(`Arabic keys: ${arKeys.length}`);
console.log('');

const missingInAr = enKeys.filter(key => !arKeys.includes(key));
const missingInEn = arKeys.filter(key => !enKeys.includes(key));

if (missingInAr.length > 0) {
  console.log('❌ Missing in Arabic:');
  missingInAr.forEach(key => console.log(`  - ${key}`));
  console.log('');
}

if (missingInEn.length > 0) {
  console.log('❌ Missing in English:');
  missingInEn.forEach(key => console.log(`  - ${key}`));
  console.log('');
}

if (missingInAr.length === 0 && missingInEn.length === 0) {
  console.log('✅ All keys match!');
}

console.log('');
console.log('=== Top-level keys ===');
console.log('English:', Object.keys(en).sort().join(', '));
console.log('Arabic:', Object.keys(ar).sort().join(', '));
