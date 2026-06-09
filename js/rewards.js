import { auth, db } from "./firebase.js";

import {
doc,
getDoc,
updateDoc,
arrayUnion,
collection,
addDoc,
serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const dailyRewardBtn =
document.getElementById("dailyRewardBtn");

const xpDisplay =
document.getElementById("xpDisplay");

const levelDisplay =
document.getElementById("levelDisplay");

const rewardBalance =
document.getElementById("rewardBalance");

const rewardHistory =
document.getElementById("rewardHistory");

const referralLink =
document.getElementById("referralLink");

const copyReferral =
document.getElementById("copyReferral");

let currentUserData = null;

/* =========================
   AUTH CHECK
========================= */

auth.onAuthStateChanged(async(user)=>{

if(!user){

window.location.href =
"login.html";

return;

}

const userRef =
doc(db,"users",user.uid);

const snap =
await getDoc(userRef);

if(!snap.exists()) return;

currentUserData =
snap.data();

xpDisplay.textContent =
`${currentUserData.xp || 0} XP`;

levelDisplay.textContent =
`Level ${currentUserData.level || 1}`;

rewardBalance.textContent =
`$${currentUserData.balance || 0}`;

referralLink.value =
`${window.location.origin}/register.html?ref=${user.uid}`;

loadRewardHistory();

});

/* =========================
   DAILY REWARD
========================= */

dailyRewardBtn.addEventListener(
"click",
async()=>{

const user =
auth.currentUser;

if(!user) return;

const userRef =
doc(db,"users",user.uid);

const snap =
await getDoc(userRef);

const data =
snap.data();

const today =
new Date().toDateString();

if(
data.lastRewardDate === today
){

alert(
"You already claimed today's reward."
);

return;

}

let xp =
(data.xp || 0) + 100;

let level =
data.level || 1;

let balance =
data.balance || 0;

/* LEVEL REWARDS */

let rewardAmount = 0;

if(xp >= 100 && level < 2){

level = 2;
rewardAmount = 20;

}
else if(xp >= 250 && level < 3){

level = 3;
rewardAmount = 50;

}
else if(xp >= 500 && level < 4){

level = 4;
rewardAmount = 100;

}
else if(xp >= 1000 && level < 5){

level = 5;
rewardAmount = 250;

}

balance += rewardAmount;

await updateDoc(userRef,{

xp: xp,

level: level,

balance: balance,

lastRewardDate: today,

rewardHistory: arrayUnion(

`Daily Reward +100 XP`

)

});

/* TRANSACTION */

await addDoc(
collection(db,"transactions"),
{

userId:user.uid,

type:"Daily Reward",

amount:rewardAmount,

createdAt:
serverTimestamp()

}
);

/* NOTIFICATION */

await addDoc(
collection(db,"notifications"),
{

userId:user.uid,

title:"Reward Claimed",

message:
`You received +100 XP and $${rewardAmount}`,

createdAt:
serverTimestamp()

}
);

alert(
`Reward Claimed!

+100 XP

+$${rewardAmount}`
);

location.reload();

});

/* =========================
   REWARD HISTORY
========================= */

function loadRewardHistory(){

if(
!currentUserData ||
!rewardHistory
) return;

const history =
currentUserData.rewardHistory || [];

if(history.length === 0){

rewardHistory.innerHTML =
"No rewards claimed yet.";

return;

}

rewardHistory.innerHTML = "";

history.forEach(item=>{

rewardHistory.innerHTML += `

<div class="reward-item">

${item}

</div>

`;

});

}

/* =========================
   COPY REFERRAL LINK
========================= */

copyReferral.addEventListener(
"click",
()=>{

navigator.clipboard.writeText(
referralLink.value
);

alert(
"Referral Link Copied"
);

});