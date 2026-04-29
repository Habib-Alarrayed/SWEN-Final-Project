// ===== USERS =====
function getUsers(){return JSON.parse(localStorage.getItem("users"))||[];}
function saveUsers(u){localStorage.setItem("users",JSON.stringify(u));}

function register(){
let n=regName.value.trim(),p=regPassword.value.trim();
if(!n||!p){message.innerText="Fill all fields";return;}
let u=getUsers();
if(u.find(x=>x.name===n)){message.innerText="User exists";return;}
u.push({name:n,password:p});
saveUsers(u);
message.innerText="Registered!";
}

function login(){
let n=loginName.value.trim(),p=loginPassword.value.trim();
let u=getUsers().find(x=>x.name===n&&x.password===p);
if(!u){message.innerText="Invalid login";return;}
localStorage.setItem("currentUser",n);
window.location.href="browse.html";
}

function logout(){
localStorage.removeItem("currentUser");
window.location.href="index.html";
}

function displayUsername(){
let u=localStorage.getItem("currentUser");
let el=document.getElementById("usernameDisplay");
if(el) el.innerText=u||"Guest";
}

// ===== NAV =====
function goHome(){window.location.href="browse.html";}
function goBack(){window.history.back();}
function goCart(){
if(!localStorage.getItem("reservedItem")){
alert("No item in cart");
return;
}
window.location.href="checkout.html";
}

// ===== LISTINGS =====
function getListings(){return JSON.parse(localStorage.getItem("listings"))||[];}
function saveListings(l){localStorage.setItem("listings",JSON.stringify(l));}

// ===== ADD =====
function addListing(){
let n=itemName.value.trim();
let b=Number(itemPrice.value);
let m=Number(minPrice.value);
let loc=itemLocation.value;
let exp=Number(expiryMinutes.value);
let img=itemImage.value||"https://via.placeholder.com/400";

if(!n||b<=0||m<=0||exp<=0){
addMessage.innerText="Invalid input";
return;
}

if(m>b){
addMessage.innerText="Min price cannot exceed base price";
return;
}

let l=getListings();
l.push({
id:Date.now(),
name:n,
basePrice:b,
minPrice:m,
location:loc,
createdAt:Date.now(),
expiryTime:Date.now()+exp*60000,
status:"available",
image:img
});

saveListings(l);
displayListings();
}

// ===== PRICE + EXPIRY =====
function getDynamicPrice(i){
let now=Date.now();
let left=i.expiryTime-now;

if(left<=0){
if(i.status!=="expired"){
let l=getListings();
let item=l.find(x=>x.id===i.id);
if(item){
item.status="expired";
item.expiredAt=now;
saveListings(l);
}
}
return "Expired";
}

let total=i.expiryTime-i.createdAt;
let ratio=left/total;
return (i.minPrice+(i.basePrice-i.minPrice)*ratio).toFixed(2);
}

// ===== CLEAN =====
function cleanExpired(){
let now=Date.now();
let updated=getListings().filter(i=>!(i.status==="expired" && i.expiredAt && (now-i.expiredAt)>120000));
saveListings(updated);
}

// ===== 🔔 NOTIFICATIONS =====
function updateNotifications(items){
let box=document.getElementById("notificationBox");
if(!box) return;

box.innerHTML="";

items.forEach(i=>{
let timeLeft=i.expiryTime - Date.now();

if(timeLeft < 600000 && timeLeft > 0){
box.innerHTML += `<div class="card" style="background:#fff3cd">⚠️ ${i.name} expiring soon</div>`;
}

if(i.status==="expired"){
box.innerHTML += `<div class="card" style="background:#ff4d4d;color:white">❌ ${i.name} expired</div>`;
}
});
}

// ===== 🌍 IMPACT TRACKING =====
function updateImpact(){
let box=document.getElementById("impactBox");
if(!box) return;

let meals = Number(localStorage.getItem("mealsSaved")) || 0;
let co2 = meals * 2;

box.innerHTML = `
<div class="card">
Meals saved: ${meals}<br>
CO₂ reduced: ${co2} kg
</div>`;
}

