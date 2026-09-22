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

  // 月历
  await p.setViewport({width:900,height:1300});
  await p.goto(url("yueli.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,800));
  const cal=await p.evaluate(()=>({cells:document.querySelectorAll("#cal .cell:not(.blank)").length,title:document.getElementById("calTitle").innerText,now:document.getElementById("lunarNow").innerText,info:document.getElementById("dayInfo").innerText.slice(0,80)}));
  console.log("月历:",JSON.stringify(cal));

  // 对比页
  await p.goto(url("duibi.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,800));
  const vs=await p.evaluate(()=>({bj:document.getElementById("pBJ").innerText,tst:document.getElementById("pTST").innerText,verdict:document.getElementById("verdict").innerText.slice(0,120)}));
  console.log("对比(拉萨08:30):",JSON.stringify(vs));

  // 打卡
  await p.goto(url("index.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,1000));
  const dk=await p.evaluate(()=>{
    const box=document.getElementById("dakaBox");
    const btns=box?box.querySelectorAll("button[data-k]").length:0;
    if(box&&btns){box.querySelector('button[data-k="zaoshui"]').click();}
    return {btns,after:(document.getElementById("dakaBox")||{}).innerText.slice(0,60)};
  });
  console.log("打卡:",JSON.stringify(dk));

  // 底部导航(移动视口)
  await p.setViewport({width:390,height:844,isMobile:true});
  await p.goto(url("index.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,800));
  const bn=await p.evaluate(()=>({has:!!document.querySelector(".bottomnav"),n:document.querySelectorAll(".bottomnav a").length,vis:getComputedStyle(document.querySelector(".bottomnav")).display}));
  console.log("底部导航:",JSON.stringify(bn));
  await p.screenshot({path:"E:/cursor/ZHOUJIE/zhen-app/dist/bottomnav-mobile.png"});
  console.log("页面错误:",errs.length?errs.join(";"):"无");
  await b.close();
})().catch(e=>{console.error("FAIL:",e);process.exit(1);});
