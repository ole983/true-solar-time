# 真太阳时 · 安卓上架工程(zhen-app)

本目录是 Capacitor 壳工程模板,与网站 `true-solar-time/` 分离。网站继续独立部署网页版,本工程负责打安卓包上架各市场。

包名:**`com.ole983.truesolar`**(已定,终身不可改)
App 名:**`真太阳时`**(与软著名称一致)
签名别名:**`truesolar`**,有效期 30 年

---

## 一、目录结构

```text
zhen-app/
├── capacitor.config.ts           # 壳配置(包名/插件/启动屏)
├── package.json                  # 依赖与构建脚本
├── key.properties.example        # 签名配置示例(复制为 android/key.properties)
├── android-manifest-snippet.xml  # 清单关键节点模板
├── android-build.gradle-snippet  # build.gradle 签名与混淆段模板
├── store-listing.md              # 各市场提审文案定稿(直接复制粘贴)
├── screenshots.html              # 上架截图生成器(1080×1920 ×5)
├── icons.html                    # 应用图标生成器(自适应图标+全密度)
├── scripts/
│   ├── copy-web.js               # 把 true-solar-time/ 拷进 www/
│   └── gen-keystore.ps1          # 生成签名密钥
└── www/                          # 由 copy-web.js 生成,勿手动改
```

---

## 二、首次搭建(约 30 分钟)

```powershell
cd E:\cursor\ZHOUJIE\zhen-app

# 1. 安装依赖
npm install

# 2. 生成安卓平台(需已装 Android Studio 与 JDK 17)
npx cap add android

# 3. 拷贝网站资源到 www/ 并同步到安卓工程
npm run sync
```

前置环境:

```text
Node.js 18+            (你已装 v24)
JDK 17                 (Android Studio 自带)
Android Studio         (含 SDK 34、Build Tools 34)
```

---

## 三、每次更新网站后重新出包

```powershell
cd E:\cursor\ZHOUJIE\zhen-app
npm run sync          # 拷贝最新网站 + 同步插件
npm run build:aab     # 出 AAB(华为分发用)
npm run build:apk     # 出 APK(各市场审核真机测用)
```

产物路径:

```text
android/app/build/outputs/bundle/release/app-release.aab
android/app/build/outputs/apk/release/app-release.apk
```

---

## 四、签名(首次必做,丢了无法更新)

```powershell
npm run sign:key
# 生成 zhen-app/truesolar.jks,有效期 30 年
# 把 .jks 与密码存密码管理器 + 移动硬盘双备份
```

在 `android/key.properties` 填入(从示例复制):

```properties
storeFile=../truesolar.jks
storePassword=你的密码
keyAlias=truesolar
keyPassword=你的密码
```

并在 `android/app/build.gradle` 的 `signingConfigs` 与 `buildTypes.release` 引用它,`minifyEnabled true` + `shrinkResources true` 减小包体。

---

## 五、出包前检查清单(每次提审前过一遍)

```text
[ ] webContentsDebuggingEnabled = false
[ ] android:usesCleartextTraffic = "false"
[ ] targetSdkVersion = 34,minSdk 23+
[ ] 64 位:ndk abiFilters 含 arm64-v8a
[ ] android:screenOrientation = "portrait"
[ ] versionCode 递增,与 versionName 三处一致
[ ] 隐私政策/用户协议页可点(App 内 footer)
[ ] 首次启动不弹定位(点“定位我”才弹)
[ ] 冷启动 3 秒内可交互
[ ] 华为云测真机跑通(含折叠屏)
```

---

## 六、各市场要点

| 市场 | 包格式 | 额外要求 |
|---|---|---|
| 华为 AGC | AAB + APK | 软著 + App 备案 + 隐私政策链接 + 数据安全表单 + 健康类承诺函 |
| 小米 | APK | 隐私问卷细填定位用途;无需推送可勾选豁免 |
| OPPO / vivo | APK | 64 位合规;加固可选 |
| 应用宝 | 加固后 APK | 必须腾讯乐固加固;建议企业/个体户主体 |

---

## 七、合规三件套(最长路径,先跑)

```text
1. 软件著作权  名称:真太阳时     中国版权保护中心,普件 30-45 天 / 加急约 7 天
2. ICP 备案    主体与开发者一致   阿里云/腾讯云免费代办,7-20 天
3. 隐私政策    privacy.html      已随站点生成,直接填链接
```

---

## 八、图标与截图

```text
应用图标:用浏览器打开 zhen-app/icons.html,一键下载全套
          自适应前景/背景 + 传统方形/圆形 + 通知小图标
上架截图:用浏览器打开 zhen-app/screenshots.html,一键下载 5 张 1080×1920
提审文案:见 zhen-app/store-listing.md,简介/权限/隐私问卷直接复制
```

## 九、声明

本应用为天文计算与传统文化作息参考工具,不构成医疗建议。上架文案避免出现“治疗/疗效/诊断/处方”等词。
