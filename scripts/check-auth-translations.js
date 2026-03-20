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

const enKeys = new Set(getAllKeys(en));
const arKeys = new Set(getAllKeys(ar));

// Auth keys needed
const authKeysNeeded = [
  'loading', 'processingSignIn', 'signInFailedTitle', 'signInFailedDescription',
  'tryAgain', 'signInSuccess', 'signInSuccessDesc', 'continueToHome', 'enableTwoFactor',
  'emailSent', 'checkYourEmail', 'resetInstructions', 'backToSignIn', 'title',
  'description', 'email', 'emailPlaceholder', 'emailRequired', 'invalidEmail',
  'sending', 'sendResetLink', 'missingToken', 'invalidToken', 'verificationError',
  'successTitle', 'validatingToken', 'invalidTokenTitle', 'invalidTokenDescription',
  'requestNewLink', 'successDescription', 'goToSignIn', 'newPassword', 'passwordRequired',
  'passwordMinLength', 'passwordMaxLength', 'confirmPassword', 'confirmPasswordRequired',
  'passwordsMatch', 'resetting', 'resetPassword', 'signIn', 'enterDetailsSignIn',
  'emailTooLong', 'emailTooShort', 'password', 'passwordPlaceholder', 'passwordTooLong',
  'passwordTooShort', 'passwordRequirement', 'forgotPassword', 'submitSignIn',
  'continueWith', 'loginWithGoogle', 'haveAccount', 'signUp', 'termsAndPrivacy',
  'terms', 'and', 'privacy', 'firstName', 'lastName', 'enterDetailsSignUp',
  'firstNamePlaceholder', 'firstNameRequired', 'lastNamePlaceholder', 'lastNameRequired',
  'emailInclusion', 'passwordsDoNotMatch', 'submitSignUp', 'accountCreatedSuccess',
  'twoFactorSetupDesc', 'enrollFailed', 'scanQrCodeSuccess', 'enterCodeError',
  'verifyFailed', 'verifySuccess', 'setupTitle', 'setupDescription', 'startSetup',
  'skip', 'verifyTitle', 'verifyDescription', 'secretKey', 'secretKeyDescription',
  'copiedToClipboard', 'verifyAndContinue', 'enterCodeTitle', 'enterCodeDescription'
];

console.log('=== Checking Auth Keys ===\n');

const missingInEn = authKeysNeeded.filter(key => !enKeys.has(`Auth.${key}`));
const missingInAr = authKeysNeeded.filter(key => !arKeys.has(`Auth.${key}`));

if (missingInEn.length > 0) {
  console.log('❌ Missing in English Auth:');
  missingInEn.forEach(key => console.log(`  - Auth.${key}`));
} else {
  console.log('✅ All Auth keys exist in English');
}

if (missingInAr.length > 0) {
  console.log('\n❌ Missing in Arabic Auth:');
  missingInAr.forEach(key => console.log(`  - Auth.${key}`));
} else {
  console.log('\n✅ All Auth keys exist in Arabic');
}

// Common-soon keys
const commonSoonKeysNeeded = ['title', 'subtitle', 'launchingSoon'];

console.log('\n=== Checking Common-Soon Keys ===\n');

const missingCommonEn = commonSoonKeysNeeded.filter(key => !enKeys.has(`HomePage.${key}`));
const missingCommonAr = commonSoonKeysNeeded.filter(key => !arKeys.has(`HomePage.${key}`));

if (missingCommonEn.length > 0) {
  console.log('❌ Missing in English HomePage:');
  missingCommonEn.forEach(key => console.log(`  - HomePage.${key}`));
} else {
  console.log('✅ All HomePage keys exist in English');
}

if (missingCommonAr.length > 0) {
  console.log('\n❌ Missing in Arabic HomePage:');
  missingCommonAr.forEach(key => console.log(`  - HomePage.${key}`));
} else {
  console.log('\n✅ All HomePage keys exist in Arabic');
}