// ===== DISPLAY =====
function displayListings(){
cleanExpired();

let c=document.getElementById("listings");
if(!c)return;

let f=document.getElementById("locationFilter").value;
c.innerHTML="";

let visible=getListings()
.filter(i=>i.status!=="sold")
.filter(i=>f==="All"||i.location===f);

updateNotifications(visible);
updateImpact(); // ✅ RESTORED

visible.forEach(i=>{
let price=getDynamicPrice(i);

c.innerHTML+=`
<div class="listing-card">
<img class="food-image" src="${i.image}">
<div class="listing-content">
<h3>${i.name}</h3>
<p>${i.location}</p>
<p>Status: ${i.status}</p>

${price==="Expired"
? `<div class="price-pill" style="background:red;color:white;">Expired</div>`
: `<div class="price-pill">$${price}</div>`}

<button class="view-btn" onclick="viewItem(${i.id})">View</button>
</div>
</div>`;
});
}

// ===== VIEW =====
function viewItem(id){
localStorage.setItem("selectedItem",id);
window.location.href="details.html";
}

// ===== DETAILS =====
function displaySelectedItem(){
let id=localStorage.getItem("selectedItem");
let i=getListings().find(x=>x.id==id);
let c=document.getElementById("itemDetails");
if(!c||!i)return;

let price=getDynamicPrice(i);

c.innerHTML=`
<div class="listing-card">
<img class="food-image" src="${i.image}">
<div class="listing-content">
<h2>${i.name}</h2>
<p>${i.location}</p>
<p>Status: ${i.status}</p>

${price==="Expired"
? `<div class="price-pill" style="background:red;color:white;">Expired</div>`
: `<div class="price-pill">$${price}</div>`}

${i.status==="available"
? `<button onclick="reserveItem()">Reserve</button>`
: `<button disabled>Unavailable</button>`}
</div>
</div>`;
}

// ===== RESERVE =====
function reserveItem(){
if(localStorage.getItem("reservedItem")){
alert("You already have a reserved item.");
return;
}

let id=localStorage.getItem("selectedItem");
let l=getListings();
let i=l.find(x=>x.id==id);

if(!i || i.status!=="available"){
alert("Item not available.");
return;
}

i.status="reserved";
localStorage.setItem("reservedItem",id);
saveListings(l);

window.location.href="checkout.html";
}

// ===== CHECKOUT =====
function displayCheckout(){
let id=localStorage.getItem("reservedItem");
let i=getListings().find(x=>x.id==id);
let c=document.getElementById("checkoutDetails");

if(!c||!i)return;

let price=getDynamicPrice(i);

c.innerHTML=`
<div class="listing-card">
<img class="food-image" src="${i.image}">
<div class="listing-content">
<h2>${i.name}</h2>
<p>${i.location}</p>
<p>Status: ${i.status}</p>

${price==="Expired"
? `<div class="price-pill" style="background:red;color:white;">Expired</div>`
: `<div class="price-pill">$${price}</div>`}
</div>
</div>`;
}

// ===== COMPLETE CHECKOUT =====
function completeCheckout(){
let id=localStorage.getItem("reservedItem");
let l=getListings();
let i=l.find(x=>x.id==id);

if(!i){
alert("Checkout failed: item not found.");
return;
}

if(i.status==="expired"){
alert("Checkout failed: item has expired.");
return;
}

i.status="sold";
localStorage.removeItem("reservedItem");

// ✅ UPDATE IMPACT
let meals = Number(localStorage.getItem("mealsSaved")) || 0;
localStorage.setItem("mealsSaved", meals + 1);

saveListings(l);

alert("Payment successful!");
window.location.href="browse.html";
}

// ===== REMOVE =====
function cancelCheckout(){
let id=localStorage.getItem("reservedItem");
let l=getListings();
let i=l.find(x=>x.id==id);

if(i) i.status="available";

localStorage.removeItem("reservedItem");
saveListings(l);
goHome();
}

// ===== AUTO =====
setInterval(displayListings,3000);

if(location.pathname.includes("browse")) displayListings();
if(location.pathname.includes("details")) displaySelectedItem();
if(location.pathname.includes("checkout")) displayCheckout();

displayUsername();