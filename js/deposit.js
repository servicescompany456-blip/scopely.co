import { auth, db } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
addDoc,
collection,
serverTimestamp,
doc,
getDoc,
query,
where,
getDocs,
orderBy
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
ELEMENTS
========================= */

const depositForm =
document.getElementById("depositForm");

const currencySelect =
document.getElementById("currency");

const walletAddressInput =
document.getElementById("walletAddress");

const copyWalletBtn =
document.getElementById("copyWallet");

const previewImage =
document.getElementById("previewImage");

const proofInput =
document.getElementById("proof");

const statusMessage =
document.getElementById("statusMessage");

const submitBtn =
document.getElementById("submitDeposit");

const depositHistory =
document.getElementById("depositHistory");

/* =========================
PAYMENT ADDRESSES
========================= */

const walletAddresses = {

BTC:
"bc1qxxxxxxxxxxxxxxxxxxxx",

SOL:
"So11111111111111111111111111111111111111112",

USDT:
"TRC20xxxxxxxxxxxxxxxxxxxxx",

PAYPAL:
"payments@scopely.com"

};

/* =========================
SHOW ADDRESS
========================= */

currencySelect?.addEventListener(
"change",
()=>{

const currency =
currencySelect.value;

walletAddressInput.value =
walletAddresses[currency] || "";

}
);

/* =========================
COPY ADDRESS
========================= */

copyWalletBtn?.addEventListener(
"click",
()=>{

if(!walletAddressInput.value){

alert("Select payment method");

return;

}

navigator.clipboard.writeText(
walletAddressInput.value
);

alert("Address copied");

}
);

/* =========================
IMAGE PREVIEW
========================= */

proofInput?.addEventListener(
"change",
()=>{

const file =
proofInput.files[0];

if(!file) return;

const reader =
new FileReader();

reader.onload = (e)=>{

previewImage.src =
e.target.result;

previewImage.style.display =
"block";

};

reader.readAsDataURL(file);

}
);

/* =========================
CURRENT USER
========================= */

let currentUserData = null;

onAuthStateChanged(
auth,
async(user)=>{

if(!user) return;

try{

const userRef =
doc(db,"users",user.uid);

const snap =
await getDoc(userRef);

if(snap.exists()){

currentUserData =
snap.data();

loadDepositHistory(user.uid);

}

}catch(error){

console.error(error);

}

}
);

/* =========================
STATUS MESSAGE
========================= */

function showMessage(
message,
success=true
){

statusMessage.innerHTML =
message;

statusMessage.style.color =
success
? "#00d084"
: "#ff4d4d";

}

/* =========================
SUBMIT DEPOSIT
========================= */

depositForm?.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

const user =
auth.currentUser;

if(!user){

alert("Login required");

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

const txid =
document.getElementById(
"txid"
).value.trim();

const proofFile =
proofInput.files[0];

if(!currency){

showMessage(
"Select payment method",
false
);

return;

}

if(amount <= 0){

showMessage(
"Invalid amount",
false
);

return;

}

if(!txid){

showMessage(
"Transaction ID required",
false
);

return;

}

try{

submitBtn.disabled = true;

submitBtn.innerHTML =
"Submitting...";

await addDoc(
collection(db,"deposits"),
{

userId:
user.uid,

username:
currentUserData?.username || "",

email:
currentUserData?.email || "",

currency,

walletAddress:
walletAddresses[currency],

amount,

transactionId:
txid,

proofName:
proofFile
? proofFile.name
: "",

status:
"pending",

createdAt:
serverTimestamp()

}
);

await addDoc(
collection(db,"transactions"),
{

userId:
user.uid,

type:
"Deposit",

currency,

amount,

transactionId:
txid,

status:
"Pending",

createdAt:
serverTimestamp()

}
);

await addDoc(
collection(db,"notifications"),
{

userId:
user.uid,

title:
"Deposit Submitted",

message:
`Your ${currency} deposit of $${amount} is awaiting approval.`,

createdAt:
serverTimestamp()

}
);

showMessage(
"Deposit request submitted successfully"
);

depositForm.reset();

walletAddressInput.value = "";

previewImage.style.display =
"none";

loadDepositHistory(user.uid);

}
catch(error){

console.error(error);

showMessage(
error.message,
false
);

}
finally{

submitBtn.disabled = false;

submitBtn.innerHTML =
'<i class="fas fa-paper-plane"></i> Submit Deposit Request';

}

}
);

/* =========================
LOAD HISTORY
========================= */

async function loadDepositHistory(
userId
){

if(!depositHistory) return;

try{

const q =
query(
collection(db,"deposits"),
where("userId","==",userId)
);

const snapshot =
await getDocs(q);

depositHistory.innerHTML = "";

if(snapshot.empty){

depositHistory.innerHTML =
"No deposits found.";

return;

}

snapshot.forEach(docSnap=>{

const data =
docSnap.data();

depositHistory.innerHTML += `

<div class="history-item">

<h4>
${data.currency}
</h4>

<p>
Amount:
$${data.amount}
</p>

<p>
Status:
<span class="${data.status}">
${data.status}
</span>
</p>

</div>

`;

});

}
catch(error){

console.error(error);

}

}

