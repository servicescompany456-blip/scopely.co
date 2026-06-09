import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    getDoc,
    deleteDoc,
    serverTimestamp,
    query,
    where,
    increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   ELEMENTS
========================= */

const createBtn =
document.getElementById("createTournament");

const tournamentList =
document.getElementById("tournamentList");

const totalTournaments =
document.getElementById("totalTournaments");

const totalPlayers =
document.getElementById("totalPlayers");

const totalPrizePool =
document.getElementById("totalPrizePool");

/* =========================
   ADMIN AUTH CHECK
========================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    try {

        const userRef =
        doc(db, "users", user.uid);

        const userSnap =
        await getDoc(userRef);

        if (!userSnap.exists()) {

            window.location.href =
            "dashboard.html";

            return;

        }

        const userData =
        userSnap.data();

        if (userData.role !== "admin") {

            alert("Access Denied");

            window.location.href =
            "dashboard.html";

            return;

        }

        loadTournaments();
        loadStats();

    } catch (error) {

        console.error(error);

    }

});

/* =========================
   CREATE TOURNAMENT
========================= */

if (createBtn) {

    createBtn.addEventListener(
        "click",
        createTournament
    );

}

async function createTournament() {

    try {

        const title =
        document.getElementById("title")
        .value.trim();

        const entryFee =
        Number(
            document.getElementById("entryFee")
            .value
        );

        const prizePool =
        Number(
            document.getElementById("prizePool")
            .value
        );

        const maxPlayers =
        Number(
            document.getElementById("maxPlayers")
            .value
        );

        const startTime =
        document.getElementById("startTime")
        .value;

        const status =
        document.getElementById("status")
        .value;

        if (
            !title ||
            !entryFee ||
            !prizePool ||
            !maxPlayers ||
            !startTime
        ) {

            alert("Please fill all fields");
            return;

        }

        await addDoc(
            collection(db, "tournaments"),
            {
                title,
                entryFee,
                prizePool,
                maxPlayers,
                joinedPlayers: 0,
                status,
                winner: "",
                startTime: new Date(startTime),
                createdAt: serverTimestamp()
            }
        );

        alert(
            "Tournament Created Successfully"
        );

        location.reload();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}

/* =========================
   LOAD STATS
========================= */

async function loadStats() {

    try {

        const tournamentsSnap =
        await getDocs(
            collection(
                db,
                "tournaments"
            )
        );

        const participantsSnap =
        await getDocs(
            collection(
                db,
                "tournamentParticipants"
            )
        );

        let pool = 0;

        tournamentsSnap.forEach(docSnap => {

            const data =
            docSnap.data();

            pool += Number(
                data.prizePool || 0
            );

        });

        if (totalTournaments) {

            totalTournaments.textContent =
            tournamentsSnap.size;

        }

        if (totalPlayers) {

            totalPlayers.textContent =
            participantsSnap.size;

        }

        if (totalPrizePool) {

            totalPrizePool.textContent =
            "$" + pool.toFixed(2);

        }

    } catch (error) {

        console.error(error);

    }

}

/* =========================
   LOAD TOURNAMENTS
========================= */

async function loadTournaments() {

    try {

        const snapshot =
        await getDocs(
            collection(
                db,
                "tournaments"
            )
        );

        tournamentList.innerHTML = "";

        snapshot.forEach(docSnap => {

            const data =
            docSnap.data();

            tournamentList.innerHTML += `

            <div class="tournament-item">

                <h3>${data.title}</h3>

                <p>
                    Prize Pool:
                    $${data.prizePool}
                </p>

                <p>
                    Entry Fee:
                    $${data.entryFee}
                </p>

                <p>
                    Players:
                    ${data.joinedPlayers || 0}
                    /
                    ${data.maxPlayers || 0}
                </p>

                <p>
                    Status:
                    ${data.status}
                </p>

                <p>
                    Winner:
                    ${data.winner || "None"}
                </p>

                <button onclick="startTournament('${docSnap.id}')">
                    Start
                </button>

                <button onclick="endTournament('${docSnap.id}')">
                    End
                </button>

                <button onclick="pickWinner('${docSnap.id}')">
                    Pick Winner
                </button>

                <button onclick="deleteTournament('${docSnap.id}')">
                    Delete
                </button>

            </div>

            `;

        });

    } catch (error) {

        console.error(error);

    }

}

/* =========================
   START TOURNAMENT
========================= */

window.startTournament = async (id) => {

    try {

        await updateDoc(
            doc(
                db,
                "tournaments",
                id
            ),
            {
                status: "LIVE"
            }
        );

        location.reload();

    } catch (error) {

        console.error(error);

    }

};

/* =========================
   END TOURNAMENT
========================= */

window.endTournament = async (id) => {

    try {

        await updateDoc(
            doc(
                db,
                "tournaments",
                id
            ),
            {
                status: "FINISHED"
            }
        );

        location.reload();

    } catch (error) {

        console.error(error);

    }

};

/* =========================
   DELETE TOURNAMENT
========================= */

window.deleteTournament = async (id) => {

    const confirmDelete =
    confirm(
        "Delete Tournament?"
    );

    if (!confirmDelete) return;

    try {

        await deleteDoc(
            doc(
                db,
                "tournaments",
                id
            )
        );

        location.reload();

    } catch (error) {

        console.error(error);

    }

};

/* =========================
   PICK WINNER
========================= */

window.pickWinner = async (tournamentId) => {

    try {

        const tournamentRef =
        doc(
            db,
            "tournaments",
            tournamentId
        );

        const tournamentSnap =
        await getDoc(
            tournamentRef
        );

        if (!tournamentSnap.exists()) {

            alert(
                "Tournament not found"
            );

            return;

        }

        const tournamentData =
        tournamentSnap.data();

        const participantsQuery =
        query(
            collection(
                db,
                "tournamentParticipants"
            ),
            where(
                "tournamentTitle",
                "==",
                tournamentData.title
            )
        );

        const participants =
        await getDocs(
            participantsQuery
        );

        if (participants.empty) {

            alert(
                "No participants found"
            );

            return;

        }

        const players =
        participants.docs;

        const winnerDoc =
        players[
            Math.floor(
                Math.random() *
                players.length
            )
        ];

        const winner =
        winnerDoc.data();

        await updateDoc(
            doc(
                db,
                "users",
                winner.userId
            ),
            {
                balance: increment(
                    Number(
                        tournamentData.prizePool
                    )
                ),

                xp: increment(500)
            }
        );

        await addDoc(
            collection(
                db,
                "transactions"
            ),
            {
                userId:
                winner.userId,

                type:
                "Tournament Prize",

                amount:
                tournamentData.prizePool,

                status:
                "completed",

                createdAt:
                serverTimestamp()
            }
        );

        await addDoc(
            collection(
                db,
                "notifications"
            ),
            {
                userId:
                winner.userId,

                title:
                "Tournament Winner",

                message:
                `You won ${tournamentData.title} and received $${tournamentData.prizePool}.`,

                createdAt:
                serverTimestamp()
            }
        );

        await addDoc(
            collection(
                db,
                "winners"
            ),
            {
                username:
                winner.username,

                tournament:
                tournamentData.title,

                prize:
                tournamentData.prizePool,

                createdAt:
                serverTimestamp()
            }
        );

        await updateDoc(
            tournamentRef,
            {
                winner:
                winner.username,

                status:
                "FINISHED"
            }
        );

        alert(
            `Winner Selected: ${winner.username}`
        );

        location.reload();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

};
