/* 生成 340 城长尾 SEO 预渲染页
   用法:node scripts/gen-city-pages.js
   输出:true-solar-time/city/<城市>.html、city-index.html、并重写 sitemap.xml
   每页含预渲染的真实数字(经度差、二十四节气表、今日日出日落),
   爬虫无需执行 JS 即可读到内容;JS 仅用于让时间走起来。 */
const fs = require("fs");
const path = require("path");

const SITE = "https://ole983.github.io/true-solar-time";
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "city");

global.window = {};
eval(fs.readFileSync(path.join(ROOT, "astro.js"), "utf8"));
eval(fs.readFileSync(path.join(ROOT, "cities.js"), "utf8"));
const ASTRO = global.window.ASTRO;
const CITIES = global.window.CITIES;

const NAMES = ["春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至","小寒","大寒","立春","雨水","惊蛰"];
const LAM = [0,15,30,45,60,75,90,105,120,135,150,165,180,195,210,225,240,255,270,285,300,315,330,345];
const ORDER = [19,20,21,22,23,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
const TERMS = ["春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至","小寒","大寒","立春","雨水","惊蛰"];
const JINJU = {
"立春":"东风解冻,蛰虫始振","雨水":"獭祭鱼,候雁北","惊蛰":"桃始华,仓庚鸣",
"春分":"玄鸟至,雷乃发声","清明":"桐始华,虹始见","谷雨":"萍始生,鸣鸠拂羽",
"立夏":"蝼蝈鸣,蚯蚓出","小满":"苦菜秀,麦秋至","芒种":"螳螂生,鵙始鸣",
"夏至":"鹿角解,蜩始鸣","小暑":"温风至,蟋蟀居壁","大暑":"腐草为萤,土润溽暑",
"立秋":"凉风至,白露降","处暑":"鹰乃祭鸟,天地始肃","白露":"鸿雁来,玄鸟归",
"秋分":"雷始收声,蛰虫坯户","寒露":"鸿雁来宾,菊有黄花","霜降":"草木黄落,蛰虫咸俯",
"立冬":"水始冰,地始冻","小雪":"虹藏不见,闭塞成冬","大雪":"鹖鴠不鸣,虎始交",
"冬至":"蚯蚓结,麋角解","小寒":"雁北乡,鹊始巢","大寒":"鸡乳,征鸟厉疾"};

function termMoments(year){
  const t0=Date.UTC(year,0,1), t1=Date.UTC(year+1,0,1), step=12*36e5;
  const N=Math.ceil((t1-t0)/step);
  let prevT=t0, prevL=ASTRO.sunApparent(new Date(t0)).lambda;
  const found={};
  for(let i=1;i<=N;i++){
    const curT=Math.min(t1,t0+i*step), curL=ASTRO.sunApparent(new Date(curT)).lambda;
    const mv=((curL-prevL+360)%360);
    for(let k=0;k<24;k++){
      if(found[k]!=null)continue;
      const ahead=((LAM[k]-prevL+360)%360);
      if(mv>0&&mv<2&&ahead<mv){
        let lo=prevT,hi=curT;
        for(let j=0;j<30;j++){
          const mid=(lo+hi)/2, lm=ASTRO.sunApparent(new Date(mid)).lambda;
          if((((lm-prevL+360)%360))>=ahead) hi=mid; else lo=mid;
        }
        found[k]=new Date((lo+hi)/2);
      }
    }
    prevT=curT;prevL=curL;
  }
  return found;
}
const pad=n=>String(n).padStart(2,"0");
function bjDate(d){const b=new Date(d.getTime()+8*36e5);return b;}
function fmtDate(d){const b=bjDate(d);return (b.getUTCMonth()+1)+"月"+b.getUTCDate()+"日";}
function fmtMD(d){const b=bjDate(d);return b.getUTCMonth()+1+"-"+pad(b.getUTCDate());}
function fmtHM(min){if(min==null)return "—";const m=((Math.round(min)%1440)+1440)%1440;return pad(Math.floor(m/60))+":"+pad(m%60);}
function signed(v,d){return (v>=0?"+":"")+v.toFixed(d==null?1:d);}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

const nowBj = bjDate(new Date());
const YEAR = nowBj.getUTCFullYear();
const M = termMoments(YEAR);
const Mnext = termMoments(YEAR+1);

function page(city, termsRows, todayRow, peers){
  const [name,prov,lon,lat] = city;
  const diff = (lon-120)*4;
  const title = name+"真太阳时 · 北京时间差"+signed(diff,1)+"分钟 · 日出日落 · 二十四节气";
  const desc = name+"真太阳时比北京时间"+(diff>=0?"快":"慢")+Math.abs(diff).toFixed(1)+"分钟。今日日出"+fmtHM(todayRow.rise)+"、日落"+fmtHM(todayRow.set)+"、昼长"+todayRow.day.toFixed(1)+"小时。"+name+"二十四节气交节时刻与日中表。";
  const rows = termsRows.map(r=>`<tr><td><b>${r.n}</b></td><td>${r.date}</td><td style="color:#f7e2a8">${r.time}</td><td>${fmtHM(r.rise)}</td><td>${fmtHM(r.noon)}</td><td>${fmtHM(r.set)}</td><td>${r.day.toFixed(1)}h</td><td style="color:#b6c1dd">${JINJU[r.n]||""}</td></tr>`).join("");
  const peerLinks = peers.map(p=>`<a href="${esc(p[0])}.html">${esc(p[0])}</a>`).join(" · ");
  const ld = JSON.stringify({
    "@context":"https://schema.org","@type":"Place",
    "name":name,"address":{"@type":"PostalAddress","addressRegion":prov,"addressCountry":"CN"},
    "geo":{"@type":"GeoCoordinates","latitude":lat,"longitude":lon},
    "url":SITE+"/city/"+encodeURIComponent(name)+".html"
  });
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | 真太阳时</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/city/${encodeURIComponent(name)}.html">
<meta property="og:title" content="${esc(name)}真太阳时与北京时间差">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="article">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#070b16"><link rel="stylesheet" href="../styles.css">
<script type="application/ld+json">${ld}</script>
<style>
.cityhero{border:1px solid rgba(232,195,106,.5);background:linear-gradient(165deg,rgba(232,195,106,.15),rgba(232,195,106,.03));border-radius:16px;padding:16px 18px;margin-top:12px}
.cityhero h1{font-size:24px;margin:0 0 8px}
.cityhero .big{font-size:34px;font-weight:900;color:var(--gold);font-variant-numeric:tabular-nums}
.cityhero .kv{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.cityhero .kv span{border:1px solid var(--line);border-radius:10px;padding:6px 11px;background:rgba(0,0,0,.3);font-size:12.5px;font-variant-numeric:tabular-nums}
.crumb{font-size:12.5px;color:var(--mut);margin:10px 0}
.crumb a{color:var(--mut)}
.qa{font-size:13.5px;line-height:2;color:#cdd6f4}
.qa b{color:var(--gold2)}
.peers{margin-top:12px;font-size:13px;line-height:2}
.peers a{color:var(--gold2);text-decoration:none;border-bottom:1px solid rgba(232,195,106,.4);margin-right:4px}
</style>
</head>
<body>
<div class="topbar"><div class="topbar-in">
<div class="logo">☉ 真太阳时 <b>· 子午流注</b></div>
<nav class="tabs"><a href="../index.html">今日行动</a><a href="../cities.html">全国总表</a><a href="../jieqi.html">节气养生</a><a href="../liuzhu.html">时辰流注</a><a href="../tools.html">实用工具</a><a href="../science.html">天文原理</a></nav>
<div class="top-right"><span class="pill" id="clock">—</span></div>
</div></div>
<div class="wrap">
<div class="crumb"><a href="../index.html">首页</a> › <a href="../cities.html">全国总表</a> › <a href="city-index.html">城市列表</a> › ${esc(name)}</div>

<section class="card cityhero">
<h1>${esc(name)}真太阳时</h1>
<div class="big" id="live">--:--:--</div>
<div style="color:#b6c1dd;font-size:13px;margin-top:6px" id="livesub">按 ${esc(name)} 真太阳时判定时辰</div>
<div class="kv">
<span>经度 ${lon.toFixed(2)}° · 纬度 ${lat.toFixed(2)}°</span>
<span>比北京时间 <b style="color:#f7e2a8">${signed(diff,1)}</b> 分钟</span>
<span>今日日出 <b style="color:#f7e2a8">${fmtHM(todayRow.rise)}</b></span>
<span>日中 <b style="color:#f7e2a8">${fmtHM(todayRow.noon)}</b></span>
<span>日落 <b style="color:#f7e2a8">${fmtHM(todayRow.set)}</b></span>
<span>昼长 <b style="color:#f7e2a8">${todayRow.day.toFixed(1)}</b> 小时</span>
</div>
<div style="margin-top:12px;font-size:13px;line-height:1.9;color:#b6c1dd">
真太阳时 = 北京时间 + (经度 − 120°)×4 分钟 + 时差方程 EoT。<br>
${esc(name)}经度 ${lon.toFixed(2)}°,经度差为 <b style="color:#f7e2a8">${signed(diff,1)}</b> 分钟;再叠加当日时差方程,即得真太阳时。北京时间是全国统一标准时,而太阳并不按北京时间升落,西部城市差异尤为明显。
</div>
</section>

<section class="card"><h2>◈ ${esc(name)} ${YEAR} 年二十四节气 · 交节时刻与日中表(北京时间)</h2>
<div class="desc">交节时刻为太阳视黄经到达该节气定义度数的精确瞬间(全国同一时刻);日出/日中/日落/昼长为该节气当日 ${esc(name)} 的数值。</div>
<div class="tblwrap tall"><table><thead><tr><th>节气</th><th>日期</th><th>交节时刻</th><th>日出</th><th>日中</th><th>日落</th><th>昼长</th><th>物候</th></tr></thead><tbody>${rows}</tbody></table></div>
</section>

<section class="card"><h2>◈ 常见问题</h2>
<div class="qa">
<p><b>${esc(name)}真太阳时比北京时间差多少?</b><br>${esc(name)}经度 ${lon.toFixed(2)}°,与东经 120° 相差 ${signed(lon-120,2)}°,换算为 <b>${signed(diff,1)} 分钟</b>;再叠加每日时差方程(约 −14 至 +16 分钟),即为当日真太阳时与北京时间的总差。</p>
<p><b>${esc(name)}今日几点日出、几点日落?</b><br>今日(${YEAR}年${nowBj.getUTCMonth()+1}月${nowBj.getUTCDate()}日)日出 ${fmtHM(todayRow.rise)},日中 ${fmtHM(todayRow.noon)},日落 ${fmtHM(todayRow.set)},昼长 ${todayRow.day.toFixed(1)} 小时。数值随季节变化,可在首页查看实时值。</p>
<p><b>为什么要用真太阳时?</b><br>十二时辰与作息本应随太阳位置而定。全国统一北京时间后,${esc(name)}的挂钟时刻与太阳时角不再一致,按北京时间安排作息可能产生偏差。详见<a href="../liuzhu.html">时辰流注</a>页。</p>
<p><b>数据精度如何?</b><br>基于 Meeus《Astronomical Algorithms》第 25 章太阳位置算法与 IAU 1980 章动模型,正午误差小于 30 秒。坐标取市政府驻地,县乡请按经度每度约 ±4 分钟自行修正。</p>
</div>
</section>

<section class="card"><h2>◈ 同省 / 邻近城市</h2>
<div class="peers">${peerLinks}</div>
<div style="margin-top:12px"><a class="btn gold" href="../index.html?city=${encodeURIComponent(name)}" style="text-decoration:none">进入${esc(name)}今日行动 →</a> <a class="btn" href="city-index.html" style="text-decoration:none">全部城市</a></div>
</section>

<footer class="site">算法 Meeus Ch.25 · 章动IAU1980 · WGS84 · 传统文化作息参考,不作医疗依据 · <a href="../privacy.html">隐私政策</a> · <a href="../terms.html">用户协议</a></footer>
</div>
<script src="../cities.js"></script><script src="../astro.js"></script><script src="../app.js"></script>
<script>
(function(){
var city=null;for(var i=0;i<window.CITIES.length;i++){if(window.CITIES[i][0]===${JSON.stringify(name)}){city=window.CITIES[i];break;}}
if(!city)return;
function up(){var now=new Date();var sun=window.ASTRO.sunApparent(now);
var bmin=window.ASTRO.bjtMinutesFloat(now);var tst=bmin+(city[2]-120)*4+sun.eq;
var s=window.TST.shichenOf(tst);
document.getElementById("live").textContent=window.ASTRO.fmtHMS(tst);
document.getElementById("livesub").textContent=s.z+"时 · "+s.m+" 当令 · 真太阳"+((city[2]-120)*4+sun.eq>=0?"超前":"落后")+"北京 "+Math.abs((city[2]-120)*4+sun.eq).toFixed(1)+"分";
var bj=window.ASTRO.bjtParts(now);var ev=window.ASTRO.sunEventsForCity(bj.y,bj.m,bj.d,city[3],city[2]);
document.getElementById("clock").textContent=city[0]+" 真太阳 "+window.ASTRO.fmtHMS(tst);
}
up();setInterval(up,1000);
})();
</script>
</body>
</html>
`;
}

function build(){
  fs.mkdirSync(OUT,{recursive:true});
  let count=0;
  const indexLinks=[];
  CITIES.forEach(city=>{
    const [name,prov,lon,lat]=city;
    const termsRows = ORDER.map(k=>{
      const d=M[k]; if(!d) return null;
      const b=bjDate(d);
      const ev=ASTRO.sunEventsForCity(b.getUTCFullYear(),b.getUTCMonth()+1,b.getUTCDate(),lat,lon);
      const day=ev.polar?0:(ev.setMin-ev.riseMin)/60;
      return {n:NAMES[k],date:fmtDate(d),time:pad(b.getUTCHours())+":"+pad(b.getUTCMinutes()),
        rise:ev.polar?null:ev.riseMin,noon:ev.noonMin,set:ev.polar?null:ev.setMin,day:day};
    }).filter(Boolean);
    const evT=ASTRO.sunEventsForCity(YEAR,nowBj.getUTCMonth()+1,nowBj.getUTCDate(),lat,lon);
    const todayRow={rise:evT.polar?null:evT.riseMin,noon:evT.noonMin,set:evT.polar?null:evT.setMin,
      day:evT.polar?0:(evT.setMin-evT.riseMin)/60};
    const peers=CITIES.filter(x=>x[1]===prov&&x[0]!==name).slice(0,8);
    const peerList=(peers.length?peers:CITIES.slice(0,8));
    fs.writeFileSync(path.join(OUT,name+".html"),page(city,termsRows,todayRow,peerList));
    count++;
    indexLinks.push('<a href="'+encodeURIComponent(name)+'.html">'+esc(name)+'</a>');
  });

  // 城市索引页
  const idx=`<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>全部城市真太阳时 · 二十四节气 | 真太阳时</title>
<meta name="description" content="全中国 340 城真太阳时、北京时间差、日出日落与二十四节气交节时刻索引。">
<link rel="canonical" href="${SITE}/city/city-index.html">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#070b16"><link rel="stylesheet" href="../styles.css">
<style>.cl{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px}.cl a{color:var(--gold2);text-decoration:none;border:1px solid var(--line);border-radius:8px;padding:7px 9px;font-size:13px;background:rgba(0,0,0,.25)}.cl a:hover{border-color:var(--gold)}</style>
</head><body>
<div class="topbar"><div class="topbar-in">
<div class="logo">☉ 真太阳时 <b>· 子午流注</b></div>
<nav class="tabs"><a href="../index.html">今日行动</a><a href="../cities.html">全国总表</a><a href="../jieqi.html">节气养生</a><a href="../liuzhu.html">时辰流注</a><a href="../tools.html">实用工具</a><a href="../science.html">天文原理</a></nav>
<div class="top-right"><span class="pill">共 ${CITIES.length} 城</span></div>
</div></div>
<div class="wrap">
<header class="hero"><h1>全部城市 <span class="g">· 真太阳时</span></h1>
<div class="sub">点击城市名查看该城市的真太阳时、北京时间差、今日日出日落与 ${YEAR} 年二十四节气交节时刻表。</div></header>
<section class="card"><h2>◈ 城市索引</h2><div class="cl">${indexLinks.join("")}</div></section>
<footer class="site"><a href="../index.html">← 回今日行动</a> · <a href="../privacy.html">隐私政策</a> · <a href="../terms.html">用户协议</a></footer>
</div></body></html>`;
  fs.writeFileSync(path.join(OUT,"city-index.html"),idx);

  // 重写 sitemap
  const staticUrls=["index.html","cities.html","jieqi.html","tools.html","liuzhu.html","sun.html","science.html","privacy.html","terms.html"];
  let sm='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  staticUrls.forEach(u=>{sm+=`<url><loc>${SITE}/${u}</loc><changefreq>daily</changefreq><priority>${u==="index.html"?"1.0":"0.8"}</priority></url>\n`;});
  sm+=`<url><loc>${SITE}/city/city-index.html</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
  CITIES.forEach(c=>{sm+=`<url><loc>${SITE}/city/${encodeURIComponent(c[0])}.html</loc><changefreq>daily</changefreq><priority>0.6</priority></url>\n`;});
  sm+='</urlset>\n';
  fs.writeFileSync(path.join(ROOT,"sitemap.xml"),sm);

  console.log("生成城市页 "+count+" 个 → city/");
  console.log("城市索引 → city/city-index.html");
  console.log("sitemap 共 "+(staticUrls.length+1+count)+" 条");
  console.log("示例:"+CITIES[0][0]+" 经度差 "+((CITIES[0][2]-120)*4).toFixed(1)+" 分");
}
build();
