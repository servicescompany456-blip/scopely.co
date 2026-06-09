import { db }
from "./firebase.js";

import {
doc,
setDoc,
Timestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form =
document.getElementById(
"tournamentForm"
);

const successMsg =
document.getElementById(
"successMsg"
);

form.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

try{

const title =
document.getElementById(
"title"
).value;

const entryFee =
Number(
document.getElementById(
"entryFee"
).value
);

const prizePool =
Number(
document.getElementById(
"prizePool"
).value
);

const startTime =
document.getElementById(
"startTime"
).value;

const status =
document.getElementById(
"status"
).value;

await setDoc(

doc(
db,
"tournaments",
title
),

{

title,

entryFee,

prizePool,

status,

joinedPlayers:0,

maxPlayers:100,

startTime:
Timestamp.fromDate(
new Date(startTime)
)

}

);

successMsg.textContent =
"Tournament Created Successfully";

form.reset();

}catch(error){

console.error(error);

alert(error.message);

}

});