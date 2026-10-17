var V="areas-v6",SHELL=["./","index.html","areas.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){
 /* se guarda la versión más reciente de todo al instalar (cache:"reload" ignora la caché del navegador) */
 e.waitUntil(caches.open(V).then(function(c){return Promise.all(SHELL.map(function(u){return c.add(new Request(u,{cache:"reload"})).catch(function(){})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){
 e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
function keyOf(url){var u=new URL(url);u.search="";u.hash="";return new Request(u.href)}
/* una respuesta que viene de una redirección no se puede entregar a una navegación: se reconstruye limpia */
function clean(res){
 if(!res.redirected)return Promise.resolve(res);
 return res.clone().blob().then(function(b){return new Response(b,{status:200,statusText:"OK",headers:res.headers})})}
function tell(){
 return self.clients.matchAll({type:"window",includeUncontrolled:true}).then(function(cl){cl.forEach(function(c){c.postMessage({t:"upd"})})})}
/* HTML: SIEMPRE abre al instante con la última copia guardada (con o sin internet, sin esperar a la red);
   en segundo plano baja la versión más reciente, la guarda y, si cambió, avisa a la página para que se actualice */
function doc(e){
 var key=keyOf(e.request.url);
 return caches.open(V).then(function(c){
  return c.match(key).then(function(m){
   var net=fetch(e.request.url,{cache:"no-store"}).then(function(res){
    if(!res||!res.ok)return null;
    return clean(res).then(function(cl){
     if(!m){c.put(key,cl.clone());return cl}
     return Promise.all([m.clone().text(),cl.clone().text()]).then(function(t){
      return c.put(key,cl.clone()).then(function(){if(t[0]!==t[1])tell();return cl})})})
   }).catch(function(){return null});
   if(m){e.waitUntil(net);return m}
   return net.then(function(res){
    if(res)return res;
    return c.match("./").then(function(h){return h||c.match("index.html")}).then(function(h){return h||Response.error()})})})})}
self.addEventListener("fetch",function(e){
 var r=e.request;if(r.method!=="GET")return;
 var u=new URL(r.url);
 if(u.origin===location.origin){
  var isDoc=r.mode==="navigate"||/\/(index\.html)?$/.test(u.pathname);
  if(isDoc){e.respondWith(doc(e));return}
  /* iconos, manifest, etc.: caché al instante y se actualiza en segundo plano */
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(function(m){
   var net=fetch(r).then(function(res){
    if(res&&res.ok){var cp=res.clone();caches.open(V).then(function(c){return c.put(r,cp)}).catch(function(){})}
    return res}).catch(function(){return m||Response.error()});
   if(m){e.waitUntil(net);return m}
   return net}));
  return}
 if(u.hostname==="www.gstatic.com"&&u.pathname.indexOf("/firebasejs/")===0){
  e.respondWith(caches.open(V).then(function(c){return c.match(r).then(function(m){
   var net=fetch(r).then(function(res){if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());return res}).catch(function(){return m||Response.error()});
   if(m){e.waitUntil(net);return m}
   return net})}))}
});
