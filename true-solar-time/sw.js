/* 离线缓存:首访联网缓存后,断网双击/离线仍可打开全部页面 */
const V="tst-v5";
const FILES=["index.html","cities.html","jieqi.html","liuzhu.html","sun.html","science.html","tools.html","privacy.html","terms.html","vip.html","styles.css","astro.js","app.js","cities.js","bridge.js","manifest.webmanifest","favicon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const copy=res.clone();caches.open(V).then(c=>c.put(e.request,copy));return res;}).catch(()=>caches.match("index.html"))));});
