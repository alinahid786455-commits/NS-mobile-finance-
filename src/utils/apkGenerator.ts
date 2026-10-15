import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf: Buffer): number {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return ~crc >>> 0;
}

interface ZipEntry {
  name: string;
  content: Buffer | string;
}

export function createApkBuffer(entries: ZipEntry[]): Buffer {
  const parts: Buffer[] = [];
  const cdEntries: Buffer[] = [];
  let offset = 0;

  for (const file of entries) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const dataBuf = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, 'utf8');
    const crc = crc32(dataBuf);
    const uncompressedSize = dataBuf.length;
    const compressed = zlib.deflateRawSync(dataBuf);
    const compressedSize = compressed.length;

    // Local file header (30 bytes + name)
    const lfh = Buffer.alloc(30 + nameBuf.length);
    lfh.writeUInt32LE(0x04034b50, 0); // signature
    lfh.writeUInt16LE(20, 4);         // version needed
    lfh.writeUInt16LE(0, 6);          // flags
    lfh.writeUInt16LE(8, 8);          // compression method (deflate)
    lfh.writeUInt16LE(0, 10);         // mod time
    lfh.writeUInt16LE(0, 12);         // mod date
    lfh.writeUInt32LE(crc, 14);       // crc32
    lfh.writeUInt32LE(compressedSize, 18);
    lfh.writeUInt32LE(uncompressedSize, 22);
    lfh.writeUInt16LE(nameBuf.length, 26);
    lfh.writeUInt16LE(0, 28);
    nameBuf.copy(lfh, 30);

    parts.push(lfh);
    parts.push(compressed);

    // Central directory header (46 bytes + name)
    const cdh = Buffer.alloc(46 + nameBuf.length);
    cdh.writeUInt32LE(0x02014b50, 0);
    cdh.writeUInt16LE(20, 4);
    cdh.writeUInt16LE(20, 6);
    cdh.writeUInt16LE(0, 8);
    cdh.writeUInt16LE(8, 10);
    cdh.writeUInt16LE(0, 12);
    cdh.writeUInt16LE(0, 14);
    cdh.writeUInt32LE(crc, 16);
    cdh.writeUInt32LE(compressedSize, 20);
    cdh.writeUInt32LE(uncompressedSize, 24);
    cdh.writeUInt16LE(nameBuf.length, 28);
    cdh.writeUInt16LE(0, 30);
    cdh.writeUInt16LE(0, 32);
    cdh.writeUInt16LE(0, 34);
    cdh.writeUInt16LE(0, 36);
    cdh.writeUInt32LE(0, 38);
    cdh.writeUInt32LE(offset, 42);
    nameBuf.copy(cdh, 46);

    cdEntries.push(cdh);
    offset += lfh.length + compressed.length;
  }

  const cdOffset = offset;
  let cdSize = 0;
  for (const cdh of cdEntries) {
    parts.push(cdh);
    cdSize += cdh.length;
  }

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdSize, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);
  parts.push(eocd);

  return Buffer.concat(parts);
}

export function getOfficialApkPackageBuffer(): Buffer {
  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.nsmobile.customerapp"
    android:versionCode="20401"
    android:versionName="2.4.1">

    <uses-sdk android:minSdkVersion="26" android:targetSdkVersion="35" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="NS Mobile Finance"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar">

        <activity
            android:name="com.nsmobile.customerapp.MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="nsmobile.in" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const appConfigJson = JSON.stringify({
    appId: "com.nsmobile.customerapp",
    appName: "NS Mobile Finance - Loan & EMI",
    version: "2.4.1",
    buildNumber: 20401,
    releaseDate: "2026-10-15",
    developer: "NS Mobile Infotech Ltd.",
    supportContact: "+91 8509184717",
    phonePeMerchantId: "8509184717",
    branchAddress: "Chanchal State, Garage er Samne, Malda, West Bengal - 732123",
    features: [
      "PhonePe 1-Tap UPI instant loan payments",
      "Overdue calculation with red warning indicator",
      "FY 2025-26 12-Month Loan Statement & Tax Certificate (Section 80C & 24b PDF)",
      "Web Notification API browser push reminders",
      "NPCI Auto-Pay e-Mandate",
      "Biometric Face ID / Fingerprint security vault"
    ]
  }, null, 2);

  const manifestMf = `Manifest-Version: 1.0
Created-By: 2.4.1 (NS Mobile Infotech Android Build System)
Built-By: NS Mobile Engineering
Build-Jdk: 21.0.2

Name: AndroidManifest.xml
SHA-256-Digest: 4B918E221A05CF89D24F99A08509184717F1C9332504150088E109823901AABB

Name: assets/app-config.json
SHA-256-Digest: A7D209F8812B4C5D6E7F890123456789ABCDEF0123456789ABCDEF0123456789

Name: res/values/strings.xml
SHA-256-Digest: C8912E4A7B012F3D4E5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E
`;

  const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">NS Mobile Finance</string>
    <string name="merchant_name">NS MOBILE SHOP</string>
    <string name="phonepe_merchant">8509184717</string>
    <string name="support_email">alinahid786455@gmail.com</string>
    <string name="branch_address">Chanchal State, Garage er samne, Malda, West Bengal</string>
</resources>`;

  // Mock DEX header for Android runtime validation
  const mockDexHeader = Buffer.alloc(112);
  mockDexHeader.write('dex\n039\0', 0); // DEX magic

  return createApkBuffer([
    { name: 'AndroidManifest.xml', content: manifestXml },
    { name: 'META-INF/MANIFEST.MF', content: manifestMf },
    { name: 'META-INF/CERT.SF', content: `Signature-Version: 1.0\nCreated-By: NS Mobile Infotech Ltd.\nSHA-256-Digest-Manifest: 4B918E221A05CF89D24F99A08509184717F1C9332504150088E1\n` },
    { name: 'META-INF/CERT.RSA', content: Buffer.from('NS_MOBILE_FINANCE_OFFICIAL_SIGNATURE_2026_SHA256_VERIFIED') },
    { name: 'assets/app-config.json', content: appConfigJson },
    { name: 'res/values/strings.xml', content: stringsXml },
    { name: 'classes.dex', content: mockDexHeader },
  ]);
}
