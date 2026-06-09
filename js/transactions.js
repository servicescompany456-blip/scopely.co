import { auth, db } from "./firebase.js";

import {
collection,
query,
where,
getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const transactionList =
document.getElementById("transactionList");

auth.onAuthStateChanged(async(user)=>{

if(!user){

window.location.href =
"login.html";

return;

}

const q = query(
collection(db,"transactions"),
where("userId","==",user.uid)
);

const snapshot =
await getDocs(q);

transactionList.innerHTML = "";

if(snapshot.empty){

transactionList.innerHTML =
"<p>No transactions found.</p>";

return;

}

snapshot.forEach((doc)=>{

const data = doc.data();

transactionList.innerHTML += `

<div class="transaction-card">

<h3>
${data.type.toUpperCase()}
</h3>

<p>
Amount:
$${data.amount}
</p>

<p>
Currency:
${data.currency}
</p>

<p class="status ${data.status}">
Status:
${data.status.toUpperCase()}
</p>

</div>

`;

});

});