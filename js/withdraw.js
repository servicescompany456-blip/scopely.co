import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    addDoc,
    collection,
    serverTimestamp,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   ELEMENTS
========================= */

const withdrawForm =
document.getElementById("withdrawForm");

const walletBalance =
document.getElementById("walletBalance");

let currentUserData = null;

/* =========================
   LOAD USER DATA
========================= */

onAuthStateChanged(
auth,
async(user)=>{

if(!user){

window.location.href =
"login.html";

return;

}

try{

const userRef =
doc(db,"users",user.uid);

const userSnap =
await getDoc(userRef);

if(userSnap.exists()){

currentUserData =
userSnap.data();

if(walletBalance){

walletBalance.textContent =
Number(
currentUserData.balance || 0
).toFixed(2);

}

}

}catch(error){

console.error(error);

}

});

/* =========================
   WITHDRAW REQUEST
========================= */

if(withdrawForm){

withdrawForm.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

const user =
auth.currentUser;

if(!user){

alert(
"Please login first."
);

return;

}

const currency =
document.getElementById(
"currency"
).value;

const amount =
Number(
document.getElementById(
"amount"
).value
);

const walletAddress =
document.getElementById(
"walletAddress"
).value.trim();

const note =
document.getElementById(
"note"
)?.value || "";

if(!currency){

alert(
"Select withdrawal method."
);

return;

}

if(amount <= 0){

alert(
"Enter valid amount."
);

return;

}

if(!walletAddress){

alert(
"Enter wallet address."
);

return;

}

try{

const userRef =
doc(
db,
"users",
user.uid
);

const userSnap =
await getDoc(userRef);

if(!userSnap.exists()){

alert(
"User account not found."
);

return;

}

const userData =
userSnap.data();

const currentBalance =
Number(
userData.balance || 0
);

if(currentBalance < amount){

alert(
"Insufficient wallet balance."
);

return;

}

/* =========================
   SAVE WITHDRAWAL
========================= */

await addDoc(
collection(
db,
"withdrawals"
),
{

userId:
user.uid,

username:
userData.username || "",

email:
userData.email || "",

currency,

amount,

walletAddress,

note,

status:
"pending",

createdAt:
serverTimestamp()

}
);

/* =========================
   SAVE TRANSACTION
========================= */

await addDoc(
collection(
db,
"transactions"
),
{

userId:
user.uid,

type:
"Withdrawal",

currency,

amount,

walletAddress,

status:
"Pending",

createdAt:
serverTimestamp()

}
);

/* =========================
   USER NOTIFICATION
========================= */

await addDoc(
collection(
db,
"notifications"
),
{

userId:
user.uid,

title:
"Withdrawal Submitted",

message:
`Your ${currency} withdrawal request of $${amount} has been submitted and is awaiting admin approval.`,

createdAt:
serverTimestamp()

}
);

alert(
"Withdrawal request submitted successfully."
);

withdrawForm.reset();

}catch(error){

console.error(error);

alert(
error.message
);

}

});
}

/* =========================
   LIVE CRYPTO PRICES
========================= */

async function loadPrices(){

try{

const response =
await fetch(
"https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,solana,tether&vs_currencies=usd&include_24hr_change=true"
);

const data =
await response.json();

if(document.getElementById("btcPrice")){

document.getElementById("btcPrice").textContent =
"$" + data.bitcoin.usd;

}

if(document.getElementById("solPrice")){

document.getElementById("solPrice").textContent =
"$" + data.solana.usd;

}

if(document.getElementById("usdtPrice")){

document.getElementById("usdtPrice").textContent =
"$" + data.tether.usd;

}

}catch(error){

console.error(
"Price loading error:",
error
);

}

}

/* =========================
   START
========================= */

loadPrices();

setInterval(
loadPrices,
60000
);

