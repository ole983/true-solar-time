/* 真太阳时 · 作息打卡 + 节气勋章(daka.js)
   纯本地 localStorage:每日三项打卡(早睡/早起/午休)+ 连续天数 + 24节气勋章。
   由各页面按需挂载: renderDaka(容器id)。 */
(function(){
"use strict";
var KEY="tst.daka.v1";
var TERMS=["立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至","小寒","大寒"];
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}");}catch(e){return {};}}
function save(d){try{localStorage.setItem(KEY,JSON.stringify(d));}catch(e){}}
function dayKey(y,m,d){return y+"-"+String(m).padStart(2,"0")+"-"+String(d).padStart(2,"0");}
function streak(data){
  var n=0,d=new Date();
  for(;;){
    var k=dayKey(d.getFullYear(),d.getMonth()+1,d.getDate());
    var r=data[k];
    if(r&&(r.zaoshui||r.zaoqi||r.wuxiu))n++;
    else break;
    d=new Date(d.getTime()-864e5);
    if(n>3650)break;
  }
  return n;
}
var ITEMS=[["zaoshui","🌙 子时前睡","23点前入睡,养胆经"],["zaoqi","🌅 卯时起","5–7点起床,迎阳气"],["wuxiu","☀ 午时休","11–13点小憩20分钟"]];
function renderDaka(elId,termName){
  var el=document.getElementById(elId);
  if(!el)return;
  var bj=window.ASTRO?window.ASTRO.bjtParts(new Date()):null;
  var today=bj?dayKey(bj.y,bj.m,bj.d):dayKey(new Date().getFullYear(),new Date().getMonth()+1,new Date().getDate());
  function draw(){
    var data=load(),t=data[today]||{},st=streak(data);
    var total=Object.keys(data).length;
    var html='<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px">'+
      '<span class="pill">连续 <b style="color:var(--gold2)">'+st+'</b> 天</span>'+
      '<span class="pill">累计打卡 '+total+' 天</span>'+
      (termName?'<span class="pill">本节气:'+termName+'</span>':"")+'</div>';
    html+='<div style="display:grid;gap:8px">'+ITEMS.map(function(it){
      var on=!!t[it[0]];
      return '<button type="button" class="btn'+(on?" gold":"")+'" data-k="'+it[0]+'" style="text-align:left">'+(on?"✓ ":"")+it[1]+'<span style="display:block;font-size:11.5px;font-weight:400;opacity:.75">'+it[2]+'</span></button>';
    }).join("")+'</div>';
    /* 节气勋章:到访过该节气日期即点亮(简化:以打卡日所在节气计) */
    var medals={};Object.keys(data).forEach(function(k){
      var tm=data[k]&&data[k].term;if(tm)medals[tm]=1;
    });
    html+='<div style="margin-top:12px;font-size:12px;color:var(--mut)">节气勋章('+Object.keys(medals).length+'/24)</div>';
    html+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">'+TERMS.map(function(t){
      return '<span class="pill" style="'+(medals[t]?"color:var(--gold2);border-color:var(--gold)":"opacity:.5")+'">'+t+'</span>';
    }).join("")+'</div>';
    el.innerHTML=html;
    el.querySelectorAll("button[data-k]").forEach(function(b){
      b.onclick=function(){
        var d2=load(),r=d2[today]||{};
        r[b.getAttribute("data-k")]=!r[b.getAttribute("data-k")];
        if(termName)r.term=termName;
        d2[today]=r;save(d2);draw();
      };
    });
  }
  draw();
}
window.TSTDaka={render:renderDaka,streak:streak,load:load};
})();
