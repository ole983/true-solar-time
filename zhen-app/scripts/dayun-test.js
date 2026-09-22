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
  await p.evaluate(()=>{window.TST.VIP.activate(window.TST.VIP.makeCode("Y",366,"T"));});
  async function run(date,time,city,gender){
    await p.evaluate((d,t,c,g)=>{document.getElementById("bDate").value=d;document.getElementById("bTime").value=t;document.getElementById("bCity").value=c;document.getElementById("gender").value=g;document.getElementById("calcBtn").click();},date,time,city,gender);
    await new Promise(r=>setTimeout(r,400));
    const pillars=await p.evaluate(()=>[...document.querySelectorAll("#pillars .gz")].map(e=>e.innerText).join(" "));
    const info=await p.evaluate(()=>document.getElementById("dayunInfo").innerText);
    const rows=await p.evaluate(()=>[...document.querySelectorAll("#dayunBody tr")].slice(0,4).map(tr=>[...tr.children].map(td=>td.innerText).join("|")).join("  ///  "));
    const ln=await p.evaluate(()=>document.getElementById("liunianNote").innerText);
    console.log("["+date+" "+time+" "+city+" "+gender+"] "+pillars);
    console.log("   大运:"+info);
    console.log("   "+rows);
    console.log("   "+ln);
  }
  await run("2000-01-01","12:00","北京","m");  // 己卯年=阴年,男→逆排;月柱丙子→乙亥起
  await run("2000-01-01","12:00","北京","f");  // 阴年女→顺排;丙子→丁丑起
  console.log("页面错误:",errs.length?errs.join(";"):"无");
  await b.close();
})().catch(e=>{console.error("FAIL:",e);process.exit(1);});
