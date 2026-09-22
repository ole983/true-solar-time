const fs=require("fs"),path=require("path");
const ROOT="E:/cursor/ZHOUJIE/true-solar-time";
const files=["index.html","cities.html","jieqi.html","liuzhu.html","sun.html","science.html","tools.html","privacy.html","terms.html","vip.html","zeri.html"];
let ok=0,skip=0,no=0;
files.forEach(f=>{
  const p=path.join(ROOT,f);if(!fs.existsSync(p))return;
  let h=fs.readFileSync(p,"utf8");
  if(h.includes('href="zeri.html"')){skip++;return;}
  const from='<a href="tools.html">实用工具</a>';
  const to='<a href="tools.html">实用工具</a><a href="zeri.html">择时</a>';
  if(h.includes(from)){h=h.replace(from,to);fs.writeFileSync(p,h);ok++;}
  else no++;
});
console.log("择时入口注入: 成功"+ok+" 已存在"+skip+" 未匹配"+no);
