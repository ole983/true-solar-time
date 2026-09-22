const puppeteer=require("puppeteer");
const fs=require("fs"),path=require("path");
const WEB="E:/cursor/ZHOUJIE/true-solar-time";
function findChrome(root){const st=[root];while(st.length){const d=st.pop();let es;try{es=fs.readdirSync(d,{withFileTypes:true});}catch(e){continue;}for(const e of es){const p=path.join(d,e.name);if(e.isDirectory())st.push(p);else if(e.name==="chrome.exe")return p;}}return null;}
(async()=>{
  const exe=findChrome(path.join(process.env.USERPROFILE,".cache","puppeteer"));
  const b=await puppeteer.launch({headless:"shell",executablePath:exe,args:["--no-sandbox"]});
  const p=await b.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(e.message));
  await p.goto("file:///"+path.join(WEB,"zeri.html").replace(/\\/g,"/"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,700));
  // 未开通:应弹门槛
  await p.evaluate(()=>{document.getElementById("bDate").value="2000-01-01";document.getElementById("bTime").value="12:00";document.getElementById("bCity").value="北京";document.getElementById("calcBtn").click();});
  await new Promise(r=>setTimeout(r,300));
  const g1=await p.evaluate(()=>{const g=document.getElementById("vipGate");return g?g.className:"";});
  console.log("未开通点排盘 → 门槛:",g1.includes("on")?"弹出 ✓":"未弹 ✗");
  // 激活会员
  await p.evaluate(()=>{document.getElementById("vipGate").classList.remove("on");const r=window.TST.VIP.activate(window.TST.VIP.makeCode("Y",366,"TT"));if(!r.ok)console.log("激活失败");});
  await p.evaluate(()=>{document.getElementById("calcBtn").click();});
  await new Promise(r=>setTimeout(r,400));
  const pillars=await p.evaluate(()=>[...document.querySelectorAll("#pillars .gz")].map(e=>e.innerText).join(" "));
  const note=await p.evaluate(()=>document.getElementById("pillarNote").innerText);
  console.log("2000-01-01 12:00 北京 四柱:",pillars);
  console.log("  期望: 己卯年 丙子月 戊午日 戊午时");
  console.log("  说明:",note.replace(/\n/g," ").slice(0,120));
  // 时辰格
  const hg=await p.evaluate(()=>{const a=[...document.querySelectorAll("#hourgrid .hg")];return a.map(x=>x.querySelector(".z").innerText+"("+x.querySelector(".s").innerText+")").join(" ");});
  console.log("十二时辰吉凶:",hg);
  const hn=await p.evaluate(()=>document.getElementById("hourNote").innerText);
  console.log("吉时:",hn.replace(/\n/g," ").slice(0,120));
  // 拉萨:验证真太阳时跨时辰
  await p.evaluate(()=>{document.getElementById("bCity").value="拉萨";document.getElementById("bTime").value="08:30";document.getElementById("bDate").value="2000-06-01";document.getElementById("calcBtn").click();});
  await new Promise(r=>setTimeout(r,400));
  const p2=await p.evaluate(()=>[...document.querySelectorAll("#pillars .gz")].map(e=>e.innerText).join(" "));
  const n2=await p.evaluate(()=>document.getElementById("pillarNote").innerText);
  console.log("拉萨 2000-06-01 08:30:",p2,"|",n2.replace(/\n/g," ").slice(0,90));
  console.log("页面错误:",errs.length?errs.join(";"):"无");
  await b.close();
})().catch(e=>{console.error("FAIL:",e);process.exit(1);});
