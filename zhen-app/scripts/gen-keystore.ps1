# 生成安卓签名密钥(keystore)
# 用法:powershell -ExecutionPolicy Bypass -File scripts/gen-keystore.ps1
# 重要:密钥与密码一旦丢失,将永远无法更新已上架的应用,务必异地双备份!

$ErrorActionPreference = "Stop"

$alias = "truesolar"
$outDir = Join-Path $PSScriptRoot ".."
$keystore = Join-Path $outDir "truesolar.jks"

if (Test-Path $keystore) {
  Write-Host "已存在 $keystore,跳过生成。如需重建请先手动删除并确认已备份。" -ForegroundColor Yellow
  exit 0
}

Write-Host "即将生成签名密钥,请按提示输入(密码请自行妥善保存):" -ForegroundColor Cyan
Write-Host "  keystore 文件 : $keystore"
Write-Host "  别名 alias    : $alias"
Write-Host "  有效期        : 10950 天(约 30 年,满足各市场 25 年要求)"
Write-Host ""

keytool -genkeypair `
  -alias $alias `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10950 `
  -keystore $keystore `
  -storetype JKS

Write-Host ""
Write-Host "生成完成。接下来:" -ForegroundColor Green
Write-Host "1) 把 $keystore 和密码存到密码管理器 + 移动硬盘双备份"
Write-Host "2) 在 android/key.properties 填入密钥信息(见 key.properties.example)"
Write-Host "3) 运行 npm run build:apk / npm run build:aab 出包"
