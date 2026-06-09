import { db } from "./firebase.js";

import {
collection,
getDocs,
query,
orderBy,
limit,
where
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const leaderboardList =
document.getElementById(
"leaderboardList"
);

const winnerList =
document.getElementById(
"winnerList"
);

/* =========================
LEVEL SYSTEM
========================= */

function calculateLevel(xp){

if(xp >= 5000) return 10;
if(xp >= 4000) return 9;
if(xp >= 3000) return 8;
if(xp >= 2500) return 7;
if(xp >= 2000) return 6;
if(xp >= 1500) return 5;
if(xp >= 1000) return 4;
if(xp >= 500) return 3;
if(xp >= 200) return 2;

return 1;

}

/* =========================
TOP PLAYERS
========================= */

async function loadLeaderboard(){

try{

const q =
query(
collection(db,"users"),
orderBy("balance","desc"),
limit(20)
);

const snapshot =
await getDocs(q);

leaderboardList.innerHTML = "";

let rank = 1;

snapshot.forEach(docSnap=>{

const data =
docSnap.data();

const level =
calculateLevel(
data.xp || 0
);

leaderboardList.innerHTML += `

<div class="player">

<div>

<h3>
${data.username || "Player"}
</h3>

<p>
Level: ${level}
</p>

</div>

<div>

<span class="rank">
#${rank}
</span>

<h3>
$${Number(
data.balance || 0
).toFixed(2)}
</h3>

</div>

</div>

`;

rank++;

});

}catch(error){

console.error(
"Leaderboard Error:",
error
);

}

}

/* =========================
TOURNAMENT WINNERS
========================= */

async function loadWinners(){

try{

const q =
query(
collection(db,"tournaments"),
where(
"status",
"==",
"Completed"
)
);

const snapshot =
await getDocs(q);

winnerList.innerHTML = "";

if(snapshot.empty){

winnerList.innerHTML = `

<div class="player">

<div>

<h3>
No Winners Yet
</h3>

</div>

</div>

`;

return;

}

snapshot.forEach(docSnap=>{

const data =
docSnap.data();

winnerList.innerHTML += `

<div class="player">

<div>

<h3>
${data.title}
</h3>

<p>
Winner:
${data.winner || "Unknown"}
</p>

</div>

<div>

🏆

$${Number(
data.prizePool || 0
).toFixed(2)}

</div>

</div>

`;

});

}catch(error){

console.error(
"Winners Error:",
error
);

}

}

/* =========================
INIT
========================= */

loadLeaderboard();

loadWinners();

