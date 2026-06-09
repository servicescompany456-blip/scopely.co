import { auth, db }
from "./firebase.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
doc,
getDoc,
updateDoc,
increment,
addDoc,
collection,
serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const wheel =
document.getElementById("wheel");

const spinBtn =
document.getElementById("spinBtn");

const result =
document.getElementById("result");

const logs =
document.getElementById("logs");

let currentUser;
let balance = 0;

const rewards = [

0,
2,
5,
10,
20,
50,
100,
-1

];

onAuthStateChanged(
auth,
async(user)=>{

if(!user){

location.href="login.html";
return;

}

currentUser=user;

const userRef=
doc(db,"users",user.uid);

const snap=
await getDoc(userRef);

const data=
snap.data();

balance=
Number(data.balance||0);

document.getElementById(
"balance"
).textContent=
balance.toFixed(2);

document.getElementById(
"statBalance"
).textContent=
balance.toFixed(2);

document.getElementById(
"xp"
).textContent=
data.xp||0;

document.getElementById(
"level"
).textContent=
Math.floor(
(data.xp||0)/500
)+1;

});

spinBtn.onclick =
async()=>{

if(balance < 1){

alert(
"Insufficient balance"
);

return;

}

spinBtn.disabled=true;

const rotation =
3600 +
Math.floor(
Math.random()*360
);

wheel.style.transform=
`rotate(${rotation}deg)`;

const reward =
rewards[
Math.floor(
Math.random()*rewards.length
)
];

setTimeout(
async()=>{

const userRef=
doc(
db,
"users",
currentUser.uid
);

if(reward===-1){

await updateDoc(
userRef,
{
balance:
increment(-1),
xp:
increment(10)
}
);

result.innerHTML=
"You Lost";

logs.innerHTML=
"> Spin Result: Lose<br>"
+ logs.innerHTML;

}else{

await updateDoc(
userRef,
{
balance:
increment(reward-1),
xp:
increment(50)
}
);

await addDoc(
collection(
db,
"transactions"
),
{
userId:
currentUser.uid,

type:
"Lucky Spin",

amount:
reward,

status:
"completed",

createdAt:
serverTimestamp()
}
);

result.innerHTML=
`You Won $${reward}`;

logs.innerHTML=
`> Won $${reward}<br>`
+ logs.innerHTML;

}

location.reload();

},4000);

};