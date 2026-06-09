import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   REGISTER
========================= */

const registerForm =
document.getElementById("registerForm");

if (registerForm) {

  registerForm.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      const username =
      document.getElementById("username")
      .value.trim();

      const email =
      document.getElementById("email")
      .value.trim();

      const password =
      document.getElementById("password")
      .value;

      try {

        const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const user =
        userCredential.user;

        /* SEND EMAIL VERIFICATION */

        await sendEmailVerification(user);

        /* CREATE FIRESTORE USER */

        await setDoc(
          doc(db, "users", user.uid),
          {

            username: username,
            email: email,

            role: "user",
            status: "active",

            balance: 0,

            btcBalance: 0,
            solBalance: 0,
            usdtBalance: 0,

            level: 1,
            xp: 0,
            gamesPlayed: 0,
            tournamentsJoined: 0,
            rewardsEarned: 0,

            dailySpins: 0,
            lastSpinDate: "",

            rewardHistory: [],

            emailVerified: false,

            createdAt:
            serverTimestamp()

          }
        );

        alert(
          "Account created successfully.\n\nCheck your email and verify your account before logging in."
        );

        window.location.href =
        "verification.html";

      } catch (error) {

        console.error(error);

        alert(error.message);

      }

    }
  );

}

/* =========================
   LOGIN
========================= */

const loginForm =
document.getElementById("loginForm");

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      const email =
      document.getElementById(
        "loginEmail"
      ).value.trim();

      const password =
      document.getElementById(
        "loginPassword"
      ).value;

      try {

        const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const user =
        userCredential.user;

        /* REFRESH USER */

        await user.reload();

        /* CHECK EMAIL VERIFIED */

        if (!user.emailVerified) {

          alert(
            "Please verify your email first."
          );

          window.location.href =
          "verification.html";

          return;
        }

        alert(
          "Login Successful"
        );

        window.location.href =
        "dashboard.html";

      } catch (error) {

        console.error(error);

        alert(error.message);

      }

    }
  );

}