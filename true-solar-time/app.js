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

/* 四类人群画像:白话为主,节气金句为魂 */
const GROUP={
  health:{name:"养生作息",icon:"🫁",who:"上班族 · 中老年"},
  baby:{name:"带娃晒娃",icon:"🍼",who:"母婴 · 备孕"},
  outdoor:{name:"户外摄影",icon:"📷",who:"钓鱼 · 登山 · 摄影"},
  meta:{name:"择吉命理",icon:"📜",who:"中医 · 择日 · 从业"}
};
/* 今日三件事:按当令经脉 + 节气 + 昼长,只给3条(蔡格尼克效应) */
function actionsOf(city,s){
  const z=s.sc.z, N=s.sc.z, ev=s.ev, out=[];
  const dayLen=ev.polar?null:(ev.setMin-ev.riseMin)/60;
  const key={
    "子":["子时养胆:放下手机,23点前卧倒","忌夜宵重油,胆火扰眠","明早口苦多因熬夜,今晨先喝温水"],
    "丑":["丑时肝藏血,熟睡即养肝","忌饮酒动怒,情绪伤肝","若有应酬,酒后饮温水再睡"],
    "寅":["寅时肺经旺,深睡或静坐吐纳","咳嗽哮喘者注意保暖避风","忌大汗耗气,运动等天亮"],
    "卯":["卯时天门开,起床喝温水排便","一杯温水+五分钟拉伸,唤醒大肠","忌赖床憋便,越拖越困"],
    "辰":["辰时胃经当令,早餐干稀搭配","热粥/鸡蛋/全谷物,吃到七分饱","忌空腹冰饮,胃痛多因久空"],
    "巳":["巳时脾经旺,头脑最清,办要事","专注工作学习90分钟","忌多思过甜,别在这时争论"],
    "午":["午时心经当令,午餐七分饱","饭后小憩20分钟,养心阳","忌大餐+剧烈运动,心脏负担重"],
    "未":["未时小肠吸收旺,多喝温水","午餐后慢走10分钟助运化","忌暴食久卧,胀气多因吃太快"],
    "申":["申时膀胱经旺,宜运动排汗","快走/深蹲20分钟,多喝水","忌憋尿久坐,排毒趁现在"],
    "酉":["酉时肾经当令,晚餐清淡补肾","黑豆黑米桑葚,少盐最养肾","忌咸重熬夜,晚饭七点前为宜"],
    "戌":["戌时心包经,散步读书会友","心情愉悦则心气和,宜轻娱乐","忌大怒大悲、剧烈争吵"],
    "亥":["亥时三焦通百脉,泡脚入睡","热水泡脚15分钟,11点前睡","忌剧烈运动、夜宵、刷屏"]
  }[N]||[];
  key.forEach(t=>out.push(t));
  if(dayLen!=null){
    if(dayLen<10.5)out.push(`昼短${dayLen.toFixed(1)}小时,午后易困,出门记得加衣带灯`);
    else if(dayLen>13.5)out.push(`昼长${dayLen.toFixed(1)}小时,紫外线强,10–16点注意防晒`);
  }
  return out.slice(0,3);
}
/* 黄金/蓝调时刻(摄影户外):日出日落±30分 */
function goldenOf(city,s){
  const ev=s.ev;
  if(ev.polar||ev.riseMin==null)return{polar:ev.polar||"—"};
  return{
    dawnBlue:[ev.riseMin-40,ev.riseMin-15],dawnGold:[ev.riseMin-15,ev.riseMin+30],
    duskGold:[ev.setMin-30,ev.setMin+15],duskBlue:[ev.setMin+15,ev.setMin+40],
    dayLen:(ev.setMin-ev.riseMin)/60
  };
}
/* 晒太阳建议(母婴):按太阳高度角分档 */
function sunbathOf(city,s,now){
  const lat=city[3],lon=city[2];
  const y=s.bj.y,m=s.bj.m,d=s.bj.d;
  let best=[],safe=[];
  for(let min=0;min<1440;min+=15){
    const utc=Date.UTC(y,m-1,d)-8*36e5+min*6e4;
    const a=ASTRO.solarAltAz(new Date(utc),lat,lon).alt;
    if(a>=20&&a<=50)best.push(min);
    else if(a>0&&a<20)safe.push(min);
  }
  const seg=arr=>{if(!arr.length)return[];const r=[];let st=arr[0],pv=arr[0];
    for(let i=1;i<arr.length;i++){if(arr[i]-pv>15){r.push([st,pv]);st=arr[i];}pv=arr[i];}r.push([st,pv]);return r;};
  return{best:seg(best),safe:seg(safe)};
}
/* 节气金句(收束用,文言之魂) */
const JINJU={
"立春":"东风解冻,蛰虫始振,一年之计在于春。","雨水":"獭祭鱼,候雁北,草木萌动。","惊蛰":"桃始华,仓庚鸣,万物出乎震。",
"春分":"玄鸟至,雷乃发声,昼夜均而寒暑平。","清明":"桐始华,虹始见,万物洁齐而清明。","谷雨":"萍始生,鸣鸠拂其羽,雨生百谷。",
"立夏":"蝼蝈鸣,蚯蚓出,万物至此皆长大。","小满":"苦菜秀,麦秋至,小得盈满。","芒种":"螳螂生,鵙始鸣,有芒之谷可种矣。",
"夏至":"鹿角解,蜩始鸣,日长至而一阴生。","小暑":"温风至,蟋蟀居壁,暑气始盛。","大暑":"腐草为萤,土润溽暑,大雨时行。",
"立秋":"凉风至,白露降,寒蝉鸣,一叶知秋。","处暑":"鹰乃祭鸟,天地始肃,暑气至此而止。","白露":"鸿雁来,玄鸟归,群鸟养羞,露凝而白。",
"秋分":"雷始收声,蛰虫坯户,昼夜再均。","寒露":"鸿雁来宾,菊有黄花,露气寒冷将凝。","霜降":"草木黄落,蛰虫咸俯,霜降而冬近。",
"立冬":"水始冰,地始冻,万物收藏。","小雪":"虹藏不见,闭塞成冬,天地不通。","大雪":"鹖鴠不鸣,虎始交,荔挺出,雪盛也。",
"冬至":"蚯蚓结,麋角解,水泉动,一阳复始。","小寒":"雁北乡,鹊始巢,雉始雊,寒气之逆极。","大寒":"鸡乳,征鸟厉疾,水泽腹坚,岁将更始。"
};
/* 真太阳 ⇄ 北京时间 换算(命理从业刚需) */
function toTrue(beijingMin,lon,eqMin){return beijingMin+(lon-120)*4+eqMin;}
function toBeijing(trueMin,lon,eqMin){return trueMin-(lon-120)*4-eqMin;}
function parseHM(str){const m=/^\s*(\d{1,2})\s*[:：时]\s*(\d{1,2})?/.exec(str||"");if(!m)return null;
  const h=+m[1],mi=+(m[2]||0);if(h>23||mi>59)return null;return h*60+mi;}

window.TST={$,LIU,TERMS,termOf,shichenOf,store,evOf,cityByName,snapshot,diffText,fmtSigned,setNav,shareURL,
  GROUP,actionsOf,goldenOf,sunbathOf,JINJU,toTrue,toBeijing,parseHM};
})();
