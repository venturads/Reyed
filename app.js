const DB_KEY = "reyed_demo_db_v5";
const SESSION_KEY = "reyed_session_v5";

const STATUS_LABELS = {
  requested:"Requested",
  accepted:"Driver accepted",
  arrived:"Driver at pickup",
  picked_up:"Rider picked up",
  completed:"Dropped off",
  cancelled:"Cancelled"
};
const STATUS_ORDER = ["requested","accepted","arrived","picked_up","completed"];

function defaultDB(){
  return {
    users:[
      {id:"rider-1",role:"rider",name:"Jordan Rider",email:"rider@reyed.demo",password:"rider123"},
      {id:"rider-2",role:"rider",name:"Taylor Rider",email:"taylor@reyed.demo",password:"rider123"},
      {id:"driver-1",role:"driver",name:"Casey Driver",email:"driver@reyed.demo",password:"driver123",vehicle:"2022 Toyota Camry • Blue"},
      {id:"driver-2",role:"driver",name:"Morgan Driver",email:"morgan@reyed.demo",password:"driver123",vehicle:"2021 Honda Accord • Black"},
      {id:"admin-1",role:"admin",name:"Reyed Admin",email:"admin@reyed.demo",password:"admin123"}
    ],
    rides:[
      {id:"ride-demo-open",riderId:"rider-2",driverId:null,pickup:"Starbucks, 639 N Broadway, Los Angeles, CA",destination:"Union Station, 800 N Alameda St, Los Angeles, CA",pickupLat:34.0588,pickupLng:-118.2467,destLat:34.0562,destLng:-118.2365,offer:16.50,status:"requested",createdAt:"2026-07-27T20:30:00.000Z",updatedAt:"2026-07-27T20:30:00.000Z"},
      {id:"ride-demo-1",riderId:"rider-1",driverId:"driver-1",pickup:"Union Station, Los Angeles",destination:"Crypto.com Arena, Los Angeles",pickupLat:34.0562,pickupLng:-118.2365,destLat:34.0430,destLng:-118.2673,offer:18,status:"completed",createdAt:"2026-07-22T18:20:00.000Z",updatedAt:"2026-07-22T19:00:00.000Z",completedAt:"2026-07-22T19:00:00.000Z"}
    ]
  };
}
function getDB(){
  try{
    const value=JSON.parse(localStorage.getItem(DB_KEY));
    if(value && Array.isArray(value.users) && Array.isArray(value.rides)) return value;
  }catch(e){}
  const db=defaultDB(); saveDB(db); return db;
}
function saveDB(db){localStorage.setItem(DB_KEY,JSON.stringify(db));}
function getSession(){
  try{return JSON.parse(sessionStorage.getItem(SESSION_KEY));}catch(e){return null}
}
function setSession(user){sessionStorage.setItem(SESSION_KEY,JSON.stringify({userId:user.id,role:user.role}));}
function clearSession(){sessionStorage.removeItem(SESSION_KEY);}
function currentUser(){
  const session=getSession(); if(!session) return null;
  return getDB().users.find(u=>u.id===session.userId && u.role===session.role)||null;
}
function requireRole(role){
  const user=currentUser();
  if(!user || (role && user.role!==role)){location.href="index.html";return null}
  return user;
}
function logout(){clearSession();location.href="index.html";}
function uid(prefix){return prefix+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7);}
function money(value){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(value)||0);}
function dateText(value){return new Date(value).toLocaleString("en-US",{dateStyle:"medium",timeStyle:"short"});}
function statusLabel(status){return STATUS_LABELS[status]||status;}
function toast(message){
  const el=document.createElement("div"); el.className="toast";el.textContent=message;document.body.appendChild(el);
  setTimeout(()=>el.remove(),2600);
}
function getUser(id){return getDB().users.find(u=>u.id===id)}
function statusBadge(status){return `<span class="status ${status}">${statusLabel(status)}</span>`}
function rideProgress(status){
  const current=STATUS_ORDER.indexOf(status);
  return `<div class="progress">${STATUS_ORDER.map((s,i)=>`<div class="step ${i<=current?"done":""}"><i></i>${["Request","Accept","Pickup","On trip","Drop off"][i]}</div>`).join("")}</div>`;
}
function escapeHTML(text=""){
  return String(text).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function rideCard(ride,options={}){
  const rider=getUser(ride.riderId),driver=getUser(ride.driverId);
  const actions=options.actions?options.actions(ride):"";
  return `<article class="ride-card ${!["completed","cancelled"].includes(ride.status)?"active":""}">
    <div class="meta"><div>${statusBadge(ride.status)} <span class="small">#${escapeHTML(ride.id.slice(-7))}</span></div><div class="money">${money(ride.offer)}</div></div>
    ${rideProgress(ride.status)}
    <div class="route"><div class="route-icon">📍</div><div><strong>${escapeHTML(ride.pickup)}</strong><div class="small">Pickup</div></div></div>
    <div class="route"><div class="route-icon">🏁</div><div><strong>${escapeHTML(ride.destination)}</strong><div class="small">Drop-off</div></div></div>
    <div class="ride-detail-grid">
      <div><span class="small">Rider</span><strong>${escapeHTML(rider?.name||"Unknown")}</strong></div>
      <div><span class="small">Driver</span><strong>${escapeHTML(driver?.name||"Not assigned")}</strong></div>
      <div><span class="small">Requested</span><strong>${dateText(ride.createdAt)}</strong></div>
      <div><span class="small">Ride ID</span><strong>#${escapeHTML(ride.id.slice(-7))}</strong></div>
    </div>
    ${ride.completedAt?`<div class="small ride-completed-time">Completed ${dateText(ride.completedAt)}</div>`:""}
    ${actions?`<div class="btn-row" style="margin-top:12px">${actions}</div>`:""}
  </article>`;
}
function haversineMiles(a,b){
  const R=3958.8,toRad=x=>x*Math.PI/180;
  const dLat=toRad(b.lat-a.lat),dLng=toRad(b.lng-a.lng);
  const q=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(q));
}
function initLeafletMap(id,center=[34.0522,-118.2437],zoom=13){
  if(!window.L){document.getElementById(id).innerHTML='<div class="empty">Map library could not load.</div>';return null}
  const map=L.map(id).setView(center,zoom);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    maxZoom:19,
    detectRetina:true,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  setTimeout(()=>map.invalidateSize(),100);
  return map;
}
window.addEventListener("storage",()=>{if(typeof window.render==="function")window.render();});
