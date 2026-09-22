const puppeteer=require("puppeteer");
const fs=require("fs"),path=require("path");
const WEB="E:/cursor/ZHOUJIE/true-solar-time";
function findChrome(root){const st=[root];while(st.length){const d=st.pop();let es;try{es=fs.readdirSync(d,{withFileTypes:true});}catch(e){continue;}for(const e of es){const p=path.join(d,e.name);if(e.isDirectory())st.push(p);else if(e.name==="chrome.exe")return p;}}return null;}
const url=f=>"file:///"+path.join(WEB,f).replace(/\\/g,"/");
(async()=>{
  const exe=findChrome(path.join(process.env.USERPROFILE,".cache","puppeteer"));
  const b=await puppeteer.launch({headless:"shell",executablePath:exe,args:["--no-sandbox"]});
  const p=await b.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(e.message));
  await p.setViewport({width:900,height:1300});
  // 首页长辈模式截图
  await p.goto(url("index.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,1200));
  await p.evaluate(()=>{document.getElementById("heroMore").open=true;window.TSTElder.set(true);});
  await new Promise(r=>setTimeout(r,400));
  await p.screenshot({path:"E:/cursor/ZHOUJIE/zhen-app/dist/elder-mode.png"});
  const elder=await p.evaluate(()=>({fs:getComputedStyle(document.documentElement).fontSize,hl:document.getElementById("hlToday").innerText}));
  console.log("长辈模式:",elder.fs,"| 黄历:",elder.hl);
  // 择时胎元命宫
  await p.goto(url("zeri.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,600));
  await p.evaluate(()=>{window.TST.VIP.activate(window.TST.VIP.makeCode("Y",366,"T"));document.getElementById("bDate").value="2000-01-01";document.getElementById("bTime").value="12:00";document.getElementById("bCity").value="北京";document.getElementById("calcBtn").click();});
  await new Promise(r=>setTimeout(r,500));
  const tm=await p.evaluate(()=>[...document.querySelectorAll("#taimingBody tr")].map(tr=>[...tr.children].map(td=>td.innerText).join("")).join(" | "));
  console.log("胎元命宫(丙子月→丁丑胎元,期望):",tm);
  console.log("页面错误:",errs.length?errs.join(";"):"无");
  await b.close();
})().catch(e=>{console.error("FAIL:",e);process.exit(1);});
