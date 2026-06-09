import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    increment,
    addDoc,
    collection,
    serverTimestamp,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUser = null;

/* =========================
AUTH CHECK
========================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    console.log("Logged in:", user.email);

    await loadUserBalance();

});

/* =========================
LOAD USER BALANCE
========================= */

async function loadUserBalance() {

    try {

        if (!currentUser) return;

        const userRef = doc(
            db,
            "users",
            currentUser.uid
        );

        const userSnap =
            await getDoc(userRef);

        if (!userSnap.exists()) {
            console.log("User document not found");
            return;
        }

        const userData =
            userSnap.data();

        const balanceElement =
            document.getElementById("userBalance");

        if (balanceElement) {

            balanceElement.textContent =
                Number(
                    userData.balance || 0
                ).toFixed(2);

        }

    } catch (error) {

        console.error(
            "Balance Load Error:",
            error
        );

    }

}

/* =========================
JOIN TOURNAMENT
========================= */

window.joinTournament = async (
    tournamentName,
    entryFee
) => {

    if (!currentUser) {

        alert("Please login first.");
        return;

    }

    try {

        const fee = Number(entryFee);

        const userRef = doc(
            db,
            "users",
            currentUser.uid
        );

        const userSnap =
            await getDoc(userRef);

        if (!userSnap.exists()) {

            alert("User account not found.");
            return;

        }

        const userData =
            userSnap.data();

        const balance =
            Number(
                userData.balance || 0
            );

        /* CHECK BALANCE */

        if (balance < fee) {

            alert(
                `Insufficient balance.\nYou need $${fee} to join this tournament.`
            );

            return;

        }

        /* CHECK IF ALREADY JOINED */

        const joinedQuery =
            query(
                collection(
                    db,
                    "tournamentParticipants"
                ),
                where(
                    "userId",
                    "==",
                    currentUser.uid
                ),
                where(
                    "tournamentTitle",
                    "==",
                    tournamentName
                )
            );

        const joinedSnap =
            await getDocs(joinedQuery);

        if (!joinedSnap.empty) {

            window.location.href =
                `room.html?tournament=${encodeURIComponent(tournamentName)}`;

            return;

        }

        /* DEDUCT WALLET */

        await updateDoc(
            userRef,
            {
                balance:
                    balance - fee,

                tournamentsJoined:
                    increment(1),

                xp:
                    increment(50)
            }
        );

        /* SAVE PARTICIPANT */

        await addDoc(
            collection(
                db,
                "tournamentParticipants"
            ),
            {
                userId:
                    currentUser.uid,

                username:
                    userData.username || "Player",

                email:
                    userData.email || "",

                tournamentTitle:
                    tournamentName,

                entryFee:
                    fee,

                joinedAt:
                    serverTimestamp()
            }
        );

        /* SAVE TRANSACTION */

        await addDoc(
            collection(
                db,
                "transactions"
            ),
            {
                userId:
                    currentUser.uid,

                type:
                    "Tournament Entry",

                amount:
                    fee,

                status:
                    "completed",

                tournament:
                    tournamentName,

                createdAt:
                    serverTimestamp()
            }
        );

        /* SAVE NOTIFICATION */

        await addDoc(
            collection(
                db,
                "notifications"
            ),
            {
                userId:
                    currentUser.uid,

                title:
                    "Tournament Joined",

                message:
                    `You joined ${tournamentName} successfully. Entry fee: $${fee}.`,

                createdAt:
                    serverTimestamp()
            }
        );

        await loadUserBalance();

        alert(
            `Successfully joined ${tournamentName}\n\n$${fee} has been deducted from your wallet.`
        );

        /* REDIRECT TO ROOM */

        window.location.href =
            `room.html?tournament=${encodeURIComponent(tournamentName)}`;

    } catch (error) {

        console.error(
            "Tournament Error:",
            error
        );

        alert(
            "Error: " + error.message
        );

    }

};

/* =========================
CHECK ROOM ACCESS
========================= */

window.canAccessRoom = async (
    tournamentName
) => {

    if (!currentUser) {

        alert("Please login first.");
        return;

    }

    try {

        const joinedQuery =
            query(
                collection(
                    db,
                    "tournamentParticipants"
                ),
                where(
                    "userId",
                    "==",
                    currentUser.uid
                ),
                where(
                    "tournamentTitle",
                    "==",
                    tournamentName
                )
            );

        const joinedSnap =
            await getDocs(joinedQuery);

        if (joinedSnap.empty) {

            alert(
                "You must join this tournament before entering the room."
            );

            return;

        }

        window.location.href =
            `room.html?tournament=${encodeURIComponent(tournamentName)}`;

    } catch (error) {

        console.error(error);

    }

};