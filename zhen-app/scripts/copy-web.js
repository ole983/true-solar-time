/* 把网站目录 true-solar-time/ 的运行时文件拷贝到 Capacitor 的 www/
   排除构建模板与开发用文件,只带 App 运行必需资源 */
const fs = require("fs");
const path = require("path");

const SRC = path.resolve(__dirname, "../../true-solar-time");
const DST = path.resolve(__dirname, "../www");

// 仅拷贝运行时文件;app-shell 类文件不进包
const INCLUDE = [
  "index.html", "cities.html", "jieqi.html", "liuzhu.html",
  "sun.html", "science.html", "tools.html", "privacy.html", "terms.html",
  "styles.css", "astro.js", "app.js", "cities.js", "bridge.js",
  "manifest.webmanifest", "favicon.svg", "icon-512.svg",
  "robots.txt", "sitemap.xml"
];

fs.rmSync(DST, { recursive: true, force: true });
fs.mkdirSync(DST, { recursive: true });

let n = 0;
for (const f of INCLUDE) {
  const s = path.join(SRC, f);
  if (!fs.existsSync(s)) { console.warn("  [skip] 缺失: " + f); continue; }
  fs.copyFileSync(s, path.join(DST, f));
  n++;
}
console.log("已拷贝 " + n + " 个文件到 www/");
console.log("提示:App 内不注册 Service Worker 亦可离线,www/ 本身即本地资源。");
