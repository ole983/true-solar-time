const puppeteer=require("puppeteer");
const fs=require("fs"),path=require("path");
const OUT="E:/cursor/ZHOUJIE/true-solar-time/img";
function findChrome(root){const st=[root];while(st.length){const d=st.pop();let es;try{es=fs.readdirSync(d,{withFileTypes:true});}catch(e){continue;}for(const e of es){const p=path.join(d,e.name);if(e.isDirectory())st.push(p);else if(e.name==="chrome.exe")return p;}}return null;}
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const exe=findChrome(path.join(process.env.USERPROFILE,".cache","puppeteer"));
  const b=await puppeteer.launch({headless:"shell",executablePath:exe,args:["--no-sandbox"]});
  const p=await b.newPage();
  await p.setContent("<canvas id=c width=600 height=600></canvas>");
  const draw=(label,color,glyph)=>p.evaluate((label,color,glyph)=>{
    const c=document.getElementById("c"),x=c.getContext("2d"),S=600;
    x.fillStyle="#ffffff";x.fillRect(0,0,S,S);
    x.strokeStyle=color;x.lineWidth=8;x.setLineDash([22,14]);
    x.strokeRect(30,30,S-60,S-60);x.setLineDash([]);
    x.fillStyle=color;x.font="bold 190px 'PingFang SC','Microsoft YaHei',sans-serif";x.textAlign="center";
    x.fillText(glyph,S/2,290);
    x.fillStyle="#222";x.font="bold 40px 'PingFang SC','Microsoft YaHei',sans-serif";
    x.fillText(label,S/2,400);
    x.fillStyle="#888";x.font="26px 'PingFang SC','Microsoft YaHei',sans-serif";
    x.fillText("请替换为真实收款码",S/2,460);
    x.fillText("img/"+ (glyph==="支"?"alipay-qr.png":"wechat-qr.png"),S/2,500);
    return c.toDataURL("image/png");
  },label,color,glyph);
  const alipay=await draw("支付宝收款码","#1677ff","支");
  const wechat=await draw("微信收款码","#07c160","微");
  fs.writeFileSync(path.join(OUT,"alipay-qr.png"),Buffer.from(alipay.split(",")[1],"base64"));
  fs.writeFileSync(path.join(OUT,"wechat-qr.png"),Buffer.from(wechat.split(",")[1],"base64"));
  await b.close();
  console.log("占位收款码已生成 → img/alipay-qr.png, img/wechat-qr.png");
})().catch(e=>{console.error("FAIL:",e);process.exit(1);});
