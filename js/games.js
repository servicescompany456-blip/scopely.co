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
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
SEARCH
========================= */

const searchInput = document.getElementById("searchGame");

if (searchInput) {

  searchInput.addEventListener("keyup", () => {

    const value =
      searchInput.value.toLowerCase();

    document
      .querySelectorAll(".game-card")
      .forEach(card => {

        const title =
          card.querySelector("h3")
          .textContent
          .toLowerCase();

        card.style.display =
          title.includes(value)
          ? "block"
          : "none";

      });

  });

}

/* =========================
CURRENT USER
========================= */

let currentUser = null;
let currentBalance = 0;

/* =========================
AUTH
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href =
      "login.html";

    return;

  }

  currentUser = user;

  await loadUserData();

  await loadLeaderboard();

});

/* =========================
LOAD USER DATA
========================= */

async function loadUserData() {

  try {

    const userRef =
      doc(db, "users", currentUser.uid);

    const snap =
      await getDoc(userRef);

    if (!snap.exists()) return;

    const data =
      snap.data();

    currentBalance =
      Number(data.balance || 0);

    const balanceElement =
      document.getElementById("userBalance");

    if (balanceElement) {

      balanceElement.textContent =
        currentBalance.toFixed(2);

    }

  } catch (error) {

    console.error(error);

  }

}

/* =========================
JOIN GAME
========================= */

window.joinGame = async (
  gameName,
  entryFee
) => {

  try {

    if (!currentUser) {

      alert("Please login first");

      return;

    }

    const userRef =
      doc(db, "users", currentUser.uid);

    const userSnap =
      await getDoc(userRef);

    if (!userSnap.exists()) {

      alert("User account not found");

      return;

    }

    const userData =
      userSnap.data();

    const balance =
      Number(userData.balance || 0);

    if (balance < entryFee) {

      alert(
        "Insufficient balance. Deposit funds first."
      );

      return;

    }

    /* DEDUCT ENTRY FEE */

    await updateDoc(userRef, {

      balance:
        balance - entryFee,

      gamesPlayed:
        increment(1),

      xp:
        increment(20)

    });

    /* GAME HISTORY */

    await addDoc(
      collection(db, "gameHistory"),
      {

        userId:
          currentUser.uid,

        game:
          gameName,

        entryFee,

        playedAt:
          serverTimestamp()

      }
    );

    /* NOTIFICATION */

    await addDoc(
      collection(db, "notifications"),
      {

        userId:
          currentUser.uid,

        title:
          "Game Joined",

        message:
          `You joined ${gameName} for $${entryFee} and earned 20 XP.`,

        createdAt:
          serverTimestamp()

      }
    );

    /* TRANSACTION */

    await addDoc(
      collection(db, "transactions"),
      {

        userId:
          currentUser.uid,

        type:
          "Game Entry",

        amount:
          entryFee,

        status:
          "completed",

        game:
          gameName,

        createdAt:
          serverTimestamp()

      }
    );

    alert(
  `Successfully joined ${gameName}`
);

/* OPEN GAME PAGE */

if(gameName === "Lucky Spin"){

    window.location.href =
    "luckyspin.html";

}
else if(gameName === "Dice Roll"){

    window.location.href =
    "dice.html";

}
else if(gameName === "Coin Flip"){

    window.location.href =
    "coinflip.html";

}
else if(gameName === "Monopoly Classic"){

    window.location.href =
    "monopoly-classic.html";

}
else if(gameName === "Monopoly GO!"){

    window.location.href =
    "monopoly-go.html";

}
else if(gameName === "Monopoly Plus"){

    window.location.href =
    "monopoly-plus.html";

}
else if(gameName === "Monopoly Mega"){

    window.location.href =
    "monopoly-mega.html";

}
else{

    location.reload();

}

  } catch (error) {

    console.error(error);

    alert(
      "Error: " +
      error.message
    );

  }

};

/* =========================
LEADERBOARD
========================= */

async function loadLeaderboard() {

  const leaderboard =
    document.getElementById(
      "leaderboard"
    );

  if (!leaderboard) return;

  try {

    const q =
      query(
        collection(db, "users"),
        orderBy("xp", "desc"),
        limit(10)
      );

    const snapshot =
      await getDocs(q);

    leaderboard.innerHTML = "";

    snapshot.forEach(
      (docSnap, index) => {

        const data =
          docSnap.data();

        leaderboard.innerHTML += `

        <div class="leader-card">

          <span>
            ${index + 1}
          </span>

          <h3>
            ${data.username || "Player"}
          </h3>

          <p>
            ${data.xp || 0} XP
          </p>

        </div>

        `;

      }
    );

  } catch (error) {

    console.error(error);

  }

}