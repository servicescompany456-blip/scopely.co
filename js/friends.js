import { auth, db }
from "./firebase.js";

import {
addDoc,
collection,
serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document
.getElementById(
"addFriendBtn"
)
.addEventListener(
"click",
async()=>{

const friendId =
document.getElementById(
"friendId"
).value;

const user =
auth.currentUser;

if(!user) return;

await addDoc(
collection(db,"friends"),
{
senderId:user.uid,

receiverId:friendId,

status:"pending",

createdAt:
serverTimestamp()
}
);

alert(
"Friend Request Sent"
);

});