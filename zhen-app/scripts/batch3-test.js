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

  // 养生卡
  await p.goto(url("jieqi.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,1500));
  const yc=await p.evaluate(()=>{
    const btn=document.getElementById("yangCardBtn");
    if(!btn)return {has:false};
    btn.click();
    return new Promise(res=>setTimeout(()=>res({has:true,drawn:document.getElementById("yangCard").toDataURL().length}),600));
  });
  console.log("养生卡:",JSON.stringify(yc),"(drawn>5000 表示画出内容)");

  // 择吉
  await p.goto(url("zeji.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,700));
  await p.evaluate(()=>{window.TST.VIP.activate(window.TST.VIP.makeCode("Y",366,"T"));document.getElementById("scene").value="嫁娶";document.getElementById("calcBtn").click();});
  await new Promise(r=>setTimeout(r,700));
  const zj=await p.evaluate(()=>({n:document.querySelectorAll("#zejiBody tr").length,first:document.querySelector("#zejiBody tr")?document.querySelector("#zejiBody tr").innerText.replace(/\n/g,"/").slice(0,60):"",note:document.getElementById("zejiNote").innerText.slice(0,50)}));
  console.log("择吉(嫁娶本月):",JSON.stringify(zj));

  // 繁体
  await p.goto(url("index.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,900));
  const ft=await p.evaluate(()=>{
    const has=!!document.getElementById("fanBtn");
    window.TSTFan.toggle();
    return new Promise(res=>setTimeout(()=>res({has,nav:[...document.querySelectorAll("nav.tabs a")].slice(0,4).map(a=>a.innerText).join("/")}),400));
  });
  console.log("繁体:",JSON.stringify(ft));

  // 为父母开通
  await p.goto(url("vip.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,600));
  const gift=await p.evaluate(()=>({has:!!document.getElementById("giftBtn")}));
  console.log("为父母开通:",JSON.stringify(gift));
  console.log("页面错误:",errs.length?errs.join(";"):"无");
  await b.close();
})().catch(e=>{console.error("FAIL:",e);process.exit(1);});
