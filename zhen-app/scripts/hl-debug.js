const puppeteer=require("puppeteer");
const fs=require("fs"),path=require("path");
const WEB="E:/cursor/ZHOUJIE/true-solar-time";
function findChrome(root){const st=[root];while(st.length){const d=st.pop();let es;try{es=fs.readdirSync(d,{withFileTypes:true});}catch(e){continue;}for(const e of es){const p=path.join(d,e.name);if(e.isDirectory())st.push(p);else if(e.name==="chrome.exe")return p;}}return null;}
(async()=>{
  const exe=findChrome(path.join(process.env.USERPROFILE,".cache","puppeteer"));
  const b=await puppeteer.launch({headless:"shell",executablePath:exe,args:["--no-sandbox"]});
  const p=await b.newPage();
  await p.goto("file:///"+path.join(WEB,"index.html").replace(/\\/g,"/"),{waitUntil:"networkidle0",timeout:60000});
  await new Promise(r=>setTimeout(r,1500));
  const d=await p.evaluate(()=>{
    const el=document.getElementById("hlToday");
    const cs=getComputedStyle(el);
    return {html:el.innerHTML.slice(0,120),display:cs.display,vis:cs.visibility,color:cs.color,
      parent:el.parentElement.tagName+"."+el.parentElement.className,
      open:el.closest("details")?el.closest("details").open:"no-details"};
  });
  console.log(JSON.stringify(d));
  // 展开 details 再读
  const d2=await p.evaluate(()=>{
    const dt=document.getElementById("heroMore");dt.open=true;
    const el=document.getElementById("hlToday");
    return {text:el.innerText,w:el.offsetWidth,h:el.offsetHeight};
  });
  console.log("展开后:",JSON.stringify(d2));
  await b.close();
})().catch(e=>{console.error("FAIL:",e);process.exit(1);});
