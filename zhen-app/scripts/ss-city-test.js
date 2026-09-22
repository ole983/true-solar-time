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

  // 1) 择时:十神纳音
  await p.goto(url("zeri.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,600));
  await p.evaluate(()=>{window.TST.VIP.activate(window.TST.VIP.makeCode("Y",366,"T"));});
  await p.evaluate(()=>{document.getElementById("bDate").value="2000-01-01";document.getElementById("bTime").value="12:00";document.getElementById("bCity").value="北京";document.getElementById("gender").value="m";document.getElementById("calcBtn").click();});
  await new Promise(r=>setTimeout(r,500));
  const ss=await p.evaluate(()=>[...document.querySelectorAll("#ssBody tr")].map(tr=>[...tr.children].map(td=>td.innerText.replace(/\n/g,"/")).join(" | ")).join("\n"));
  console.log("四柱十神纳音(2000-01-01 12:00 北京,日干戊):\n"+ss);
  console.log("期望: 年己卯→劫财/城头土; 月丙子→偏印/涧下水; 日戊午→日元/天上火; 时戊午→比肩/天上火");
  const note=await p.evaluate(()=>document.getElementById("ssNote").innerText);
  console.log("说明:",note);

  // 2) 城市页双主题
  for(const t of ["light","dark"]){
    await p.goto(url("city/北京.html"),{waitUntil:"networkidle0",timeout:60000});
    await new Promise(r=>setTimeout(r,500));
    await p.evaluate(v=>window.TSTTheme.set(v),t);
    await new Promise(r=>setTimeout(r,300));
    const d=await p.evaluate(()=>({theme:document.documentElement.getAttribute("data-theme"),bg:getComputedStyle(document.body).backgroundColor,qa:getComputedStyle(document.querySelector(".qa")).color,nav:document.querySelector('nav.tabs a[href="../zeri.html"]')?"有择时":"无择时"}));
    console.log("城市页["+t+"]:",d.theme,"bg="+d.bg,"qa="+d.qa,d.nav);
    if(t==="dark")await p.screenshot({path:"E:/cursor/ZHOUJIE/zhen-app/dist/city-dark.png"});
  }
  console.log("页面错误:",errs.length?errs.join(";"):"无");
  await b.close();
})().catch(e=>{console.error("FAIL:",e);process.exit(1);});
