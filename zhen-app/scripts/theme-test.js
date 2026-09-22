const puppeteer=require("puppeteer");
const fs=require("fs"),path=require("path");
const WEB="E:/cursor/ZHOUJIE/true-solar-time";
function findChrome(root){const st=[root];while(st.length){const d=st.pop();let es;try{es=fs.readdirSync(d,{withFileTypes:true});}catch(e){continue;}for(const e of es){const p=path.join(d,e.name);if(e.isDirectory())st.push(p);else if(e.name==="chrome.exe")return p;}}return null;}
const url=f=>"file:///"+path.join(WEB,f).replace(/\\/g,"/");
(async()=>{
  const exe=findChrome(path.join(process.env.USERPROFILE,".cache","puppeteer"));
  const b=await puppeteer.launch({headless:"shell",executablePath:exe,args:["--no-sandbox"]});
  const p=await b.newPage();
  const errs=[];p.on("pageerror",e=>errs.push("pageerror: "+e.message));
  await p.setViewport({width:900,height:1400});
  await p.goto(url("index.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,1000));

  async function snap(label){
    const d=await p.evaluate(()=>({
      theme:document.documentElement.getAttribute("data-theme"),
      btn:(document.getElementById("themeBtn")||{}).textContent,
      bg:getComputedStyle(document.body).backgroundColor,
      txt:getComputedStyle(document.body).color,
      gold:getComputedStyle(document.documentElement).getPropertyValue("--gold").trim(),
      hTst:document.getElementById("hTst").innerText,
      hBj:document.getElementById("hBj").innerText,
      hDiff:document.getElementById("hDiff").innerText,
      hDate:document.getElementById("hDate").innerText,
      sc:document.getElementById("scZi").innerText+" "+document.getElementById("scNow").innerText
    }));
    console.log("["+label+"] theme="+d.theme+" btn="+d.btn+" bg="+d.bg+" gold="+d.gold);
    console.log("   "+d.hDate+" | 真太阳 "+d.hTst+" | 北京 "+d.hBj+" | "+d.hDiff+" | "+d.sc);
    return d;
  }
  await snap("默认");
  await p.screenshot({path:"E:/cursor/ZHOUJIE/zhen-app/dist/theme-light.png"});
  // 切换
  await p.click("#themeBtn");
  await new Promise(r=>setTimeout(r,500));
  await snap("切换后");
  await p.screenshot({path:"E:/cursor/ZHOUJIE/zhen-app/dist/theme-dark.png"});
  // 再切回
  await p.click("#themeBtn");
  await new Promise(r=>setTimeout(r,400));
  const back=await p.evaluate(()=>document.documentElement.getAttribute("data-theme"));
  console.log("再切回:",back);
  // 持久化验证
  const stored=await p.evaluate(()=>{try{return localStorage.getItem("tst.theme.v1")}catch(e){return "n/a"}});
  console.log("localStorage 主题:",stored);
  // 各页主题按钮存在性
  for(const f of ["tools.html","zeri.html","vip.html","sun.html","city/北京.html"]){
    await p.goto(url(f),{waitUntil:"networkidle0",timeout:60000});
    await new Promise(r=>setTimeout(r,500));
    const has=await p.evaluate(()=>!!document.getElementById("themeBtn"));
    const t=await p.evaluate(()=>document.documentElement.getAttribute("data-theme"));
    console.log(f.padEnd(16),"themeBtn:"+(has?"有":"无"),"theme:"+t);
  }
  console.log("页面错误:",errs.length?errs.join(" ; "):"无");
  await b.close();
})().catch(e=>{console.error("FAIL:",e);process.exit(1);});
