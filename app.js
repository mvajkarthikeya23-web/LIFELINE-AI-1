const STORAGE_KEY = "lifeline-ai-demo-v1";
const STATUS = ["Submitted", "Acknowledged", "Coordinating", "Closed"];
const SERVICE_LIST = ["Emergency care", "Trauma care", "Blood bank", "Ambulance coordination"];
const seedHospitals = [
  {id:"H-101",name:"Riverside General Hospital",area:"Central District",type:"General hospital",services:["Emergency care","Trauma care"],reportedAt:hoursAgo(1),note:"Fictional demo record"},
  {id:"H-102",name:"Greenfield Medical Centre",area:"North District",type:"Medical centre",services:["Emergency care","Blood bank"],reportedAt:hoursAgo(3),note:"Fictional demo record"},
  {id:"H-103",name:"Unity Trauma Institute",area:"East District",type:"Trauma centre",services:["Emergency care","Trauma care","Ambulance coordination"],reportedAt:hoursAgo(2),note:"Fictional demo record"},
  {id:"H-104",name:"Hope Community Hospital",area:"South District",type:"Community hospital",services:["Emergency care","Blood bank"],reportedAt:hoursAgo(5),note:"Fictional demo record"},
  {id:"H-105",name:"Meadowview Health Campus",area:"West District",type:"General hospital",services:["Emergency care","Trauma care","Blood bank"],reportedAt:hoursAgo(6),note:"Fictional demo record"}
];
function hoursAgo(hours){return new Date(Date.now()-hours*3600000).toISOString()}
const seedRequests = [
  {id:"LL-24081",category:"Road incident",area:"Central District",service:"Trauma care",description:"Demo scenario: request for trauma-service coordination.",status:"Coordinating",createdAt:hoursAgo(.5),history:[{status:"Submitted",at:hoursAgo(.5)},{status:"Acknowledged",at:hoursAgo(.4)},{status:"Coordinating",at:hoursAgo(.3)}]},
  {id:"LL-24080",category:"Blood bank enquiry",area:"North District",service:"Blood bank",description:"Demo scenario: checking reported service information.",status:"Acknowledged",createdAt:hoursAgo(2),history:[{status:"Submitted",at:hoursAgo(2)},{status:"Acknowledged",at:hoursAgo(1.8)}]},
  {id:"LL-24079",category:"Urgent transfer",area:"East District",service:"Emergency care",description:"Demo scenario: transfer coordination enquiry.",status:"Submitted",createdAt:hoursAgo(3),history:[{status:"Submitted",at:hoursAgo(3)}]}
];
let state = loadState();
let currentPage = "dashboard";
const pageContent = document.getElementById("pageContent");
const pageTitle = document.getElementById("pageTitle");
const dialog = document.getElementById("requestDialog");
function loadState(){try{const saved=localStorage.getItem(STORAGE_KEY);if(saved){const p=JSON.parse(saved);if(Array.isArray(p.hospitals)&&Array.isArray(p.requests))return p}}catch(e){console.warn("Could not load local demo data",e)}return {hospitals:structuredCloneSafe(seedHospitals),requests:structuredCloneSafe(seedRequests)}}
function structuredCloneSafe(x){return JSON.parse(JSON.stringify(x))}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function escapeHTML(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function dateText(iso){const d=new Date(iso);return Number.isNaN(d.getTime())?"Unknown":d.toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
function relativeTime(iso){const mins=Math.max(0,Math.floor((Date.now()-new Date(iso).getTime())/60000));if(mins<60)return `${mins} min ago`;const hours=Math.floor(mins/60);if(hours<24)return `${hours} hr ago`;return `${Math.floor(hours/24)} day(s) ago`}
function statusClass(s){return s.toLowerCase().replace(/\s+/g,"-")}
function statusBadge(s){return `<span class="status ${statusClass(s)}">${escapeHTML(s)}</span>`}
function newId(){return "LL-"+String(Date.now()).slice(-6)}
function setPage(page){currentPage=page;document.querySelectorAll("[data-page]").forEach(el=>el.classList.toggle("active",el.dataset.page===page));document.querySelector(".sidebar").classList.remove("open");render()}
function render(){const titles={dashboard:"Overview",hospitals:"Hospital directory",map:"Live map & nearby help",requests:"Coordination requests",assistant:"AI coordination assistant"};pageTitle.textContent=titles[currentPage]||"Overview";({dashboard:renderDashboard,hospitals:renderHospitals,map:renderLiveMap,requests:renderRequests,assistant:renderAssistant}[currentPage]||renderDashboard)()}
function statCard(label,value,note,icon){return `<article class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-number">${value}</div><div class="stat-note">${note}</div></article>`}
function requestRow(r){return `<div class="request-row"><div class="request-main"><div class="request-id">${escapeHTML(r.id)} · ${escapeHTML(r.category)}</div><div class="request-title">${escapeHTML(r.service)} — ${escapeHTML(r.area)}</div><div class="request-sub">Created ${relativeTime(r.createdAt)}</div></div><div>${statusBadge(r.status)}</div></div>`}
function hospitalMini(h){return `<div class="hospital-mini"><div class="hospital-icon">✚</div><div><b>${escapeHTML(h.name)}</b><small>${escapeHTML(h.area)} · Updated ${relativeTime(h.reportedAt)}</small></div><span class="hospital-service">${h.services.length} services</span></div>`}
function renderDashboard(){const open=state.requests.filter(r=>r.status!=="Closed").length;pageContent.innerHTML=`<div class="notice"><strong>Safety first — demo environment</strong>All records on this dashboard are fictional. Resource data is not live and does not confirm beds, blood stock or ambulance availability. For an emergency in India, call <b>112</b>.</div><div class="page-intro"><div><h2>Coordination overview</h2><p>Review demo requests and reported provider services in one place.</p></div><button class="button primary" id="newRequestBtn">＋ New request</button></div><div class="stats-grid">${statCard("Total requests",state.requests.length,"All demo requests","☷")}${statCard("Open requests",open,"Not marked closed","◷")}${statCard("Demo hospitals",state.hospitals.length,"Fictional provider records","✚")}${statCard("Service categories",SERVICE_LIST.length,"Sample service types","⌘")}</div><div class="dashboard-grid"><section class="panel"><div class="panel-heading"><div><h3>Recent coordination requests</h3><p>Follow progress across request stages</p></div><button class="text-button" data-page="requests">View all →</button></div><div class="request-list">${state.requests.length?state.requests.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5).map(requestRow).join(""):`<div class="empty-state"><b>No requests yet</b>Create a demo request to get started.</div>`}</div></section><section class="panel"><div class="panel-heading"><div><h3>Provider directory</h3><p>Reported services · fictional records</p></div><button class="text-button" data-page="hospitals">Browse →</button></div>${state.hospitals.slice(0,4).map(hospitalMini).join("")}<div class="notice" style="margin:15px 0 0"><strong>Resource freshness matters</strong>Each record includes a timestamp. Old information should be verified directly with the provider.</div></section></div>`;bindPageButtons();document.getElementById("newRequestBtn").addEventListener("click",()=>openRequestDialog())}
function renderHospitals(){pageContent.innerHTML=`<div class="page-intro"><div><h2>Hospital and service directory</h2><p>Search fictional providers by name, area or reported services.</p></div><span class="status acknowledged">DEMO RECORDS ONLY</span></div><div class="notice"><strong>Reported service is not confirmed availability</strong>This directory is seeded with fictional data for testing. It does not show live bed counts, blood inventory or ambulance locations.</div><div class="panel"><div class="toolbar"><div class="search-box"><span>⌕</span><input id="hospitalSearch" placeholder="Search hospital, area or service..." aria-label="Search hospitals"></div><select id="serviceFilter" aria-label="Filter by service"><option value="">All services</option>${SERVICE_LIST.map(s=>`<option>${escapeHTML(s)}</option>`).join("")}</select><select id="freshnessFilter" aria-label="Filter by reported age"><option value="">Any report age</option><option value="1">Reported within 2 hours</option><option value="6">Reported within 6 hours</option></select></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Provider</th><th>Reported services</th><th>Last reported</th><th>Record</th></tr></thead><tbody id="hospitalRows"></tbody></table></div></div>`;const update=()=>{const q=document.getElementById("hospitalSearch").value.toLowerCase();const service=document.getElementById("serviceFilter").value;const fresh=document.getElementById("freshnessFilter").value;const list=state.hospitals.filter(h=>(`${h.name} ${h.area} ${h.type} ${h.services.join(" ")}`.toLowerCase().includes(q))&&(!service||h.services.includes(service))&&(!fresh||(Date.now()-new Date(h.reportedAt).getTime())/3600000<=Number(fresh)));document.getElementById("hospitalRows").innerHTML=list.length?list.map(h=>`<tr><td><div class="table-title">✚ ${escapeHTML(h.name)}</div><div class="table-sub">${escapeHTML(h.area)} · ${escapeHTML(h.type)}</div></td><td><div class="service-tags">${h.services.map(s=>`<span class="tag">${escapeHTML(s)}</span>`).join("")}</div></td><td><div class="table-title">${dateText(h.reportedAt)}</div><div class="table-sub">${relativeTime(h.reportedAt)}</div></td><td><span class="status acknowledged">Fictional</span></td></tr>`).join(""):`<tr><td colspan="4"><div class="empty-state"><b>No matching demo providers</b>Try another search or service filter.</div></td></tr>`};["hospitalSearch","serviceFilter","freshnessFilter"].forEach(id=>document.getElementById(id).addEventListener(id==="hospitalSearch"?"input":"change",update));update()}
let liveMapInstance=null;
let userLocation=null;
let nearbyLayer=null;
function renderLiveMap(){
  pageContent.innerHTML=`
  <div class="page-intro"><div><h2>Nearby healthcare map</h2><p>Search any city, area, landmark or PIN code, or use your current location.</p></div><span class="status acknowledged">PUBLIC MAP DATA</span></div>
  <div class="notice"><strong>Important</strong>Public listings can be incomplete or outdated. This app cannot see private ambulance/auto GPS locations or dispatch vehicles. For a real emergency in India, call <b>112</b>.</div>
  <div class="map-actions panel">
    <label class="location-search-label" for="placeSearch">Choose a location</label>
    <div class="location-search-row"><input id="placeSearch" type="search" placeholder="Enter area, city, landmark or PIN code…" aria-label="Search for a location"><button id="searchPlaceBtn" class="button primary">Search location</button></div>
    <div class="map-action-buttons"><button id="locateMeBtn" class="button secondary">◎ Use my live location</button><button id="findHospitalsBtn" class="button primary" disabled>Find nearby hospitals</button><a class="button emergency-button" href="tel:112">Call 112</a></div>
    <p id="mapStatus" class="muted" aria-live="polite">Enter a place and click “Search location”, or choose “Use my live location”.</p>
  </div>
  <div class="map-layout"><section class="panel map-panel"><div class="panel-heading"><div><h3>Map and hospital locations</h3><p>Choose a searched location or a result to view it on the map.</p></div></div><div id="liveMap" class="live-map" role="application" aria-label="Map showing selected location and nearby hospitals"></div></section>
  <aside class="panel nearby-panel"><div class="panel-heading"><div><h3>Nearby hospitals</h3><p id="nearbyCount">No search yet</p></div></div><div id="nearbyResults" class="nearby-results"><div class="empty-state"><b>Ready to search</b>Choose a location first, then find nearby hospitals.</div></div></aside></div>
  <section class="panel transport-panel"><div class="panel-heading"><div><h3>Emergency transport options</h3><p>Open a map search for transport near your selected location.</p></div></div><div class="transport-grid"><a class="button secondary transport-link" id="ambulanceSearch" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/ambulance/">🚑 Find ambulance services</a><a class="button secondary transport-link" id="autoSearch" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/auto+rickshaw/">🛺 Find auto-rickshaws</a><a class="button secondary transport-link" id="taxiSearch" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/taxi/">🚕 Find taxis / other vehicles</a></div><p class="muted">These links search public map listings; they do not book, contact, verify availability, or live-track a vehicle. For emergency ambulance dispatch in India, call 112.</p></section>
  <section class="panel resource-panel"><div class="panel-heading"><div><h3>Live resource verification</h3><p>Real-time hospital beds, blood stock and vehicle GPS feeds are not connected.</p></div><span class="status submitted">NOT CONNECTED</span></div><div class="resource-grid"><div class="resource-item"><span class="resource-symbol">▣</span><div><b>Hospital beds</b><small>Live provider feed not connected</small></div><span class="status submitted">Unknown</span></div><div class="resource-item"><span class="resource-symbol">♥</span><div><b>Blood stock</b><small>Live blood-bank feed not connected</small></div><span class="status submitted">Unknown</span></div><div class="resource-item"><span class="resource-symbol">＋</span><div><b>Ambulance / vehicle tracking</b><small>Authorized GPS/dispatch feed not connected</small></div><span class="status submitted">Unknown</span></div></div><p class="muted">Hospital pins show mapped place locations, not live movement. Real vehicle tracking requires the vehicle operator’s permission and a connected dispatch/GPS system.</p></section>`;
  if(typeof L==='undefined'){document.getElementById('mapStatus').textContent='The map library did not load. Check your internet connection and refresh the page.';return;}
  if(liveMapInstance){liveMapInstance.remove();liveMapInstance=null;}
  liveMapInstance=L.map('liveMap').setView([20.5937,78.9629],5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(liveMapInstance);
  nearbyLayer=L.layerGroup().addTo(liveMapInstance);
  setTimeout(()=>liveMapInstance&&liveMapInstance.invalidateSize(),100);
  const status=document.getElementById('mapStatus');
  document.getElementById('searchPlaceBtn').addEventListener('click',searchPlace);
  document.getElementById('placeSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchPlace();}});
  document.getElementById('locateMeBtn').addEventListener('click',()=>{
    status.textContent='Getting your location…';
    if(!navigator.geolocation){status.textContent='This browser does not support location. Try a current version of Chrome.';return;}
    navigator.geolocation.getCurrentPosition(pos=>{
      userLocation={lat:pos.coords.latitude,lon:pos.coords.longitude,label:'My live location'};
      setSelectedLocation(userLocation);document.getElementById('placeSearch').value='My live location';
      status.textContent='Your location is selected. Click “Find nearby hospitals”. Location is used only for this browser search.';
    },err=>{const msg={1:'Location permission was denied. You can type a place in the search box instead.',2:'Your location could not be determined. Try searching by area or city.',3:'Location request timed out. Try again or search by place.'};status.textContent=msg[err.code]||'Could not get your location. Try searching by place.';},{enableHighAccuracy:true,timeout:15000,maximumAge:60000});
  });
  document.getElementById('findHospitalsBtn').addEventListener('click',findNearbyHospitals);
}
function setSelectedLocation(loc){
  userLocation=loc;nearbyLayer.clearLayers();
  L.marker([loc.lat,loc.lon]).addTo(nearbyLayer).bindPopup(escapeHTML(loc.label||'Selected search location')).openPopup();
  L.circle([loc.lat,loc.lon],{radius:250,color:'#187a83',fillOpacity:.08}).addTo(nearbyLayer);
  liveMapInstance.setView([loc.lat,loc.lon],13);
  document.getElementById('findHospitalsBtn').disabled=false;
  const origin=`${loc.lat},${loc.lon}`;
  document.getElementById('ambulanceSearch').href=`https://www.google.com/maps/search/ambulance/@${loc.lat},${loc.lon},14z`;
  document.getElementById('autoSearch').href=`https://www.google.com/maps/search/auto+rickshaw/@${loc.lat},${loc.lon},14z`;
  document.getElementById('taxiSearch').href=`https://www.google.com/maps/search/taxi/@${loc.lat},${loc.lon},14z`;
}
async function searchPlace(){
  const input=document.getElementById('placeSearch'),status=document.getElementById('mapStatus'),q=input.value.trim();
  if(!q){status.textContent='Type a city, area, landmark or PIN code first.';input.focus();return;}
  status.textContent='Searching for that location…';
  try{
    const url=`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`;
    const response=await fetch(url,{headers:{'Accept':'application/json'}});
    if(!response.ok)throw new Error('The public location search is busy. Try again shortly.');
    const data=await response.json();if(!data.length)throw new Error('No matching place found. Try a more specific area or city name.');
    const place=data[0];setSelectedLocation({lat:Number(place.lat),lon:Number(place.lon),label:place.display_name||q});
    status.textContent=`Location selected: ${place.display_name||q}. Now click “Find nearby hospitals”.`;
  }catch(err){status.textContent=err.message||'Location search failed. Check your internet connection.';}
}
async function findNearbyHospitals(){
  if(!userLocation)return;
  const status=document.getElementById('mapStatus'),results=document.getElementById('nearbyResults'),count=document.getElementById('nearbyCount'),btn=document.getElementById('findHospitalsBtn');
  btn.disabled=true;status.textContent='Searching public map data for nearby hospitals and clinics…';results.innerHTML='<div class="empty-state">Searching public map data…</div>';
  const {lat,lon}=userLocation;const query=`[out:json][timeout:25];(node[amenity~"^(hospital|clinic|doctors)$"](around:10000,${lat},${lon});way[amenity~"^(hospital|clinic|doctors)$"](around:10000,${lat},${lon});relation[amenity~"^(hospital|clinic)$"](around:10000,${lat},${lon}););out center tags;`;
  try{
    const response=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:'data='+encodeURIComponent(query)});
    if(!response.ok)throw new Error('The public map service is busy or unavailable. Try again in a minute.');
    const data=await response.json();const items=(data.elements||[]).map(e=>{const tags=e.tags||{};return {id:e.id,name:tags.name||tags['name:en']||'Unnamed healthcare place',type:tags.amenity||'healthcare',lat:e.lat??e.center?.lat,lon:e.lon??e.center?.lon,address:[tags['addr:street'],tags['addr:suburb'],tags['addr:city']].filter(Boolean).join(', ')}}).filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon));
    const unique=[...new Map(items.map(x=>[x.id,x])).values()].sort((a,b)=>distanceKm(lat,lon,a.lat,a.lon)-distanceKm(lat,lon,b.lat,b.lon)).slice(0,40);
    nearbyLayer.clearLayers();L.marker([lat,lon]).addTo(nearbyLayer).bindPopup(escapeHTML(userLocation.label||'Selected location'));
    unique.forEach(h=>{h.distance=distanceKm(lat,lon,h.lat,h.lon);h.directions=`https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${h.lat},${h.lon}&travelmode=driving`;L.marker([h.lat,h.lon]).addTo(nearbyLayer).bindPopup(`<b>${escapeHTML(h.name)}</b><br>${escapeHTML(h.type)} · ${h.distance.toFixed(1)} km`);});
    count.textContent=`${unique.length} listing(s) within about 10 km`;
    results.innerHTML=unique.length?unique.map(h=>`<article class="nearby-card"><div><b>${escapeHTML(h.name)}</b><small>${escapeHTML(h.type)}${h.address?' · '+escapeHTML(h.address):''}</small><small>Approx. ${h.distance.toFixed(1)} km away · OpenStreetMap listing</small></div><div class="nearby-card-actions"><button class="text-button" data-show-hospital="${h.lat},${h.lon}">Show on map</button><a class="text-button" href="${h.directions}" target="_blank" rel="noopener noreferrer">Directions ↗</a></div></article>`).join(''):'<div class="empty-state"><b>No nearby listings found</b>Try a nearby larger area or search directly in a maps app. This does not mean there are no hospitals nearby.</div>';
    results.querySelectorAll('[data-show-hospital]').forEach(button=>button.addEventListener('click',()=>{const [hLat,hLon]=button.dataset.showHospital.split(',').map(Number);liveMapInstance.setView([hLat,hLon],16);nearbyLayer.eachLayer(layer=>{if(layer.getLatLng&&layer.getLatLng().lat===hLat&&layer.getLatLng().lng===hLon)layer.openPopup();});}));
    status.textContent='Search complete. Hospital pins show mapped locations only; call the provider to verify details and availability.';
    if(unique.length){const group=L.featureGroup([L.marker([lat,lon]),...unique.map(h=>L.marker([h.lat,h.lon]))]);liveMapInstance.fitBounds(group.getBounds().pad(.15),{maxZoom:14});}
  }catch(err){count.textContent='Search failed';results.innerHTML='<div class="empty-state"><b>Could not load public map listings</b>Check your internet connection, then try again. You can also search in Google Maps.</div>';status.textContent=err.message||'Map search failed. Try again later.';}
  finally{btn.disabled=false;}
}
function distanceKm(lat1,lon1,lat2,lon2){const rad=n=>n*Math.PI/180;const dLat=rad(lat2-lat1),dLon=rad(lon2-lon1);const a=Math.sin(dLat/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;return 6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
function renderRequests(){pageContent.innerHTML=`<div class="page-intro"><div><h2>Coordination requests</h2><p>Track demo requests and update their workflow status.</p></div><button class="button primary" id="newRequestBtn">＋ New request</button></div><div class="notice"><strong>Workflow demonstration only</strong>Status changes are saved only in this browser. They do not notify a hospital, ambulance, blood bank or emergency responder.</div><div class="toolbar"><div class="search-box"><span>⌕</span><input id="requestSearch" placeholder="Search reference, area or service..." aria-label="Search requests"></div><select id="requestStatusFilter" aria-label="Filter by status"><option value="">All statuses</option>${STATUS.map(s=>`<option>${s}</option>`).join("")}</select></div><div id="requestCards" class="request-cards"></div>`;document.getElementById("newRequestBtn").addEventListener("click",openRequestDialog);const update=()=>{const q=document.getElementById("requestSearch").value.toLowerCase(),st=document.getElementById("requestStatusFilter").value;const list=state.requests.filter(r=>`${r.id} ${r.area} ${r.service} ${r.category}`.toLowerCase().includes(q)&&(!st||r.status===st)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));document.getElementById("requestCards").innerHTML=list.length?list.map(r=>`<article class="request-card"><div><div class="request-id">${escapeHTML(r.id)} · ${escapeHTML(r.category)}</div><h3>${escapeHTML(r.service)} — ${escapeHTML(r.area)}</h3><p>${escapeHTML(r.description||"No additional description provided.")}</p><p>Created ${dateText(r.createdAt)} · ${r.history.length} status event(s)</p><div style="margin-top:9px">${statusBadge(r.status)}</div></div><div class="request-card-actions"><label style="margin:0">Status<select data-status-id="${escapeHTML(r.id)}">${STATUS.map(s=>`<option ${r.status===s?"selected":""}>${s}</option>`).join("")}</select></label><button class="button secondary small" data-history-id="${escapeHTML(r.id)}">History</button></div></article>`).join(""):`<div class="panel empty-state"><b>No requests found</b>Change your filters or create a demo request.</div>`;document.querySelectorAll("[data-status-id]").forEach(el=>el.addEventListener("change",()=>changeStatus(el.dataset.statusId,el.value)));document.querySelectorAll("[data-history-id]").forEach(el=>el.addEventListener("click",()=>showHistory(el.dataset.historyId)))};document.getElementById("requestSearch").addEventListener("input",update);document.getElementById("requestStatusFilter").addEventListener("change",update);update()}
function renderAssistant(){
  pageContent.innerHTML=`<div class="assistant-hero"><div class="eyebrow">LIFELINE AI · LOCAL OPEN MODEL</div><h2>AI support for coordination, not clinical decisions.</h2><p>This assistant connects to Qwen2.5 3B through Ollama running on this computer. Use fictional, non-sensitive demo details only.</p></div><div class="assistant-layout"><section class="panel"><div class="panel-heading"><div><h3>Coordination helper</h3><p>Your prompt is sent to your local Ollama service, not a paid AI API.</p></div><span id="modelStatus" class="status acknowledged">CHECKING MODEL</span></div><form id="assistantForm" class="assistant-box"><label>Service needed<select id="assistantService" class="field">${SERVICE_LIST.map(s=>`<option>${s}</option>`).join("")}</select></label><label>Area to search<input id="assistantArea" class="field" maxlength="100" placeholder="e.g. Central District"></label><label>Non-sensitive coordination note<textarea id="assistantNote" class="field" maxlength="400" placeholder="Example: Demo request needs a provider that reports trauma care."></textarea></label><button class="button primary" id="generateAiBtn" type="submit">✧ Ask local AI model</button></form><div id="assistantResult" class="assistant-result hidden" aria-live="polite"></div></section><aside class="panel"><div class="panel-heading"><div><h3>Local model setup</h3><p>Powered by Qwen2.5 3B + Ollama</p></div></div><ul class="bullet-list"><li>Model: <b>qwen2.5:3b</b> (download separately).</li><li>Runs locally on your computer after setup.</li><li>No API key or paid AI service required.</li><li>Matches only fictional sample directory records provided to the prompt.</li><li>Cannot confirm live hospital, bed, blood or ambulance availability.</li><li>Does not diagnose, recommend treatment or dispatch help.</li></ul><div class="notice"><strong>Safety reminder</strong>Use fictional examples only. Do not enter real patient details. For emergencies in India, call 112. Any AI output must be checked by an authorized human.</div><p class="muted">If the model is not installed, open the VS Code terminal and run: <code>ollama pull qwen2.5:3b</code></p></aside></div>`;
  const status = document.getElementById("modelStatus");
  const result = document.getElementById("assistantResult");
  const button = document.getElementById("generateAiBtn");
  fetch("/api/health").then(r=>r.json()).then(data=>{
    status.textContent = data.model_ready ? "MODEL READY" : "SETUP NEEDED";
    status.className = "status " + (data.model_ready ? "coordinating" : "submitted");
  }).catch(()=>{
    status.textContent = "SERVER OFFLINE";
    status.className = "status submitted";
  });
  document.getElementById("assistantForm").addEventListener("submit", async e=>{
    e.preventDefault();
    const service = document.getElementById("assistantService").value;
    const area = document.getElementById("assistantArea").value.trim();
    const note = document.getElementById("assistantNote").value.trim();
    const matches = state.hospitals.filter(h=>h.services.includes(service)&&(!area||h.area.toLowerCase().includes(area.toLowerCase())));
    const safeHospitals = matches.map(h=>({name:h.name,area:h.area,services:h.services,reportedAt:h.reportedAt,recordType:"fictional demo record"}));
    result.classList.remove("hidden");
    result.textContent = "Contacting your local model… The first response may take a little while while the model loads.";
    button.disabled = true;
    button.textContent = "Working…";
    try {
      const response = await fetch("/api/ai", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({service,area,note,hospitals:safeHospitals})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The local AI request failed.");
      result.innerHTML = `<h4>Local model response · Qwen2.5 3B</h4><p>${escapeHTML(data.response).replace(/\n/g,"<br>")}</p><hr><p><b>Safety check:</b> The directory records are fictional and do not prove availability. Verify any information directly with an authorized provider. This prototype cannot dispatch help.</p>`;
    } catch (error) {
      result.innerHTML = `<h4>Could not reach the local model</h4><p>${escapeHTML(error.message || "Unknown error")}</p><p>Check that Ollama is installed and running, then open a VS Code terminal and run <code>ollama pull qwen2.5:3b</code>. Start the app using <code>start_lifeline.bat</code>, not by opening index.html directly.</p>`;
    } finally {
      button.disabled = false;
      button.textContent = "✧ Ask local AI model";
    }
  });
}
function openRequestDialog(){document.getElementById("requestForm").reset();dialog.showModal()}
function createRequest(form){const fd=new FormData(form);const now=new Date().toISOString();const r={id:newId(),category:String(fd.get("category")),area:String(fd.get("area")).trim(),service:String(fd.get("service")),description:String(fd.get("description")||"").trim(),status:"Submitted",createdAt:now,history:[{status:"Submitted",at:now}]};state.requests.unshift(r);saveState();dialog.close();toast(`Demo request created: ${r.id}`);setPage("requests")}
function changeStatus(id,next){const r=state.requests.find(x=>x.id===id);if(!r||!STATUS.includes(next))return;if(r.status===next)return;r.status=next;r.history.push({status:next,at:new Date().toISOString()});saveState();toast(`${id} updated to ${next}. Demo only.`);renderRequests()}
function showHistory(id){const r=state.requests.find(x=>x.id===id);if(!r)return;alert(`Status history for ${r.id}\n\n${r.history.map(h=>`${dateText(h.at)} — ${h.status}`).join("\n")}\n\nDemo data only; no provider was contacted.`)}
function bindPageButtons(){document.querySelectorAll("#pageContent [data-page]").forEach(el=>el.addEventListener("click",()=>setPage(el.dataset.page)))}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),3200)}
document.querySelectorAll(".nav-link[data-page],.brand[data-page]").forEach(el=>el.addEventListener("click",()=>setPage(el.dataset.page)));
document.getElementById("dismissSafety").addEventListener("click",()=>document.querySelector(".safety-banner").classList.add("hidden"));
document.getElementById("closeDialog").addEventListener("click",()=>dialog.close());
document.getElementById("cancelDialog").addEventListener("click",()=>dialog.close());
document.getElementById("requestForm").addEventListener("submit",e=>{e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;createRequest(form)});
document.getElementById("mobileMenu").addEventListener("click",()=>document.querySelector(".sidebar").classList.toggle("open"));
document.getElementById("exportData").addEventListener("click",()=>{const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),notice:"Fictional demo data only",...state},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="lifeline-ai-demo-data.json";a.click();URL.revokeObjectURL(url);toast("Demo data export started.")});
document.getElementById("resetData").addEventListener("click",()=>{if(confirm("Reset all local demo changes and restore the original fictional records?")){state={hospitals:structuredCloneSafe(seedHospitals),requests:structuredCloneSafe(seedRequests)};saveState();render();toast("Demo data reset.")}});
render();
