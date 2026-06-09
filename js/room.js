import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp,
    onSnapshot,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   URL PARAMS
========================= */

const params = new URLSearchParams(window.location.search);

const tournament = params.get("tournament");

/* =========================
   ELEMENTS
========================= */

const roomTitle = document.getElementById("roomTitle");

const playersList = document.getElementById("playersList");

const chatBox = document.getElementById("chatMessages");

const sendBtn = document.getElementById("sendMessage");

const chatInput = document.getElementById("chatInput");

const playerCount =
document.getElementById("playerCount");

const prizePool =
document.getElementById("prizePool");

const matchStatus =
document.getElementById("matchStatus");

const countdown =
document.getElementById("countdown");

/* =========================
   SET ROOM TITLE
========================= */

if (roomTitle && tournament) {

    roomTitle.textContent =
    `${tournament} Room`;

}

/* =========================
   AUTH CHECK
========================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
        "login.html";

        return;

    }

    try {

        const participantQuery = query(
            collection(
                db,
                "tournamentParticipants"
            ),
            where(
                "userId",
                "==",
                user.uid
            ),
            where(
                "tournamentTitle",
                "==",
                tournament
            )
        );

        const participantSnap =
        await getDocs(
            participantQuery
        );

        if (participantSnap.empty) {

            alert(
                "You have not joined this tournament."
            );

            window.location.href =
            "tournaments.html";

            return;

        }

        await loadPlayers();

        await loadTournamentInfo();

        loadChat();

    } catch (error) {

        console.error(error);

    }

});

/* =========================
   LOAD PLAYERS
========================= */

async function loadPlayers() {

    try {

        const q = query(
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

        if (!playersList) return;

        playersList.innerHTML = "";

        if(playerCount){

            playerCount.textContent =
            snapshot.size;

        }

        snapshot.forEach((docSnap) => {

            const data =
            docSnap.data();

            playersList.innerHTML += `

            <div class="player">

                <h3>
                    ${data.username || "Player"}
                </h3>

            </div>

            `;

        });

    } catch (error) {

        console.error(error);

    }

}

/* =========================
   TOURNAMENT INFO
========================= */

async function loadTournamentInfo(){

    try{

        const tournamentRef =
        doc(
            db,
            "tournaments",
            tournament
        );

        const snap =
        await getDoc(
            tournamentRef
        );

        if(!snap.exists()){

            console.log(
                "Tournament not found"
            );

            return;

        }

        const data =
        snap.data();

        if(matchStatus){

            matchStatus.textContent =
            data.status || "Waiting";

        }

        if(prizePool){

            prizePool.textContent =
            "$" +
            (data.prizePool || 0);

        }

        if(
            data.startTime &&
            countdown
        ){

            startCountdown(
                data.startTime.toDate()
            );

        }

    }catch(error){

        console.error(error);

    }

}

/* =========================
   COUNTDOWN TIMER
========================= */

function startCountdown(startDate){

    setInterval(()=>{

        const now =
        new Date().getTime();

        const distance =
        startDate.getTime() - now;

        if(distance <= 0){

            countdown.textContent =
            "Started";

            return;

        }

        const hours =
        Math.floor(
            (distance %
            (1000*60*60*24))
            /
            (1000*60*60)
        );

        const minutes =
        Math.floor(
            (distance %
            (1000*60*60))
            /
            (1000*60)
        );

        const seconds =
        Math.floor(
            (distance %
            (1000*60))
            /
            1000
        );

        countdown.textContent =
        `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;

    },1000);

}

/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    const message =
    chatInput.value.trim();

    if (!message) return;

    try {

        const participantQuery =
        query(
            collection(
                db,
                "tournamentParticipants"
            ),
            where(
                "userId",
                "==",
                auth.currentUser.uid
            ),
            where(
                "tournamentTitle",
                "==",
                tournament
            )
        );

        const participantSnap =
        await getDocs(
            participantQuery
        );

        let username =
        "Player";

        if (
            !participantSnap.empty
        ) {

            username =
            participantSnap.docs[0]
            .data()
            .username ||
            "Player";

        }

        await addDoc(
            collection(
                db,
                "roomChats"
            ),
            {

                tournament,

                userId:
                auth.currentUser.uid,

                username,

                message,

                createdAt:
                serverTimestamp()

            }
        );

        chatInput.value = "";

    } catch (error) {

        console.error(
            "CHAT ERROR:",
            error
        );

        alert(
            error.message
        );

    }

}

/* =========================
   SEND BUTTON
========================= */

if(sendBtn){

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}

/* =========================
   ENTER KEY SEND
========================= */

if(chatInput){

    chatInput.addEventListener(
        "keypress",
        (e)=>{

            if(
                e.key === "Enter"
            ){

                sendMessage();

            }

        }
    );

}

/* =========================
   REAL TIME CHAT
========================= */

function loadChat(){

    const q =
    query(
        collection(
            db,
            "roomChats"
        ),
        where(
            "tournament",
            "==",
            tournament
        )
    );

    onSnapshot(
        q,
        (snapshot)=>{

            if(!chatBox) return;

            chatBox.innerHTML = "";

            snapshot.forEach(
                (docSnap)=>{

                const data =
                docSnap.data();

                chatBox.innerHTML += `

                <div class="chat-message">

                    <h4>
                        ${data.username}
                    </h4>

                    <p>
                        ${data.message}
                    </p>

                </div>

                `;

            });

            chatBox.scrollTop =
            chatBox.scrollHeight;

        }
    );

}