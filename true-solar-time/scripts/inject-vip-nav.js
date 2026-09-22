const fs=require("fs"),path=require("path");
const ROOT="E:/cursor/ZHOUJIE/true-solar-time";
// 根页与城市页的导航插入
function patch(file,rel){
  let h=fs.readFileSync(file,"utf8");
  if(h.includes(rel+"vip.html")) return "skip";
  const from='<a href="'+rel+'science.html">天文原理</a></nav>';
  const to='<a href="'+rel+'science.html">天文原理</a><a href="'+rel+'vip.html">会员</a></nav>';
  if(h.includes(from)){ h=h.replace(from,to); fs.writeFileSync(file,h); return "ok"; }
  return "nomatch";
}
let ok=0,skip=0,no=0;
fs.readdirSync(ROOT).filter(f=>f.endsWith(".html")).forEach(f=>{
  const r=patch(path.join(ROOT,f),""); if(r==="ok")ok++;else if(r==="skip")skip++;else no++;
});
const cityDir=path.join(ROOT,"city");
if(fs.existsSync(cityDir)){
  fs.readdirSync(cityDir).filter(f=>f.endsWith(".html")).forEach(f=>{
    const r=patch(path.join(cityDir,f),"../"); if(r==="ok")ok++;else if(r==="skip")skip++;else no++;
  });
}
console.log("注入会员入口: 成功"+ok+" 跳过"+skip+" 未匹配"+no);
