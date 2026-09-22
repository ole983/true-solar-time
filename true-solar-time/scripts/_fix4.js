const fs=require("fs"),path=require("path");
const ROOT="E:/cursor/ZHOUJIE/true-solar-time";
let ok=0;
function walk(d){
  fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{
    const p=path.join(d,e.name);
    if(e.isDirectory()){if(e.name!=="scripts"&&e.name!=="img")walk(p);return;}
    if(!p.endsWith(".html"))return;
    let h=fs.readFileSync(p,"utf8");
    const bad='<script src="a11y.js"><script src="fan.js">';
    if(h.includes(bad)){
      const rel=p.includes("city"+path.sep)?"../":"";
      h=h.split(bad).join('<script src="'+rel+'a11y.js"></script><script src="'+rel+'fan.js"></script>');
      fs.writeFileSync(p,h);ok++;
    }
  });
}
walk(ROOT);
console.log("修复坏注入:",ok,"个文件");
