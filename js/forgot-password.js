import { auth }
from "./firebase.js";

import {
sendPasswordResetEmail
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const resetBtn =
document.getElementById(
"resetBtn"
);

const email =
document.getElementById(
"email"
);

resetBtn.addEventListener(
"click",
async()=>{

const userEmail =
email.value.trim();

if(!userEmail){

alert(
"Enter your email."
);

return;

}

try{

await sendPasswordResetEmail(
auth,
userEmail
);

alert(
"Password reset link sent successfully. Check your email."
);

window.location.href =
"login.html";

}catch(error){

console.error(error);

alert(
error.message
);

}

});