# ============================================================
# 真太阳时 · 安卓壳工程一键搭建
# 用法:powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

Write-Host "== 真太阳时 · 安卓壳工程搭建 ==" -ForegroundColor Cyan
Write-Host "工程目录: $root"
Write-Host ""

function Need($cmd, $hint) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "缺少 $cmd,$hint" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[1/6] 检查环境..." -ForegroundColor Yellow
Need node "请安装 Node.js 18+"
Need npx "请安装 npm/npx"
$nodeV = (node -v)
Write-Host "  node $nodeV"
if (Get-Command java -ErrorAction SilentlyContinue) {
    Write-Host "  java $((java -version 2>&1 | Select-Object -First 1))"
} else {
    Write-Host "  未检测到 java,出包时需 JDK 17(Android Studio 自带)" -ForegroundColor DarkYellow
}

Write-Host "[2/6] 安装依赖(npm install)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "npm install 失败" -ForegroundColor Red; exit 1 }

if (-not (Test-Path (Join-Path $root "android"))) {
    Write-Host "[3/6] 添加安卓平台(npx cap add android)..." -ForegroundColor Yellow
    npx cap add android
} else {
    Write-Host "[3/6] 安卓平台已存在,跳过" -ForegroundColor Yellow
}

Write-Host "[4/6] 拷贝网站资源到 www/ ..." -ForegroundColor Yellow
node scripts/copy-web.js

Write-Host "[5/6] 同步到安卓工程(npx cap sync)..." -ForegroundColor Yellow
npx cap sync android

Write-Host "[6/6] 生成签名密钥(如尚未生成)..." -ForegroundColor Yellow
if (-not (Test-Path (Join-Path $root "truesolar.jks"))) {
    Write-Host "  未发现 truesolar.jks,请手动运行:" -ForegroundColor DarkYellow
    Write-Host "    npm run sign:key" -ForegroundColor DarkYellow
} else {
    Write-Host "  已存在 truesolar.jks"
}

Write-Host ""
Write-Host "== 完成 ==" -ForegroundColor Green
Write-Host "后续步骤:"
Write-Host "  1) 复制 key.properties.example 为 android/key.properties 并填密码"
Write-Host "  2) 打开 zhen-app/icons.html 下载图标,放入 android/app/src/main/res/mipmap-*"
Write-Host "  3) 合并 android-manifest-snippet.xml 与 android-build.gradle-snippet 到工程"
Write-Host "  4) 出包: npm run build:aab   /   npm run build:apk"
Write-Host "  5) 预览: npm run open:android"
