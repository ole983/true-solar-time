/* 真太阳时网站 · 共享逻辑 app.js (无依赖,除 ASTRO 与 CITIES)
   约定:所有“北京时”一律用 ASTRO.bjt* 系列(UTC+8 墙钟),与访客本地时区无关 */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const LIU=[
{z:"子",t:"23:00–01:00",m:"足少阳胆经",range:[1380,1440,0,60],y:"胆经当令,阳气初生。宜卧睡养胆,忌熬夜、夜宵重油。",j:"少阳为枢,主决断。夜卧则血归肝胆;晨起口苦、偏头多与胆火有关。"},
{z:"丑",t:"01:00–03:00",m:"足厥阴肝经",range:[60,180],y:"肝藏血排毒。宜熟睡,忌饮酒、动怒、用脑过度。",j:"肝主疏泄而藏魂。丑时不睡则肝血不养,易目涩胁胀、情绪郁结。"},
{z:"寅",t:"03:00–05:00",m:"手太阴肺经",range:[180,300],y:"肺朝百脉。宜深睡或早起吐纳,忌大汗耗气。",j:"肺主气司呼吸。寅时气血注肺,咳喘多此时发作,宜静养。"},
{z:"卯",t:"05:00–07:00",m:"手阳明大肠经",range:[300,420],y:"宜起床喝温水、排便,忌赖床憋便。",j:"大肠者传道之官。卯时天门开,排浊最宜,宿便不留。"},
{z:"辰",t:"07:00–09:00",m:"足阳明胃经",range:[420,540],y:"宜吃好早餐、干稀搭配,忌空腹寒凉。",j:"胃为水谷之海。辰时气血注胃,早食养胃气,久空则胃痛。"},
{z:"巳",t:"09:00–11:00",m:"足太阴脾经",range:[540,660],y:"宜工作学习、做决策,忌多思伤脾、过甜。",j:"脾主运化统血。巳时脾经旺,头脑最清,宜处理要事。"},
{z:"午",t:"11:00–13:00",m:"手少阴心经",range:[660,780],y:"宜七分饱+小憩20分钟,忌大餐、剧烈运动。",j:"心主神明。午时一阴生,小睡养心阳,忌扰心神。"},
{z:"未",t:"13:00–15:00",m:"手太阳小肠经",range:[780,900],y:"宜饮水助吸收,忌暴食、久卧。",j:"小肠分清别浊。未时吸收最旺,多喝水助运化。"},
{z:"申",t:"15:00–17:00",m:"足太阳膀胱经",range:[900,1020],y:"宜运动、喝水排汗,忌憋尿久坐。",j:"膀胱者州都之官。申时津液足,宜出汗排毒,莫憋小便。"},
{z:"酉",t:"17:00–19:00",m:"足少阴肾经",range:[1020,1140],y:"宜晚餐清淡、补肾黑食,忌咸重、熬夜。",j:"肾藏精主骨。酉时气血注肾,黑豆黑米桑葚养肾。"},
{z:"戌",t:"19:00–21:00",m:"手厥阴心包经",range:[1140,1260],y:"宜散步、读书会友,忌大怒大悲、剧烈争吵。",j:"心包代心受邪。戌时心情愉悦则心气和,宜轻娱乐。"},
{z:"亥",t:"21:00–23:00",m:"手少阳三焦经",range:[1260,1380],y:"宜泡脚、入睡,忌剧烈运动、夜宵、刷屏。",j:"三焦通调百脉。亥时入睡则百脉休养,三焦和则眠安。"}];
/* 黄经0°=春分,每15°一节气 */
const TERMS=["春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至","小寒","大寒","立春","雨水","惊蛰"];
function termOf(lam){lam=((lam%360)+360)%360;return TERMS[Math.floor(lam/15)%24];}
function shichenOf(tstMin){const m=((tstMin%1440)+1440)%1440;
  for(let i=0;i<12;i++){const r=LIU[i].range;
    if(r.length===4){if(m>=r[0]||m<r[3])return{i,...LIU[i]};}
    else if(m>=r[0]&&m<r[1])return{i,...LIU[i]};}
  return{i:0,...LIU[0]};}

const store={
  get sel(){try{const u=new URL(location.href);const q=u.searchParams.get("city");if(q)return q;}catch(e){}
    try{return localStorage.getItem("tst.city")||"北京";}catch(e){return "北京";}},
  set sel(v){try{localStorage.setItem("tst.city",v);}catch(e){}}
};
const dayCache=new Map();
function evOf(city,bj){ // bj={y,m,d}
  const k=city[0]+bj.y+"-"+bj.m+"-"+bj.d;
  if(!dayCache.has(k)){dayCache.set(k,ASTRO.sunEventsForCity(bj.y,bj.m,bj.d,city[3],city[2]));if(dayCache.size>400)dayCache.delete(dayCache.keys().next().value);}
  return dayCache.get(k);
}
function cityByName(n){if(!n)return window.CITIES[0];const f=window.CITIES.find(c=>c[0]===n);return f||window.CITIES.find(c=>c[0].includes(n)||n.includes(c[0]))||window.CITIES[0];}
function snapshot(city,now){ // now=Date(绝对时刻)
  const sun=ASTRO.sunApparent(now);
  const bmin=ASTRO.bjtMinutesFloat(now);
  const bj=ASTRO.bjtParts(now);
  const tst=bmin+(city[2]-120)*4+sun.eq;
  const sc=shichenOf(tst);
  const ev=evOf(city,bj);
  const diff=(city[2]-120)*4+sun.eq;
  const aa=ASTRO.solarAltAz(now,city[3],city[2]);
  return{sun,bmin,bj,tst,sc,ev,diff,aa};
}
function diffText(diff){return `真太阳${diff>=0?"超前":"落后"}北京 ${Math.abs(diff).toFixed(1)} 分钟`;}
function fmtSigned(v,d){return (v>=0?"+":"")+v.toFixed(d==null?1:d);}
function setNav(){const p=(location.pathname.split("/").pop()||"index.html").toLowerCase();
  document.querySelectorAll("nav.tabs a").forEach(a=>{const h=(a.getAttribute("href")||"").toLowerCase();if(h===p||(p===""&&h==="index.html"))a.classList.add("on");});}
function shareURL(city){const u=new URL(location.href);u.searchParams.set("city",city);return u.toString();}
window.TST={$,LIU,TERMS,termOf,shichenOf,store,evOf,cityByName,snapshot,diffText,fmtSigned,setNav,shareURL};
})();
