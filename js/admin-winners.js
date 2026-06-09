import { db }
from "./firebase.js";

import {
collection,
getDocs,
query,
where,
doc,
getDoc,
updateDoc,
increment,
addDoc,
serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const tournamentSelect =
document.getElementById(
"tournamentSelect"
);

const playersList =
document.getElementById(
"playersList"
);

/* LOAD TOURNAMENTS */

async function loadTournaments(){

const snapshot =
await getDocs(
collection(
db,
"tournaments"
)
);

snapshot.forEach(docSnap=>{

const data =
docSnap.data();

tournamentSelect.innerHTML += `

<option value="${data.title}">
${data.title}
</option>

`;

});

}

loadTournaments();

/* TOURNAMENT CHANGE */

tournamentSelect.addEventListener(
"change",
loadPlayers
);

async function loadPlayers(){

playersList.innerHTML = "";

const tournament =
tournamentSelect.value;

const q =
query(
collection(
db,
"tournamentParticipants"
),
where(
"tournamentTitle",
"==",
tournament
)
);

const snapshot =
await getDocs(q);

snapshot.forEach(docSnap=>{

const data =
docSnap.data();

playersList.innerHTML += `

<div class="player-card">

<div>

<h3>${data.username}</h3>

<p>${data.email}</p>

</div>

<button
onclick="selectWinner(
'${data.userId}',
'${tournament}'
)">
Select Winner
</button>

</div>

`;

});

}

/* GLOBAL FUNCTION */

window.selectWinner =
async(
userId,
tournament
)=>{

try{

const tournamentRef =
doc(
db,
"tournaments",
tournament
);

const tournamentSnap =
await getDoc(
tournamentRef
);

const tournamentData =
tournamentSnap.data();

const prize =
Number(
tournamentData.prizePool || 0
);

/* PAY WINNER */

await updateDoc(

doc(
db,
"users",
userId
),

{
balance:
increment(prize)
}

);

/* SAVE WINNER */

await addDoc(
collection(
db,
"winners"
),
{
userId,
tournament,
prize,
createdAt:
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
userId,
title:
"Tournament Winner",
message:
`You won ${tournament} and received $${prize}`,
createdAt:
serverTimestamp()
}
);

/* TRANSACTION */

await addDoc(
collection(
db,
"transactions"
),
{
userId,
type:
"Tournament Prize",
amount:
prize,
status:
"completed",
createdAt:
serverTimestamp()
}
);

/* FINISH TOURNAMENT */

await updateDoc(
tournamentRef,
{
status:
"Finished"
}
);

alert(
"Winner paid successfully."
);

}catch(error){

console.error(error);

alert(error.message);

}

};