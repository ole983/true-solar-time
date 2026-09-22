const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function main(){
  // 自动定位 chrome
  const dirs = await import("puppeteer/lib/cjs/puppeteer/util/fsutil.js").then(()=>{}).catch(()=>null);
  let exe;
  const cacheRoot = process.env.PUPPETEER_CACHE_DIR || path.join(process.env.USERPROFILE||"", ".cache", "puppeteer");
  const found = fs.existsSync(cacheRoot) && fs.readdirSync(cacheRoot).length;
  // 直接找 chrome.exe
  exe = findChrome(cacheRoot);
  if(!exe){ console.error("未找到 chrome.exe 于 "+cacheRoot); process.exit(1); }

  const DIST = path.resolve(__dirname, "../dist");
  const iconDir = path.join(DIST, "icons");
  const shotDir = path.join(DIST, "screenshots");
  fs.mkdirSync(iconDir, { recursive:true });
  fs.mkdirSync(shotDir, { recursive:true });

  const browser = await puppeteer.launch({ headless:"shell", executablePath: exe, args:["--no-sandbox","--font-render-hinting=none","--disable-gpu"] });
  const page = await browser.newPage();
  console.log("chrome ok");

  // 1) 图标页
  await page.goto("file:///" + path.resolve(__dirname, "../icons.html").replace(/\\/g,"/"), { waitUntil:"networkidle0", timeout:60000 });
  await sleep(1500);
  const iconData = await page.evaluate(() => {
    const cvs = [...document.querySelectorAll("#grid canvas")];
    return cvs.map(c => ({ name: c.dataset.file || c.parentElement.querySelector("button").innerText, data: c.toDataURL("image/png") }));
  });
  const iconFiles = ["ic_launcher-playstore.png","ic_launcher_round.png","ic_launcher_foreground.png","ic_launcher_background.png","preview_round.png","ic_stat_sun.png"];
  for(let i=0;i<iconData.length && i<iconFiles.length;i++){
    fs.writeFileSync(path.join(iconDir, iconFiles[i]), b64(iconData[i].data));
  }
  console.log("图标导出 "+(Math.min(iconData.length,iconFiles.length))+" 个");

  // 2) 截图页(含真实 ASTRO 数据)
  await page.goto("file:///" + path.resolve(__dirname, "../screenshots.html").replace(/\\/g,"/"), { waitUntil:"networkidle0", timeout:60000 });
  await sleep(2500);
  const shotData = await page.evaluate(() => {
    return [...document.querySelectorAll("#grid canvas")].map(c => c.toDataURL("image/png"));
  });
  const shotNames = ["①行动卡-今日几点睡.png","②全国总表-340城.png","③节气-精确交节.png","④黄金时刻-晒太阳.png","⑤节气海报-一键分享.png"];
  for(let i=0;i<shotData.length && i<shotNames.length;i++){
    fs.writeFileSync(path.join(shotDir, shotNames[i]), b64(shotData[i]));
  }
  console.log("截图导出 "+(Math.min(shotData.length,shotNames.length))+" 张");

  await browser.close();
  console.log("完成 → "+DIST);
}

function findChrome(root){
  const stack=[root];
  while(stack.length){
    const d=stack.pop();
    let entries;
    try{ entries=fs.readdirSync(d,{withFileTypes:true}); }catch(e){ continue; }
    for(const e of entries){
      const p=path.join(d,e.name);
      if(e.isDirectory()) stack.push(p);
      else if(e.name==="chrome.exe") return p;
    }
  }
  return null;
}
function b64(dataUrl){ return Buffer.from(dataUrl.split(",")[1], "base64"); }
const sleep = ms => new Promise(r=>setTimeout(r,ms));

main().catch(e=>{ console.error("EXPORT_FAIL:", e); process.exit(1); });