const fs=require("fs"),path=require("path");
const ROOT="E:/cursor/ZHOUJIE/true-solar-time";
function inject(file,rel){
  let h=fs.readFileSync(file,"utf8");
  if(h.includes('src="'+rel+'theme.js"'))return "skip";
  const from='<link rel="stylesheet" href="'+rel+'styles.css">';
  const to=from+'<script src="'+rel+'theme.js"></script>';
  if(h.includes(from)){h=h.replace(from,to);fs.writeFileSync(file,h);return "ok";}
  return "nomatch";
}
let ok=0,skip=0,no=0;
fs.readdirSync(ROOT).filter(f=>f.endsWith(".html")).forEach(f=>{const r=inject(path.join(ROOT,f),"");r==="ok"?ok++:r==="skip"?skip++:no++;});
const cityDir=path.join(ROOT,"city");
if(fs.existsSync(cityDir))fs.readdirSync(cityDir).filter(f=>f.endsWith(".html")).forEach(f=>{const r=inject(path.join(cityDir,f),"../");r==="ok"?ok++:r==="skip"?skip++:no++;});
console.log("theme.js 注入: 成功"+ok+" 已存在"+skip+" 未匹配"+no);
