import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getOfficialApkPackageBuffer } from '../src/utils/apkGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');
const downloadDir = path.resolve(publicDir, 'download');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

const apkBuffer = getOfficialApkPackageBuffer();

// Write to multiple standard download locations
fs.writeFileSync(path.resolve(publicDir, 'NS_Mobile_Finance_v2.4.1.apk'), apkBuffer);
fs.writeFileSync(path.resolve(publicDir, 'app-release.apk'), apkBuffer);
fs.writeFileSync(path.resolve(downloadDir, 'NS_Mobile_Finance_v2.4.1.apk'), apkBuffer);

console.log('✅ APK successfully created!');
console.log('Size:', apkBuffer.length, 'bytes');
console.log('Paths created:');
console.log(' - /public/NS_Mobile_Finance_v2.4.1.apk');
console.log(' - /public/app-release.apk');
console.log(' - /public/download/NS_Mobile_Finance_v2.4.1.apk');
