import { auth, db } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
doc,
getDoc,
updateDoc,
increment,
addDoc,
collection,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const canvas = document.getElementById("renderEngine");
const ctx = canvas.getContext("2d");

let currentUser = null;
let userBalance = 0;

let cash = 1500;
let landmarks = 0;
let playerPos = 0;
let diceValue = 1;
let rolling = false;

const tiles = [
{x:75,y:375,name:"GO"},
{x:75,y:225,name:"Neon Ave"},
{x:75,y:75,name:"Cyber St"},
{x:225,y:75,name:"Mainframe"},
{x:375,y:75,name:"Void Plaza"},
{x:525,y:75,name:"Matrix Dr"},
{x:525,y:225,name:"Chance"},
{x:525,y:375,name:"Boardwalk"}
];

onAuthStateChanged(auth, async(user)=>{

if(!user){
window.location.href="login.html";
return;
}

currentUser=user;

const snap=await getDoc(
doc(db,"users",user.uid)
);

if(snap.exists()){

userBalance=snap.data().balance || 0;

document.getElementById("walletBalance").innerText =
"$"+Number(userBalance).toFixed(2);

}

});

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

tiles.forEach(tile=>{

ctx.fillStyle="#111827";

ctx.fillRect(
tile.x-40,
tile.y-40,
80,
80
);

ctx.fillStyle="white";

ctx.fillText(
tile.name,
tile.x-20,
tile.y
);

});

const tile=tiles[playerPos];

ctx.beginPath();

ctx.arc(
tile.x,
tile.y,
15,
0,
Math.PI*2
);

ctx.fillStyle="#10b981";
ctx.fill();

requestAnimationFrame(draw);

}

draw();

window.triggerEngineCycle = async()=>{

if(rolling) return;

rolling=true;

diceValue=
Math.floor(Math.random()*6)+1;

setTimeout(async()=>{

playerPos=
(playerPos+diceValue)
% tiles.length;

const reward =
Math.floor(Math.random()*50)+10;

cash+=reward;

document.getElementById("stat-cash").innerText =
cash;

document.getElementById("stat-landmarks").innerText =
++landmarks;

await updateDoc(
doc(db,"users",currentUser.uid),
{
balance:increment(reward),
xp:increment(25)
}
);

await addDoc(
collection(db,"transactions"),
{
userId:currentUser.uid,
type:"Tycoon Reward",
amount:reward,
status:"completed",
createdAt:serverTimestamp()
}
);

document.getElementById("walletBalance").innerText =
"$"+(userBalance+=reward).toFixed(2);

document.getElementById("action-feed").innerHTML =
`> You rolled ${diceValue} and earned $${reward}<br>`
+
document.getElementById("action-feed").innerHTML;

rolling=false;

},1000);

};