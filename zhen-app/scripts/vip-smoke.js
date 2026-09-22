const puppeteer=require("puppeteer");
const fs=require("fs"),path=require("path");
const WEB="E:/cursor/ZHOUJIE/true-solar-time";
function findChrome(root){const st=[root];while(st.length){const d=st.pop();let es;try{es=fs.readdirSync(d,{withFileTypes:true});}catch(e){continue;}for(const e of es){const p=path.join(d,e.name);if(e.isDirectory())st.push(p);else if(e.name==="chrome.exe")return p;}}return null;}
const url=f=>"file:///"+path.join(WEB,f).replace(/\\/g,"/");
(async()=>{
  const exe=findChrome(path.join(process.env.USERPROFILE,".cache","puppeteer"));
  const b=await puppeteer.launch({headless:"shell",executablePath:exe,args:["--no-sandbox"]});
  const p=await b.newPage();
  const errs=[];p.on("pageerror",e=>errs.push("pageerror: "+e.message));p.on("console",m=>{if(m.type()==="error")errs.push("console: "+m.text());});

  // 1) 会员页
  await p.goto(url("vip.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,800));
  const s0=await p.evaluate(()=>document.getElementById("myStatus").innerText);
  console.log("初始状态:", s0.replace(/\n/g," "));
  // 生成有效码并激活
  const code=await p.evaluate(()=>window.TST.VIP.makeCode("Y",366,"TEST"));
  console.log("生成年度码:", code);
  await p.evaluate(c=>{document.getElementById("codeInput").value=c;document.getElementById("activateBtn").click();}, code);
  await new Promise(r=>setTimeout(r,500));
  const s1=await p.evaluate(()=>document.getElementById("myStatus").innerText);
  const nav=await p.evaluate(()=>document.getElementById("navVip").innerText);
  console.log("激活后状态:", s1.replace(/\n/g," "));
  console.log("导航徽章:", nav);
  // 无效码
  await p.evaluate(()=>{document.getElementById("codeInput").value="TST-Y-366-FAKE-0000";document.getElementById("activateBtn").click();});
  await new Promise(r=>setTimeout(r,300));
  const s2=await p.evaluate(()=>document.getElementById("codeMsg").innerText);
  console.log("无效码提示:", s2);

  // 2) 工具页:会员后任意日期查询解锁
  await p.goto(url("tools.html"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,900));
  const lock=await p.evaluate(()=>document.getElementById("dateLock").innerText);
  console.log("日期查询锁标记:", lock);
  await p.evaluate(()=>{document.getElementById("dateIn").value="2027-01-01";document.getElementById("dateBtn").click();});
  await new Promise(r=>setTimeout(r,400));
  const dr=await p.evaluate(()=>document.getElementById("dateRes").innerText);
  console.log("查询结果:", dr.replace(/\n/g," | ").slice(0,160));

  // 3) 未开通会员时:门槛弹窗
  await p.evaluate(()=>{window.TST.VIP.clear();});
  await p.evaluate(()=>{document.getElementById("dateBtn").click();});
  await new Promise(r=>setTimeout(r,400));
  const gate=await p.evaluate(()=>{const g=document.getElementById("vipGate");return g?g.className:"";});
  console.log("未开通时门槛弹窗:", gate.includes("on")?"已弹出 ✓":"未弹出 ✗");

  console.log("页面错误:", errs.length? errs.join(" ; ") : "无");
  await b.close();
})().catch(e=>{console.error("TEST_FAIL:",e);process.exit(1);});
