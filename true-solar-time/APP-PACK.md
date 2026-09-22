# App 套壳工程说明(zhen-app)

包名:`com.ole983.truesolar` · App 名:`真太阳时` · 签名别名:`truesolar`,有效期 30 年。

## 1. 新建工程(在仓库外执行,不要污染 ZHOUJIE)

```powershell
cd E:\cursor
npm create capacitor-app@latest zhen-app -- --app-id="com.ole983.truesolar" --app-name="真太阳时"
cd zhen-app
npm install
npm install @capacitor/splash-screen @capacitor/geolocation @capacitor/local-notifications @capacitor/share @capacitor/app
Remove-Item www -Recurse -Force
Copy-Item -Recurse E:\cursor\ZHOUJIE\true-solar-time www
npx cap add android
```

## 2. capacitor.config.ts(直接覆盖)

```ts
import { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.ole983.truesolar',
  appName: '真太阳时',
  webDir: 'www',
  backgroundColor: '#070b16',
  android: { allowMixedContent: false, captureInput: true, webContentsDebuggingEnabled: false },
  plugins: {
    SplashScreen: { launchShowDuration: 800, backgroundColor: '#070b16', showSpinner: false },
    LocalNotifications: { smallIcon: 'ic_stat_sun', iconColor: '#e8c36a' }
  }
};
export default config;
```

## 3. Android 关键项

* `android:screenOrientation="portrait"` 锁竖屏。
* 只申请 `ACCESS_COARSE_LOCATION + POST_NOTIFICATIONS + VIBRATE`,不要精确和后台定位。
* 图标用 `npx capacitor-assets` 由 `icon-512.svg` 生成自适应图标。
* `minSdkVersion 24, targetSdkVersion 34`,64 位默认满足。

## 4. 签名(只做一次,双备份)

```powershell
keytool -genkeypair -alias truesolar -keyalg RSA -keysize 2048 -validity 10950 -keystore truesolar.jks
```

jks + 密码存密码管理器 + 移动硬盘。丢了无法更新,只能改包名重发。

## 5. 出包

```powershell
Copy-Item -Recurse E:\cursor\ZHOUJIE\true-solar-time\* www -Force
npx cap sync android
cd android; ./gradlew bundleRelease assembleRelease
```

产物:`app-release.aab`(华为分发)+`app-release.apk`(审核与小米/OV)。应用宝需再过腾讯乐固加固。

## 6. 网页侧已就绪

* `bridge.js` 双跑桥接已加入本目录,各页按需引用即可。
* `privacy.html/terms.html` 已上线,提审填此链接:
  https://ole983.github.io/true-solar-time/privacy.html
  https://ole983.github.io/true-solar-time/terms.html
* 文案已去医疗化,简介请用:“按太阳位置判定时辰的今日作息工具”,不写治疗/诊断/处方。
