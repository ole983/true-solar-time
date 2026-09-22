const puppeteer=require("puppeteer");
const fs=require("fs"),path=require("path");
const WEB="E:/cursor/ZHOUJIE/true-solar-time";
function findChrome(root){const st=[root];while(st.length){const d=st.pop();let es;try{es=fs.readdirSync(d,{withFileTypes:true});}catch(e){continue;}for(const e of es){const p=path.join(d,e.name);if(e.isDirectory())st.push(p);else if(e.name==="chrome.exe")return p;}}return null;}
(async()=>{
  const exe=findChrome(path.join(process.env.USERPROFILE,".cache","puppeteer"));
  const b=await puppeteer.launch({headless:"shell",executablePath:exe,args:["--no-sandbox"]});
  const p=await b.newPage();
  const errs=[];p.on("pageerror",e=>errs.push("pageerror: "+e.message));
  await p.setViewport({width:820,height:1500,deviceScaleFactor:1});
  await p.goto("file:///"+path.join(WEB,"design-preview.html").replace(/\\/g,"/"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,1200));
  const out="E:/cursor/ZHOUJIE/zhen-app/dist/design-preview.png";
  await p.screenshot({path:out,fullPage:true});
  const data=await p.evaluate(()=>({tst:document.getElementById("tst").innerText,diff:document.getElementById("diffTxt").innerText,sc:document.getElementById("scZi").innerText,three:document.getElementById("three").innerText.replace(/\n/g," | "),twelve:document.querySelectorAll(".twelve .c").length,arc:document.getElementById("arcSvg").innerHTML.length}));
  console.log("真太阳时:",data.tst,"| 差:",data.diff,"| 时辰:",data.sc);
  console.log("三事:",data.three.slice(0,120));
  console.log("十二时辰格:",data.twelve,"| 日轨SVG长度:",data.arc);
  console.log("页面错误:",errs.length?errs.join(";"):"无");
  console.log("截图 →",out);
  await b.close();
})().catch(e=>{console.error("FAIL:",e);process.exit(1);});
