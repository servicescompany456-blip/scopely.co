import { db } from "./firebase.js";

import {
addDoc,
collection,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function createDefaultTournaments() {

const tournaments = [

{
title:"Monopoly Classic",
prizePool:500,
entryFee:10,
maxPlayers:50,
currentPlayers:0,
status:"open"
},

{
title:"Monopoly GO!",
prizePool:1000,
entryFee:20,
maxPlayers:100,
currentPlayers:0,
status:"open"
},

{
title:"Monopoly Empire",
prizePool:2500,
entryFee:50,
maxPlayers:150,
currentPlayers:0,
status:"open"
},

{
title:"Monopoly Mega Edition",
prizePool:5000,
entryFee:100,
maxPlayers:200,
currentPlayers:0,
status:"open"
},

{
title:"SCOPELY Championship",
prizePool:10000,
entryFee:250,
maxPlayers:500,
currentPlayers:0,
status:"open"
}

];

for(const tournament of tournaments){

await addDoc(
collection(db,"tournaments"),
{
...tournament,
createdAt:serverTimestamp()
}
);

}

alert("Tournaments Created");

}

window.createDefaultTournaments =
createDefaultTournaments;