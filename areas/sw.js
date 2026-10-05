var V="areas-v3",SHELL=["./","index.html","areas.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){
 e.waitUntil(caches.open(V).then(function(c){return c.addAll(SHELL.map(function(u){return new Request(u,{cache:"reload"})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){
 e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){
 var r=e.request;if(r.method!=="GET")return;
 var u=new URL(r.url);
 if(u.origin===location.origin){
  /* red primero (para actualizar); si no hay internet, caché */
  e.respondWith(fetch(r,{cache:"no-store"}).then(function(res){
   if(res&&res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})}
   return res}).catch(function(){
   return caches.match(r,{ignoreSearch:true}).then(function(m){return m||(r.mode==="navigate"?caches.match("index.html"):Response.error())})}));
  return}
 if(u.hostname==="www.gstatic.com"&&u.pathname.indexOf("/firebasejs/")===0){
  /* SDK de Firebase: caché y se refresca en segundo plano */
  e.respondWith(caches.open(V).then(function(c){return c.match(r).then(function(m){
   var net=fetch(r).then(function(res){if(res&&res.ok)c.put(r,res.clone());return res}).catch(function(){return m});
   return m||net})}))}
});
