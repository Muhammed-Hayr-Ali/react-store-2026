/**
 * @file scripts/clean-i18n.js
 * @description Final stable i18n cleaner script for Next.js & next-intl
 * Safely scans usage, keeps original casing matching your code, and isolates unused keys.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messagesFilePath = path.join(__dirname, '../messages/en.json');
const srcDirPath = path.join(__dirname, '../');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (['node_modules', '.next', '.git', 'messages', 'scripts', 'public'].includes(file)) {
      return;
    }

    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function flattenObject(ob, prefix = '') {
  let res = {};
  for (const i of Object.keys(ob)) {
    if (prefix === '' && i === 'unused') continue;

    const nestedName = prefix ? `${prefix}.${i}` : i;
    if (typeof ob[i] === 'object' && ob[i] !== null && !Array.isArray(ob[i])) {
      Object.assign(res, flattenObject(ob[i], nestedName));
    } else {
      res[nestedName] = ob[i];
    }
  }
  return res;
}

function unflattenObject(data) {
  let result = {};
  for (let i in data) {
    let keys = i.split('.');
    keys.reduce((acc, currentKeys, index) => {
      if (index === keys.length - 1) {
        return acc[currentKeys] = data[i];
      }
      return acc[currentKeys] = acc[currentKeys] || {};
    }, result);
  }
  return result;
}

function cleanTranslations() {
  if (!fs.existsSync(messagesFilePath)) {
    console.error(`❌ [Error]: Translation file not found at path: ${messagesFilePath}`);
    return;
  }

  const rawData = fs.readFileSync(messagesFilePath, 'utf-8');
  const messagesJson = JSON.parse(rawData);

  let existingUnused = {};
  if (messagesJson.unused) {
    existingUnused = flattenObject(messagesJson.unused, 'unused');
    existingUnused = Object.keys(existingUnused).reduce((acc, k) => {
      const cleanKey = k.startsWith('unused.') ? k.replace('unused.', '') : k;
      acc[cleanKey] = existingUnused[k];
      return acc;
    }, {});
    delete messagesJson.unused;
  }

  const flattenedMessages = flattenObject(messagesJson);
  const allFlattened = { ...flattenedMessages, ...existingUnused };
  const allKeys = Object.keys(allFlattened);

  const codeFiles = getAllFiles(srcDirPath);
  let allCodeContent = '';
  codeFiles.forEach(file => {
    allCodeContent += fs.readFileSync(file, 'utf-8') + '\n';
  });

  const usedKeys = {};
  const unusedKeys = {};

  allKeys.forEach(fullKey => {
    const parts = fullKey.split('.');
    const namespace = parts[0];
    const lastKey = parts[parts.length - 1];
    
    // شروط مطابقة ذكية تمنع حذف المفاتيح المستعملة ديناميكياً مثل item.key
    const isUsed = 
      allCodeContent.includes(`"${fullKey}"`) || 
      allCodeContent.includes(`'${fullKey}'`) ||
      allCodeContent.includes(`\`${fullKey}\``) ||
      allCodeContent.includes(`('${lastKey}')`) ||
      allCodeContent.includes(`("${lastKey}")`) ||
      allCodeContent.includes(`(\`${lastKey}\`)`) ||
      (namespace && allCodeContent.includes(namespace));

    if (isUsed) {
      usedKeys[fullKey] = allFlattened[fullKey];
    } else {
      unusedKeys[fullKey] = allFlattened[fullKey];
    }
  });

  const rebuiltUsed = unflattenObject(usedKeys);
  const rebuiltUnused = unflattenObject(unusedKeys);

  const finalOutput = {
    ...rebuiltUsed,
    ...(Object.keys(unusedKeys).length > 0 ? { unused: rebuiltUnused } : {})
  };

  fs.writeFileSync(messagesFilePath, JSON.stringify(finalOutput, null, 2) + '\n', 'utf-8');

  console.log(`✨ [Success]: Translation cleanup completed successfully!`);
  console.log(`📊 - Total keys scanned: ${allKeys.length}`);
  console.log(`🟢 - Active used keys: ${Object.keys(usedKeys).length}`);
  console.log(`📦 - Unused keys isolated under "unused": ${Object.keys(unusedKeys).length}`);
}

cleanTranslations();
