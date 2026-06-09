import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getStorage }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {

  apiKey: "AIzaSyCz06D3P5dyF0HehjEUTp2Z1CCLisxpLA0",

  authDomain: "scopely-334fb.firebaseapp.com",

  projectId: "scopely-334fb",

  storageBucket: "scopely-334fb.firebasestorage.app",

  messagingSenderId: "601889699134",

  appId: "1:601889699134:web:3129380759d0871849a86f"

};

const app =
initializeApp(firebaseConfig);

export const auth =
getAuth(app);

export const db =
getFirestore(app);

export const storage =
getStorage(app);

