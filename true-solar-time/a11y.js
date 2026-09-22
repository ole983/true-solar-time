/* 真太阳时 · 长辈模式 + 语音播报(a11y.js)
   在 <head> 同步加载,先于渲染设定 data-elder,避免闪烁。
   按钮由本脚本自动加入顶栏(主题按钮旁),无需改页面。 */
(function(){
  var KEY="tst.elder.v1";
  function read(){try{return localStorage.getItem(KEY)==="1";}catch(e){return false;}}
  function apply(on){
    if(on)document.documentElement.setAttribute("data-elder","1");
    else document.documentElement.removeAttribute("data-elder");
    var b=document.getElementById("elderBtn");
    if(b){b.textContent=on?"👴 大字开":"👴 大字";b.setAttribute("aria-pressed",on?"true":"false");}
  }
  apply(read());

  window.TSTElder={
    get:function(){return document.documentElement.hasAttribute("data-elder");},
    set:function(v){try{localStorage.setItem(KEY,v?"1":"0");}catch(e){}apply(!!v);},
    toggle:function(){this.set(!this.get());}
  };

  /* ---- 语音播报(浏览器原生,离线可用,零成本) ---- */
  window.TSTSpeak=function(text){
    try{
      if(!("speechSynthesis"in window)){alert("当前环境不支持语音播报");return;}
      window.speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(String(text).replace(/<[^>]*>/g,"").slice(0,500));
      u.lang="zh-CN";u.rate=0.92;u.pitch=1;
      window.speechSynthesis.speak(u);
    }catch(e){alert("当前环境不支持语音播报");}
  };
  window.TSTStopSpeak=function(){try{window.speechSynthesis.cancel();}catch(e){}};

  function mount(){
    var host=document.querySelector(".top-right")||document.querySelector(".topbar-in");
    if(!host||document.getElementById("elderBtn"))return;
    var b=document.createElement("button");
    b.id="elderBtn";b.type="button";b.className="theme-btn";
    b.title="长辈模式:大字、隐藏参数、操作简化";
    var on=window.TSTElder.get();
    b.textContent=on?"👴 大字开":"👴 大字";
    b.setAttribute("aria-pressed",on?"true":"false");
    b.onclick=function(){window.TSTElder.toggle();};
    var tb=document.getElementById("themeBtn");
    if(tb&&tb.nextSibling)host.insertBefore(b,tb.nextSibling);
    else host.appendChild(b);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);
  else mount();
})();
