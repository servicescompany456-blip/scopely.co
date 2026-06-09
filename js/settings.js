import { auth, db } from "./firebase.js";

import {
onAuthStateChanged,
updatePassword,
deleteUser
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
doc,
getDoc,
updateDoc,
deleteDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const usernameInput =
document.getElementById("username");

const emailInput =
document.getElementById("email");

const notificationToggle =
document.getElementById("notificationToggle");

const balance =
document.getElementById("balance");

const xp =
document.getElementById("xp");

const level =
document.getElementById("level");

const saveProfile =
document.getElementById("saveProfile");

const changePassword =
document.getElementById("changePassword");

const newPassword =
document.getElementById("newPassword");

const deleteAccount =
document.getElementById("deleteAccount");

let currentUser = null;

/* LOAD USER */

onAuthStateChanged(auth,
async(user)=>{

if(!user){

window.location.href =
"login.html";

return;

}

currentUser = user;

loadUser();

});

async function loadUser(){

const userRef =
doc(
db,
"users",
currentUser.uid
);

const snap =
await getDoc(userRef);

if(!snap.exists()) return;

const data =
snap.data();

usernameInput.value =
data.username || "";

emailInput.value =
data.email || "";

notificationToggle.checked =
data.notifications ?? true;

balance.textContent =
Number(
data.balance || 0
).toFixed(2);

xp.textContent =
data.xp || 0;

level.textContent =
Math.floor(
(data.xp || 0)/100
)+1;

}

/* SAVE PROFILE */

saveProfile.addEventListener(
"click",
async()=>{

await updateDoc(
doc(
db,
"users",
currentUser.uid
),
{
username:
usernameInput.value,

notifications:
notificationToggle.checked
}
);

alert(
"Profile Updated"
);

}
);

/* CHANGE PASSWORD */

changePassword.addEventListener(
"click",
async()=>{

if(
!newPassword.value
) return;

try{

await updatePassword(
currentUser,
newPassword.value
);

alert(
"Password Updated"
);

newPassword.value = "";

}catch(error){

alert(
error.message
);

}

}
);

/* DELETE ACCOUNT */

deleteAccount.addEventListener(
"click",
async()=>{

const confirmDelete =
confirm(
"Delete your account permanently?"
);

if(!confirmDelete) return;

try{

await deleteDoc(
doc(
db,
"users",
currentUser.uid
)
);

await deleteUser(
currentUser
);

window.location.href =
"index.html";

}catch(error){

alert(
error.message
);

}

}
);
