import { auth, db } from "./firebase.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
doc,
getDoc,
collection,
query,
where,
getDocs,
orderBy,
limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
ELEMENTS
========================= */

const username = document.getElementById("username");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");

const balance = document.getElementById("balance");

const level = document.getElementById("level");
const xp = document.getElementById("xp");
const rank = document.getElementById("rank");

const gamesPlayed = document.getElementById("gamesPlayed");
const rewardsEarned = document.getElementById("rewardsEarned");
const spinsToday = document.getElementById("spinsToday");

const adminMenu =
document.getElementById("adminMenu");

/* =========================
LEVEL SYSTEM
========================= */

function calculateLevel(xpValue){

if(xpValue >= 5000) return 10;
if(xpValue >= 4000) return 9;
if(xpValue >= 3000) return 8;
if(xpValue >= 2500) return 7;
if(xpValue >= 2000) return 6;
if(xpValue >= 1500) return 5;
if(xpValue >= 1000) return 4;
if(xpValue >= 500) return 3;
if(xpValue >= 200) return 2;

return 1;

}

/* =========================
RANK SYSTEM
========================= */

function getRank(xpValue){

if(xpValue >= 10000)
return "LEGENDARY";

if(xpValue >= 7000)
return "MASTER";

if(xpValue >= 5000)
return "DIAMOND";

if(xpValue >= 3000)
return "PLATINUM";

if(xpValue >= 1500)
return "GOLD";

if(xpValue >= 500)
return "SILVER";

return "BRONZE";

}

/* =========================
XP PROGRESS
========================= */

function updateXPBar(currentXP){

const xpBar =
document.getElementById("xpProgress");

if(!xpBar) return;

let percentage =
(currentXP % 1000) / 1000 * 100;

xpBar.style.width =
percentage + "%";

}

/* =========================
AUTH CHECK
========================= */

onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location.href =
"login.html";

return;

}

try{

const userRef =
doc(db,"users",user.uid);

const snap =
await getDoc(userRef);

if(snap.exists()){

const data =
snap.data();

username.textContent =
data.username || "User";

profileName.textContent =
data.username || "User";

profileEmail.textContent =
data.email || "No Email";

balance.textContent =
Number(
data.balance || 0
).toFixed(2);

xp.textContent =
data.xp || 0;

level.textContent =
calculateLevel(
data.xp || 0
);

if(rank){

rank.textContent =
getRank(
data.xp || 0
);

}

updateXPBar(
data.xp || 0
);

if(gamesPlayed){

gamesPlayed.textContent =
data.gamesPlayed || 0;

}

if(rewardsEarned){

rewardsEarned.textContent =
Number(
data.totalRewards || 0
).toFixed(2);

}

if(spinsToday){

spinsToday.textContent =
`${data.dailySpins || 0}/5`;

}

if(
data.role &&
data.role === "admin"
){

adminMenu.style.display =
"block";

}

loadNotificationCount(
user.uid
);

}

loadAnnouncement();

loadRecentActivity(
user.uid
);

loadGameHistory(
user.uid
);

}catch(error){

console.error(error);

}

});

/* =========================
NOTIFICATIONS
========================= */

async function loadNotificationCount(userId){

const badge =
document.getElementById(
"notificationBadge"
);

if(!badge) return;

try{

const q = query(
collection(db,"notifications"),
where("userId","==",userId)
);

const snapshot =
await getDocs(q);

badge.textContent =
snapshot.size;

if(snapshot.size === 0){

badge.style.display =
"none";

}else{

badge.style.display =
"inline-block";

}

}catch(error){

console.error(error);

}

}

/* =========================
ANNOUNCEMENTS
========================= */

async function loadAnnouncement(){

const announcementBox =
document.getElementById(
"announcementMessage"
);

if(!announcementBox) return;

try{

const q = query(
collection(db,"announcements"),
orderBy(
"createdAt",
"desc"
),
limit(1)
);

const snapshot =
await getDocs(q);

if(snapshot.empty){

announcementBox.innerHTML =
"<p>No announcements available.</p>";

return;

}

snapshot.forEach(docSnap=>{

const data =
docSnap.data();

announcementBox.innerHTML = `

<h4>${data.title || "Announcement"}</h4>

<p>${data.message || ""}</p>

`;

});

}catch(error){

console.error(error);

}

}

/* =========================
RECENT TRANSACTIONS
========================= */

async function loadRecentActivity(userId){

const activityBox =
document.getElementById(
"recentActivity"
);

if(!activityBox) return;

try{

const q = query(
collection(db,"transactions"),
where("userId","==",userId)
);

const snapshot =
await getDocs(q);

activityBox.innerHTML = "";

if(snapshot.empty){

activityBox.innerHTML =
"<p>No activity available.</p>";

return;

}

let count = 0;

snapshot.forEach(docSnap=>{

if(count >= 5) return;

const data =
docSnap.data();

activityBox.innerHTML += `

<div class="activity-item">

<h4>${data.type}</h4>

<p>Amount: $${data.amount}</p>

<p>Status: ${data.status}</p>

</div>

`;

count++;

});

}catch(error){

console.error(error);

}

}

/* =========================
GAME HISTORY
========================= */

async function loadGameHistory(userId){

const gameBox =
document.getElementById(
"recentGames"
);

if(!gameBox) return;

try{

const q = query(
collection(db,"gameHistory"),
where("userId","==",userId)
);

const snapshot =
await getDocs(q);

gameBox.innerHTML = "";

if(snapshot.empty){

gameBox.innerHTML =
"<p>No games played yet.</p>";

return;

}

let count = 0;

snapshot.forEach(docSnap=>{

if(count >= 5) return;

const data =
docSnap.data();

gameBox.innerHTML += `

<div class="activity-item">

<h4>${data.game}</h4>

<p>Entry Fee: $${data.entryFee}</p>

</div>

`;

count++;

});

}catch(error){

console.error(error);

}

}

/* =========================
LOGOUT
========================= */

const logoutBtn =
document.getElementById(
"logoutBtn"
);

if(logoutBtn){

logoutBtn.addEventListener(
"click",
async()=>{

try{

await signOut(auth);

window.location.href =
"login.html";

}catch(error){

alert(error.message);

}

});

}

