/* 真太阳时 · 简繁切换(fan.js)
   词组级映射(只转界面常用词,不逐字转,避免"头发/发展"类误伤)。
   遍历文本节点最长匹配替换;动态内容靠 MutationObserver 补转。
   按钮由本脚本自动加入顶栏,偏好存 localStorage。 */
(function(){
"use strict";
var KEY="tst.fan.v1";
var MAP=[
["真太阳时","真太陽時"],["北京时间","北京時間"],["子午流注","子午流注"],
["今日行动","今日行動"],["全国总表","全國總表"],["节气养生","節氣養生"],["节气","節氣"],
["时辰流注","時辰流注"],["时辰","時辰"],["实用工具","實用工具"],["择时","擇時"],
["天文原理","天文原理"],["会员","會員"],["月历","月曆"],["择吉","擇吉"],
["对比","對比"],["黄历","黃曆"],["农历","農曆"],["干支","干支"],
["宜","宜"],["忌","忌"],["今日三事","今日三事"],["今日作息打卡","今日作息打卡"],
["长辈模式","長輩模式"],["大字","大字"],["朗读今日","朗讀今日"],["朗读","朗讀"],
["定位我","定位我"],["开启时辰提醒","開啟時辰提醒"],["查看今日12时辰","查看今日12時辰"],
["换算/黄金时刻","換算/黃金時刻"],["分享","分享"],["-copy",""],
["排盘","排盤"],["四柱","四柱"],["大运","大運"],["流年","流年"],
["十神","十神"],["纳音","納音"],["胎元","胎元"],["命宫","命宮"],
["建除","建除"],["冲煞","沖煞"],["胎神","胎神"],["彭祖百忌","彭祖百忌"],
["作息","作息"],["养生","養生"],[" sub",""],
["年","年"],["月","月"],["日","日"],["时","時"],
["日出","日出"],["日落","日落"],["日中","日中"],["昼长","晝長"],
["节日","節日"],["传统","傳統"],["文化","文化"],["参考","參考"],
["隐私政策","隱私政策"],["用户协议","用戶協議"],["精度验证","精度驗證"],
["未开通会员","未開通會員"],["已解锁","已解鎖"],["会员功能","會員功能"],
["上月","上月"],["下月","下月"],["回今日","回今日"],["筛选吉日","篩選吉日"],
["嫁娶","嫁娶"],["开市","開市"],["动土","動土"],["安葬","安葬"],["出行","出行"],["入宅","入宅"],["祈福","祈福"],
["连续","連續"],["累计","累計"],["天","天"],["勋章","勳章"],
["去排四柱大运","去排四柱大運"],["挂钟","掛鐘"],["太阳","太陽"],
["我的","我的"],["我的城市","我的城市"]
];
MAP.sort(function(a,b){return b[0].length-a[0].length;});
function toFan(s){
  var out=s;
  MAP.forEach(function(p){
    if(!p[0])return;
    out=out.split(p[0]).join(p[1]);
  });
  return out;
}
var on=false;
try{on=localStorage.getItem(KEY)==="1";}catch(e){}
function apply(){
  document.documentElement.setAttribute("lang",on?"zh-Hant":"zh-CN");
  var b=document.getElementById("fanBtn");
  if(b)b.textContent=on?"繁":"简";
}
function convert(root){
  if(!on)return;
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
  var nodes=[],n;
  while((n=w.nextNode())){
    var p=n.parentElement;
    if(!p)continue;
    var tag=p.tagName;
    if(tag==="SCRIPT"||tag==="STYLE"||tag==="CANVAS")continue;
    if(p.id==="hTst"||p.className==="sec")continue;
    if(n.nodeValue&&/[\u4e00-\u9fa5]/.test(n.nodeValue))nodes.push(n);
  }
  nodes.forEach(function(t){t.nodeValue=toFan(t.nodeValue);});
}
window.TSTFan={
  get:function(){return on;},
  toggle:function(){
    on=!on;
    try{localStorage.setItem(KEY,on?"1":"0");}catch(e){}
    if(on){convert(document.body);observe();}
    else{try{localStorage.setItem(KEY,"0");}catch(e){}location.reload();}
    apply();
  }
};
var obs=null;
function observe(){
  if(obs||!on)return;
  obs=new MutationObserver(function(muts){
    muts.forEach(function(m){
      m.addedNodes.forEach(function(nd){
        if(nd.nodeType===1)convert(nd);
        else if(nd.nodeType===3&&nd.parentElement&&nd.parentElement.tagName!=="SCRIPT")nd.nodeValue=toFan(nd.nodeValue);
      });
    });
  });
  obs.observe(document.body,{childList:true,subtree:true});
}
function mount(){
  var host=document.querySelector(".top-right")||document.querySelector(".topbar-in");
  if(!host||document.getElementById("fanBtn"))return;
  var b=document.createElement("button");
  b.id="fanBtn";b.type="button";b.className="theme-btn";b.title="简繁切换";
  b.textContent=on?"繁":"简";
  b.onclick=function(){window.TSTFan.toggle();};
  host.appendChild(b);
  if(on){convert(document.body);observe();}
  apply();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);
else mount();
})();
