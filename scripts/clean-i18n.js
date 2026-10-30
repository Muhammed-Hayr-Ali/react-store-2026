/**
 * By Gemini
 * @file scripts/clean-i18n.js
 * @description سكربت محلي لفحص ملفات الترجمة في مشروع Next.js (باستخدام next-intl)
 * والتحقق من المفاتيح المستخدمة مقابل غير المستخدمة في الكود، ثم إعادة ترتيب الملف
 * وعزل المفاتيح المهملة تحت قسم "unused" في نهاية الملف.
 * 
 * طريقة العمل وآلية الفحص:
 * 1. قراءة ملف الترجمة الأساسي (مثل en.json) وتحويل مفاتيحه المتداخلة إلى مفاتيح نقطية (dot notation).
 * 2. مسح جميع ملفات المصدر في المشروع (.ts, .tsx, .js, .jsx) مع استثناء المجلدات غير الضرورية (مثل node_modules, .next, messages, scripts).
 * 3. دمج محتوى جميع ملفات الكود في نص واحد كبير للبحث السريع.
 * 4. مقارنة كل مفتاح ترجمة بالتأكد من وجوده في الكود بأشكال مختلفة (مثل استخدام المفتاح كاملاً داخل t('key.subkey') أو البحث عن المفتاح النهائي بمفرده).
 * 5. إعادة بناء كائن الترجمة: وضع المفاتيح النشطة في الأعلى، وعزل المفاتيح غير المستخدمة بالكامل في نهاية الملف تحت بند "unused".
 * 
 * طريقة التشغيل:
 * أضف هذا السكربت في package.json تحت scripts:
 * "i18n:clean": "node scripts/clean-i18n.js"
 * ثم قم بتشغيله عبر الـ Terminal:
 * npm run i18n:clean
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// تهيئة مسارات البيئة الحديثة لـ ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// مسارات الملفات والمجلدات الرئيسية
const messagesFilePath = path.join(__dirname, '../messages/en.json');
const srcDirPath = path.join(__dirname, '../');

/**
 * دالة مساعدة لقراءة جميع ملفات الكود في المشروع بشكل تكراري (Recursive)
 * @param {string} dirPath - مسار المجلد الحالي
 * @param {string[]} arrayOfFiles - مصفوفة لتخزين المسارات
 * @returns {string[]} مصفوفة بمسارات ملفات الكود
 */
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    // استثناء المجلدات والملفات التي لا تحتوي على كود ترجمة فعلي
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

/**
 * دالة لتسطيح كائن JSON المتداخل إلى مفاتيح مفصولة بنقاط (Nested keys to dot notation)
 * مثال: { home: { title: "Hello" } } => { "home.title": "Hello" }
 */
function flattenObject(ob, prefix = '') {
  let res = {};
  for (const i of Object.keys(ob)) {
    const nestedName = prefix ? `${prefix}.${i}` : i;
    if (typeof ob[i] === 'object' && ob[i] !== null && !Array.isArray(ob[i])) {
      Object.assign(res, flattenObject(ob[i], nestedName));
    } else {
      res[nestedName] = ob[i];
    }
  }
  return res;
}

/**
 * دالة لإعادة بناء كائن JSON المتداخل من المفاتيح المسطحة
 */
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

/**
 * الدالة الرئيسية لتنفيذ عملية الفحص والعزل
 */
function checkUnusedTranslations() {
  if (!fs.existsSync(messagesFilePath)) {
    console.error(`❌ ملف الترجمة غير موجود في المسار: ${messagesFilePath}`);
    return;
  }

  // 1. قراءة وتحليل ملف الترجمة الحالي
  const rawData = fs.readFileSync(messagesFilePath, 'utf-8');
  const messagesJson = JSON.parse(rawData);
  
  // إذا كان هناك بند "unused" سابق، نقوم بدمجه وإعادة فحصه ضمن المفاتيح لتحديث حالته
  let existingUnused = {};
  if (messagesJson.unused) {
    existingUnused = flattenObject(messagesJson.unused);
    delete messagesJson.unused;
  }

  const flattenedMessages = flattenObject(messagesJson);
  const allKeys = Object.keys(flattenedMessages);

  // 2. تجميع محتوى كافة ملفات الكود في المشروع
  const codeFiles = getAllFiles(srcDirPath);
  let allCodeContent = '';
  codeFiles.forEach(file => {
    allCodeContent += fs.readFileSync(file, 'utf-8') + '\n';
  });

  // 3. فحص كل مفتاح والتأكد من استخدامه في الكود
  const usedKeys = {};
  const unusedKeys = {};

  allKeys.forEach(fullKey => {
    const parts = fullKey.split('.');
    const lastKey = parts[parts.length - 1];
    
    // شروط التحقق من استخدام المفتاح في الكود
    const isUsed = allCodeContent.includes(`"${fullKey}"`) || 
                   allCodeContent.includes(`'${fullKey}'`) ||
                   allCodeContent.includes(`\`${fullKey}\``) ||
                   allCodeContent.includes(`("${lastKey}")`) ||
                   allCodeContent.includes(`('${lastKey}')`) ||
                   (existingUnused[fullKey] !== undefined);

    if (isUsed) {
      usedKeys[fullKey] = flattenedMessages[fullKey];
    } else {
      unusedKeys[fullKey] = flattenedMessages[fullKey];
    }
  });

  // 4. إعادة بناء الكائن النهائي وترتيب المفاتيح غير المستخدمة حصرياً تحت بند "unused"
  const rebuiltUsed = unflattenObject(usedKeys);
  const rebuiltUnused = unflattenObject(unusedKeys);

  const finalOutput = {
    ...rebuiltUsed,
    ...(Object.keys(unusedKeys).length > 0 ? { unused: rebuiltUnused } : {})
  };

  // 5. كتابة النتائج مباشرة في ملف الترجمة
  fs.writeFileSync(messagesFilePath, JSON.stringify(finalOutput, null, 2) + '\n', 'utf-8');

  console.log(`✅ تم الفحص والعزل بنجاح!`);
  console.log(`- إجمالي المفاتيح المفحوصة: ${allKeys.length}`);
  console.log(`- المفاتيح المستخدمة والنشطة: ${Object.keys(usedKeys).length}`);
  console.log(`- المفاتيح غير المستخدمة (تم عزلها تحت "unused"): ${Object.keys(unusedKeys).length}`);
}

checkUnusedTranslations();