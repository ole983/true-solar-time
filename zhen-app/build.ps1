# ============================================================
# 真太阳时 · 安卓一键构建脚本(build.ps1)
# 用法:powershell -ExecutionPolicy Bypass -File build.ps1 [all|assets|build|package]
#   all     : 全部(默认):拷贝网站 → 构建签名包 → 导出图标截图 → 汇总到 dist/
#   assets  : 只导出图标+截图(PNG)
#   build   : 只构建 APK/AAB(签名)
#   package : 只把产物汇总到 dist/
# 前置:Node 18+、JDK 17+(本机已配 JDK21)、Android SDK、Gradle 依赖已缓存
# ============================================================
$ErrorActionPreference = "Stop"

function Die($msg){ Write-Host "[错误] $msg" -ForegroundColor Red; exit 1 }

$APP = "真太阳时"
$VER = "1.0.0"
$ROOT = if($PSScriptRoot){ $PSScriptRoot } elseif($args.Length -gt 0){ Split-Path $args[0] } else { (Get-Location).Path }
$WEB  = Join-Path $ROOT "..\true-solar-time"
$ANDROID = Join-Path $ROOT "android"
$DIST = Join-Path $ROOT "dist"
$JAVA_HOME = $env:JAVA_HOME
# 本机探测 JDK(优先 Android 模板的 JBR,回退 JAVA_HOME/PATH)
$jdkCandidates = @(
  "$env:USERPROFILE\.jdks\jbr",
  "C:\Program Files\Java\jdk",
  ""
)

# 选定可用 gradle:优先已解压 Gradle 8.7,其次 wrapper(需联网下载)
function Find-GradleBin($wrapped){
  # 扫描 wrapper dists 中已解压的 gradle
  $dists = Join-Path $env:USERPROFILE ".gradle\wrapper\dists"
  if(Test-Path $dists){
    $found = Get-ChildItem $dists -Recurse -Filter "gradle.bat" -ErrorAction SilentlyContinue
    if($found){ return $found[0].FullName }
  }
  # 回退到系统 gradle
  $gp = (Get-Command gradle -ErrorAction SilentlyContinue)
  if($gp){ return $gp.Source }
  Die "未找到 Gradle。请先 npm install 并用 npx cap add android 生成 android 工程。"
}

function Run-Build($mode){
  $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

  # 1) 拷贝网站(排除 city/ 文件夹避免 App 冗余,保留核心页+桥接+合规页)
  Write-Host "==> 拷贝网站资源到 www/ (mode=$mode)" -ForegroundColor Cyan
  $www = Join-Path $ROOT "www"
  if(Test-Path $www){ Remove-Item $www -Recurse -Force }
  New-Item -ItemType Directory -Path $www -Force | Out-Null
  if(-not (Test-Path $WEB)){ Die "网站目录不存在: $WEB" }
  Get-ChildItem $WEB | ? { $_.Name -ne "city" -and $_.Name -ne "scripts" -and $_.Name -ne "README.md" -and $_.Name -ne "APP-PACK.md" } |
    % { Copy-Item $_.FullName $www -Recurse -Force }

  # 2) 同步插件(各页已引用 bridge.js)
  Write-Host "==> npm install + cap sync" -ForegroundColor Cyan
  Push-Location $ROOT
  if(-not (Test-Path "node_modules\@capacitor\android")){ npm install }
  npx cap sync android 2>&1 | Out-String | Out-Null
  Pop-Location

  # 3) 构建(优先在选择 Gradle 8.7)
  Write-Host "==> 构建 release APK + AAB" -ForegroundColor Cyan
  # local.properties: 指向 Android SDK
  $lp = Join-Path $ANDROID "local.properties"
  "sdk.dir=$env:ANDROID_HOME" | Set-Content $lp -Encoding utf8

  Push-Location $ANDROID
  $gradle = Find-GradleBin
  Write-Host "    Gradle → $gradle"
  & $gradle assembleRelease bundleRelease --no-daemon
  if($LASTEXITCODE -ne 0){ Pop-Location; Die "Gradle 构建失败" }
  Pop-Location
}

function Export-Assets{
  Write-Host "==> 导出图标与截图(Puppeteer)" -ForegroundColor Cyan
  Push-Location $ROOT
  node scripts\export-assets.js
  if($LASTEXITCODE -ne 0){ Die "图标/截图导出失败" }
  Pop-Location
}

function Package{
  Write-Host "==> 汇总到 dist/" -ForegroundColor Cyan
  New-Item -ItemType Directory -Path $DIST -Force | Out-Null
  $apk = Join-Path $ANDROID "app\build\outputs\apk\release\app-release.apk"
  $aab = Join-Path $ANDROID "app\build\outputs\bundle\release\app-release.aab"
  $dbg = Join-Path $ANDROID "app\build\outputs\apk\debug\app-debug.apk"
  $jks = Join-Path $ROOT "truesolar.jks"

  if(Test-Path $apk){ Copy-Item $apk (Join-Path $DIST "${APP}-${VER}-release.apk") -Force }
  if(Test-Path $aab){ Copy-Item $aab (Join-Path $DIST "${APP}-${VER}-release.aab") -Force }
  if(Test-Path $dbg){ Copy-Item $dbg (Join-Path $DIST "${APP}-${VER}-debug.apk") -Force }
  if(Test-Path $jks){ Copy-Item $jks (Join-Path $DIST "truesolar-keystore.jks") -Force }

  Write-Host "" -ForegroundColor Cyan
  Write-Host "dist 交付目录:" -ForegroundColor Yellow
  Get-ChildItem $DIST -Recurse -File | % { Write-Host ("  " + $_.FullName.Substring($DIST.Length+1) + "  " + [math]::Round($_.Length/1KB,1) + "KB") }
}

$arg = if($args.Length -eq 0){ "all" } else { $args[0] }
$mode = if($arg -eq "all"){ "all" } elseif($arg -eq "assets"){ "assets" } elseif($arg -eq "build"){ "build" } else { "package" }

switch($mode){
  "assets"  { Export-Assets }
  "build"   { Run-Build "build"; Package }
  "package" { Package }
  default   { Run-Build "all"; Export-Assets; Package }
}
Write-Host "完成 ✓" -ForegroundColor Green