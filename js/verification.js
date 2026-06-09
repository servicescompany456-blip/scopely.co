import { auth }
from "./firebase.js";

import {
onAuthStateChanged,
sendEmailVerification
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const checkBtn =
document.getElementById(
"checkBtn"
);

const resendBtn =
document.getElementById(
"resendBtn"
);

let currentUser = null;

/* =========================
AUTH CHECK
========================= */

onAuthStateChanged(
auth,
(user)=>{

if(!user){

window.location.href =
"login.html";

return;

}

currentUser = user;

}
);

/* =========================
CHECK VERIFICATION
========================= */

checkBtn.addEventListener(
"click",
async()=>{

await currentUser.reload();

if(currentUser.emailVerified){

alert(
"Email Verified Successfully"
);

window.location.href =
"dashboard.html";

}else{

alert(
"Your email is not verified yet."
);

}

}
);

/* =========================
RESEND EMAIL
========================= */

resendBtn.addEventListener(
"click",
async()=>{

try{

await sendEmailVerification(
currentUser
);

alert(
"Verification email sent again."
);

}catch(error){

alert(
error.message
);

}

}
);