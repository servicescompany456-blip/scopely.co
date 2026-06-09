import { auth, db } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
collection,
getDocs,
doc,
getDoc,
updateDoc,
query,
where,
addDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
ELEMENTS
========================= */

const withdrawalsList =
document.getElementById("withdrawalsList");

const totalRequests =
document.getElementById("totalRequests");

const pendingRequests =
document.getElementById("pendingRequests");

const approvedRequests =
document.getElementById("approvedRequests");

/* =========================
ADMIN CHECK
========================= */

onAuthStateChanged(auth, async (user) => {

if (!user) {

window.location.href = "login.html";
return;

}

try {

const userRef =
doc(db, "users", user.uid);

const userSnap =
await getDoc(userRef);

if (!userSnap.exists()) {

window.location.href = "dashboard.html";
return;

}

const userData =
userSnap.data();

if (userData.role !== "admin") {

alert("Access Denied");

window.location.href =
"dashboard.html";

return;

}

loadWithdrawals();

} catch (error) {

console.error(error);

}

});

/* =========================
LOAD WITHDRAWALS
========================= */

async function loadWithdrawals() {

try {

const q =
query(
collection(db, "transactions"),
where("type", "==", "withdraw")
);

const snapshot =
await getDocs(q);

withdrawalsList.innerHTML = "";

let total = 0;
let pending = 0;
let approved = 0;

for (const docSnap of snapshot.docs) {

const data = docSnap.data();

total++;

if (data.status === "pending") {
pending++;
}

if (data.status === "approved") {
approved++;
}

/* GET USER INFO */

let username = "Unknown User";
let email = "";

try {

const userRef =
doc(db, "users", data.userId);

const userSnap =
await getDoc(userRef);

if (userSnap.exists()) {

const userData =
userSnap.data();

username =
userData.username || "User";

email =
userData.email || "";

}

} catch (error) {

console.error(error);

}

withdrawalsList.innerHTML += `

<div class="withdrawal-item">

<h3>
${data.currency} Withdrawal
</h3>

<p>
<strong>Username:</strong>
${username}
</p>

<p>
<strong>Email:</strong>
${email}
</p>

<p>
<strong>Amount:</strong>
$${Number(data.amount).toFixed(2)}
</p>

<p>
<strong>Wallet Address:</strong>
${data.walletAddress}
</p>

<p>
<strong>Status:</strong>

<span class="${data.status}">
${data.status}
</span>

</p>

${
data.status === "pending"
?

`
<div class="actions">

<button
class="approve-btn"
onclick="approveWithdrawal('${docSnap.id}')">

Approve

</button>

<button
class="reject-btn"
onclick="rejectWithdrawal('${docSnap.id}')">

Reject

</button>

</div>
`

:

""

}

</div>

`;

}

totalRequests.textContent =
total;

pendingRequests.textContent =
pending;

approvedRequests.textContent =
approved;

} catch (error) {

console.error(error);

}

}

/* =========================
APPROVE WITHDRAWAL
========================= */

window.approveWithdrawal =
async (transactionId) => {

try {

const transactionRef =
doc(
db,
"transactions",
transactionId
);

const transactionSnap =
await getDoc(transactionRef);

if (!transactionSnap.exists()) {

alert("Transaction not found");
return;

}

const transaction =
transactionSnap.data();

const userRef =
doc(
db,
"users",
transaction.userId
);

const userSnap =
await getDoc(userRef);

if (!userSnap.exists()) {

alert("User not found");
return;

}

const userData =
userSnap.data();

const balance =
Number(
userData.balance || 0
);

if (
balance <
Number(transaction.amount)
) {

alert(
"Insufficient wallet balance"
);

return;

}

/* DEDUCT BALANCE */

await updateDoc(
userRef,
{
balance:
balance -
Number(transaction.amount)
}
);

/* UPDATE STATUS */

await updateDoc(
transactionRef,
{
status: "approved",
approvedAt:
serverTimestamp()
}
);

/* NOTIFICATION */

await addDoc(
collection(
db,
"notifications"
),
{
userId:
transaction.userId,

title:
"Withdrawal Approved",

message:
`Your withdrawal of $${transaction.amount} has been approved.`,

createdAt:
serverTimestamp()
}
);

alert(
"Withdrawal Approved Successfully"
);

loadWithdrawals();

} catch (error) {

console.error(error);

alert(error.message);

}

};

/* =========================
REJECT WITHDRAWAL
========================= */

window.rejectWithdrawal =
async (transactionId) => {

try {

const transactionRef =
doc(
db,
"transactions",
transactionId
);

const transactionSnap =
await getDoc(transactionRef);

if (!transactionSnap.exists()) {
return;
}

const transaction =
transactionSnap.data();

await updateDoc(
transactionRef,
{
status: "rejected",
rejectedAt:
serverTimestamp()
}
);

/* NOTIFICATION */

await addDoc(
collection(
db,
"notifications"
),
{
userId:
transaction.userId,

title:
"Withdrawal Rejected",

message:
"Your withdrawal request was rejected by admin.",

createdAt:
serverTimestamp()
}
);

alert(
"Withdrawal Rejected"
);

loadWithdrawals();

} catch (error) {

console.error(error);

alert(error.message);

}

};