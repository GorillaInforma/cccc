var V="areas-v5",SHELL=["./","index.html","areas.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){
 e.waitUntil(caches.open(V).then(function(c){return c.addAll(SHELL.map(function(u){return new Request(u,{cache:"reload"})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){
 e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){
 var r=e.request;if(r.method!=="GET")return;
 var u=new URL(r.url);
 if(u.origin===location.origin){
  var isDoc=r.mode==="navigate"||/\/(index\.html)?$/.test(u.pathname);
  if(isDoc){
   /* HTML: red primero (siempre la versión nueva); si no hay red o tarda más de 2.5 s, usa la caché */
   e.respondWith(caches.match(r,{ignoreSearch:true}).then(function(m){
    var net=fetch(r,{cache:"no-store"}).then(function(res){
     if(res&&res.ok){var cp=res.clone();e.waitUntil(caches.open(V).then(function(c){return c.put(r,cp)}).catch(function(){}));return res}
     return m||res});
    e.waitUntil(net.catch(function(){}));
    if(!m)return net;
    var tm=new Promise(function(ok){setTimeout(function(){ok(m)},2500)});
    return Promise.race([net.catch(function(){return m}),tm])}));
   return}
  /* iconos, manifest, etc.: caché al instante y se actualiza en segundo plano */
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(function(m){
   var net=fetch(r).then(function(res){
    if(res&&res.ok){var cp=res.clone();e.waitUntil(caches.open(V).then(function(c){return c.put(r,cp)}).catch(function(){}))}
    return res}).catch(function(){return m||Response.error()});
   return m||net}));
  return}
 if(u.hostname==="www.gstatic.com"&&u.pathname.indexOf("/firebasejs/")===0){
  e.respondWith(caches.open(V).then(function(c){return c.match(r).then(function(m){
   var net=fetch(r).then(function(res){if(res&&res.ok)c.put(r,res.clone());return res}).catch(function(){return m});
   return m||net})}))}
});
