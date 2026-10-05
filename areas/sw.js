var V="areas-v4",SHELL=["./","index.html","areas.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){
 e.waitUntil(caches.open(V).then(function(c){return c.addAll(SHELL.map(function(u){return new Request(u,{cache:"reload"})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){
 e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){
 var r=e.request;if(r.method!=="GET")return;
 var u=new URL(r.url);
 if(u.origin===location.origin){
  /* responde al instante desde caché y revisa la red en segundo plano; si hay versión nueva avisa a la página */
  var isDoc=r.mode==="navigate"||/\/(index\.html)?$/.test(u.pathname);
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(function(m){
   var old=m?m.clone():null;
   var net=fetch(r,{cache:"no-store"}).then(function(res){
    if(!(res&&res.ok))return res;
    var cp=res.clone(),cmp=res.clone();
    var p=caches.open(V).then(function(c){return c.put(r,cp)});
    if(old&&isDoc)p=p.then(function(){return same(old,cmp)}).then(function(s){if(!s)notify()});
    e.waitUntil(p.catch(function(){}));
    return res}).catch(function(){
    return m||(r.mode==="navigate"?caches.match("index.html"):Response.error())});
   if(m){e.waitUntil(net.catch(function(){}));return m}
   return net}));
  return}
 if(u.hostname==="www.gstatic.com"&&u.pathname.indexOf("/firebasejs/")===0){
  /* SDK de Firebase: caché y se refresca en segundo plano */
  e.respondWith(caches.open(V).then(function(c){return c.match(r).then(function(m){
   var net=fetch(r).then(function(res){if(res&&res.ok)c.put(r,res.clone());return res}).catch(function(){return m});
   return m||net})}))}
});
function same(a,b){return Promise.all([a.text(),b.text()]).then(function(t){return t[0]===t[1]})}
function notify(){self.clients.matchAll({type:"window"}).then(function(cs){cs.forEach(function(c){c.postMessage("updated")})})}
