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

  // 首页:长辈模式+黄历+朗读
  await p.goto(url("index.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,900));
  const hero=await p.evaluate(()=>({elder:!!document.getElementById("elderBtn"),speak:!!document.getElementById("speakBtn"),more:!!document.getElementById("heroMore"),hl:document.getElementById("hlToday").innerText.slice(0,60)}));
  console.log("首页:",JSON.stringify(hero));
  await p.evaluate(()=>window.TSTElder.set(true));
  await new Promise(r=>setTimeout(r,300));
  const fs20=await p.evaluate(()=>getComputedStyle(document.documentElement).fontSize);
  console.log("长辈模式: html字号="+fs20+" (期望20px)");
  await p.screenshot({path:"E:/cursor/ZHOUJIE/zhen-app/dist/elder-mode.png"});
  await p.evaluate(()=>window.TSTElder.set(false));
  // 黄历校验:2026-09-22 日柱应为戊午,建除需为十二神之一
  const hl=await p.evaluate(()=>document.getElementById("hlToday").innerText);
  console.log("黄历全文:",hl);

  // 择时:早晚子时+藏干+胎元命宫
  await p.goto(url("zeri.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,600));
  await p.evaluate(()=>{window.TST.VIP.activate(window.TST.VIP.makeCode("Y",366,"T"));});
  async function calc(date,time,zi){
    await p.evaluate((d,t,z)=>{document.getElementById("bDate").value=d;document.getElementById("bTime").value=t;document.getElementById("bCity").value="北京";document.getElementById("ziMode").value=z;document.getElementById("calcBtn").click();},date,time,zi);
    await new Promise(r=>setTimeout(r,400));
    const pillars=await p.evaluate(()=>[...document.querySelectorAll("#pillars .gz")].map(e=>e.innerText).join(" "));
    const cang=await p.evaluate(()=>[...document.querySelectorAll("#cangBody tr")].map(tr=>[...tr.children].map(td=>td.innerText.replace(/\n/g,"/")).join(":")).join(" | "));
    const tm=await p.evaluate(()=>[...document.querySelectorAll("#taimingBody tr")].map(tr=>[...tr.children].map(td=>td.innerText).join("")).join(" | "));
    console.log("["+date+" "+time+" "+zi+"] "+pillars);
    console.log("   藏干:"+cang);
    console.log("   "+tm);
  }
  await calc("2000-01-01","12:00","early");
  await calc("2000-01-01","23:30","early"); // 夜子→次日
  await calc("2000-01-01","23:30","late");  // 夜子→当日
  console.log("页面错误:",errs.length?errs.join(";"):"无");
  await b.close();
})().catch(e=>{console.error("FAIL:",e);process.exit(1);});
