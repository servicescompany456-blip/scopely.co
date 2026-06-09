import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const notificationList =
document.getElementById("notificationList");

/* =========================
   LOAD NOTIFICATIONS
========================= */

onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location.href =
"login.html";

return;

}

try{

const q = query(
collection(db,"notifications"),
where("userId","==",user.uid)
);

const snapshot =
await getDocs(q);

notificationList.innerHTML = "";

if(snapshot.empty){

notificationList.innerHTML = `

<div class="notification-card">

<h3>
No Notifications
</h3>

<p>
You don't have any notifications yet.
</p>

</div>

`;

return;

}

/* STORE NOTIFICATIONS */

const notifications = [];

snapshot.forEach((docSnap)=>{

const data = docSnap.data();

notifications.push(data);

});

/* SORT NEWEST FIRST */

notifications.sort((a,b)=>{

const aTime =
a.createdAt?.seconds || 0;

const bTime =
b.createdAt?.seconds || 0;

return bTime - aTime;

});

/* DISPLAY */

notifications.forEach((data)=>{

const title =
data.title || "Notification";

const message =
data.message || "";

const date =
data.createdAt
? new Date(
data.createdAt.seconds * 1000
).toLocaleString()
: "Just now";

notificationList.innerHTML += `

<div class="notification-card">

<h3>
${title}
</h3>

<p>
${message}
</p>

<small>
${date}
</small>

</div>

`;

});

}catch(error){

console.error(error);

notificationList.innerHTML = `

<div class="notification-card">

<h3>
Error Loading Notifications
</h3>

<p>
${error.message}
</p>

</div>

`;

}

});