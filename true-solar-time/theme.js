/* 真太阳时 · 主题切换(浅色「宣纸白昼」/ 暗色「墨夜」)
   在 <head> 同步加载,先于渲染设定 data-theme,避免闪烁。
   按钮由本脚本自动加入顶栏,无需改页面。 */
(function(){
  var KEY="tst.theme.v1";
  function read(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
  function sysDark(){try{return window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;}catch(e){return false;}}
  function apply(t){
    document.documentElement.setAttribute("data-theme",t);
    var b=document.getElementById("themeBtn");
    if(b)b.textContent=(t==="dark"?"☾ 夜":"☀ 昼");
  }
  // 立即应用(避免闪烁):用户选择优先,否则跟随系统
  var cur=read()||(sysDark()?"dark":"light");
  apply(cur);

  window.TSTTheme={
    get:function(){return document.documentElement.getAttribute("data-theme")||"light";},
    set:function(v){v=(v==="dark")?"dark":"light";try{localStorage.setItem(KEY,v);}catch(e){}apply(v);},
    toggle:function(){this.set(this.get()==="dark"?"light":"dark");}
  };

  function mount(){
    if(document.getElementById("themeBtn"))return;
    var host=document.querySelector(".top-right")||document.querySelector(".topbar-in");
    if(!host)return;
    var b=document.createElement("button");
    b.id="themeBtn";b.type="button";b.className="theme-btn";
    b.title="切换昼/夜主题";
    b.textContent=(window.TSTTheme.get()==="dark"?"☾ 夜":"☀ 昼");
    b.onclick=function(){window.TSTTheme.toggle();};
    host.insertBefore(b,host.firstChild);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);
  else mount();
})();
