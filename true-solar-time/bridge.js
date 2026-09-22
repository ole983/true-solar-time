/* 真太阳时 · App/Web 双跑桥接 bridge.js
   同一套 www/ 既跑网页又跑 Capacitor 原生壳:
   - 原生环境(window.Capacitor)走原生插件:返回键 / 分享 / 定位 / 本地通知 / 启动屏 / 状态栏
   - 网页环境自动降级为浏览器 API,功能不减
   无依赖,可安全在任意页面引入;未装插件时静默跳过,不会报错。 */
(function () {
  "use strict";
  var Cap = window.Capacitor;
  var isNative = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  var P = (Cap && Cap.Plugins) || {};
  function safe(fn, fallback) { try { return fn(); } catch (e) { return fallback; } }

  var app = {
    isNative: isNative,
    platform: safe(function () { return Cap.getPlatform(); }, "web"),
    /* 分享:原生分享面板 → 浏览器剪贴板 → prompt 兜底 */
    share: function (data) {
      data = data || {};
      var payload = { title: data.title || "真太阳时 · 子午流注", text: data.text || "", url: data.url || "" };
      if (isNative && P.Share) {
        return P.Share.share(payload).catch(function () { return webShare(payload); });
      }
      return webShare(payload);
    },
    /* 定位:原生粗略定位 → 浏览器定位。仅返回经纬度,不落盘 */
    locate: function () {
      if (isNative && P.Geolocation) {
        return P.Geolocation.requestPermissions()
          .then(function () { return P.Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 8000 }); })
          .then(function (pos) { return { latitude: pos.coords.latitude, longitude: pos.coords.longitude }; });
      }
      return new Promise(function (resolve, reject) {
        if (!navigator.geolocation) return reject(new Error("no geolocation"));
        navigator.geolocation.getCurrentPosition(
          function (pos) { resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }); },
          reject, { enableHighAccuracy: false, timeout: 8000 });
      });
    },
    /* 时辰提醒:原生本地通知(无需服务端)。ids 固定,重复调度即覆盖 */
    scheduleShichen: function (list) {
      if (!isNative || !P.LocalNotifications) return Promise.resolve(false);
      return P.LocalNotifications.requestPermissions()
        .then(function (r) {
          if (r.display !== "granted") return false;
          return P.LocalNotifications.schedule({ notifications: list || [] }).then(function () { return true; });
        })
        .catch(function () { return false; });
    },
    cancelShichen: function (ids) {
      if (!isNative || !P.LocalNotifications) return Promise.resolve(false);
      return P.LocalNotifications.cancel({ notifications: (ids || []).map(function (id) { return { id: id }; }) })
        .catch(function () { return false; });
    },
    /* 状态栏与启动屏(App 专属,网页静默跳过) */
    theme: function () {
      if (!isNative) return;
      if (P.StatusBar) safe(function () {
        P.StatusBar.setStyle({ style: "DARK" });
        P.StatusBar.setBackgroundColor({ color: "#070b16" });
      });
      if (P.SplashScreen) safe(function () { P.SplashScreen.hide(); });
    },
    /* 安卓返回键:非首页返回上一页,首页再按退出(各市场必查项) */
    initBack: function () {
      if (!isNative || !P.App) return;
      var lastBack = 0;
      P.App.addListener("backButton", function () {
        var path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
        var isHome = path === "" || path === "index.html";
        if (!isHome && history.length > 1) { history.back(); return; }
        var now = Date.now();
        if (now - lastBack < 2000) { safe(function () { P.App.exitApp(); }); }
        else { lastBack = now; toast("再按一次返回键退出"); }
      });
    }
  };

  function webShare(payload) {
    if (navigator.share) {
      return navigator.share({ title: payload.title, text: payload.text, url: payload.url }).catch(function () { return clipboard(payload); });
    }
    return clipboard(payload);
  }
  function clipboard(payload) {
    var text = (payload.title + " " + payload.url).trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { toast("链接已复制"); });
    }
    window.prompt("复制此链接分享:", text);
    return Promise.resolve();
  }
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (isNative) { try { return; } catch (e) {} }
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.style.cssText = "position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:9999;background:rgba(10,17,34,.96);color:#eef2ff;border:1px solid rgba(232,195,106,.5);border-radius:999px;padding:10px 18px;font-size:13px;box-shadow:0 6px 24px rgba(0,0,0,.5);transition:opacity .25s";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.style.opacity = "0"; }, 1600);
  }

  window.TSTApp = app;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", app.theme);
  } else { app.theme(); }
  app.initBack();
})();
