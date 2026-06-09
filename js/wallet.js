import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
ELEMENTS
========================= */

const totalBalance =
document.getElementById("totalBalance");

const btcBalance =
document.getElementById("btcBalance");

const solBalance =
document.getElementById("solBalance");

const usdtBalance =
document.getElementById("usdtBalance");

const paypalBalance =
document.getElementById("paypalBalance");

const walletUsername =
document.getElementById("walletUsername");

const walletEmail =
document.getElementById("walletEmail");

const transferForm =
document.getElementById("transferForm");

const transferMessage =
document.getElementById("transferMessage");

const transactionList =
document.getElementById("transactionList");

let currentUser = null;
let currentUserData = null;

/* =========================
AUTH CHECK
========================= */

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href =
        "login.html";

        return;

    }

    currentUser = user;

    try{

        const userRef =
        doc(
            db,
            "users",
            user.uid
        );

        const snap =
        await getDoc(userRef);

        if(snap.exists()){

            currentUserData =
            snap.data();

            loadWallet(
                currentUserData
            );

            loadTransactions();

        }

    }catch(error){

        console.error(error);

    }

});

/* =========================
LOAD WALLET
========================= */

function loadWallet(data){

    if(walletUsername){

        walletUsername.textContent =
        data.username || "User";

    }

    if(walletEmail){

        walletEmail.textContent =
        data.email || "No Email";

    }

    if(totalBalance){

        totalBalance.textContent =
        Number(
            data.balance || 0
        ).toFixed(2);

    }

    if(btcBalance){

        btcBalance.textContent =
        Number(
            data.btcBalance || 0
        ).toFixed(2);

    }

    if(solBalance){

        solBalance.textContent =
        Number(
            data.solBalance || 0
        ).toFixed(2);

    }

    if(usdtBalance){

        usdtBalance.textContent =
        Number(
            data.usdtBalance || 0
        ).toFixed(2);

    }

    if(paypalBalance){

        paypalBalance.textContent =
        Number(
            data.paypalBalance || 0
        ).toFixed(2);

    }

}

/* =========================
LOAD TRANSACTIONS
========================= */

async function loadTransactions(){

    if(!transactionList) return;

    try{

        const q =
        query(
            collection(
                db,
                "transactions"
            ),
            where(
                "userId",
                "==",
                currentUser.uid
            )
        );

        const snapshot =
        await getDocs(q);

        transactionList.innerHTML = "";

        if(snapshot.empty){

            transactionList.innerHTML =
            "<p>No transactions found.</p>";

            return;

        }

        snapshot.forEach(docSnap=>{

            const data =
            docSnap.data();

            transactionList.innerHTML += `

            <div class="transaction-item">

                <h4>
                    ${data.type || "Transaction"}
                </h4>

                <p>
                    Amount:
                    $${Number(
                        data.amount || 0
                    ).toFixed(2)}
                </p>

                <p>
                    Status:
                    ${data.status || "Pending"}
                </p>

                <small>
                    ${data.description || ""}
                </small>

            </div>

            `;

        });

    }catch(error){

        console.error(error);

    }

}

/* =========================
TRANSFER FUNDS
========================= */

if(transferForm){

    transferForm.addEventListener(
    "submit",
    async(e)=>{

        e.preventDefault();

        const receiverEmail =
        document.getElementById(
            "receiverEmail"
        ).value.trim();

        const transferAmount =
        Number(
            document.getElementById(
                "transferAmount"
            ).value
        );

        if(
            !receiverEmail ||
            transferAmount <= 0
        ){

            alert(
            "Enter valid details."
            );

            return;

        }

        try{

            const senderBalance =
            Number(
                currentUserData.balance || 0
            );

            if(
                senderBalance <
                transferAmount
            ){

                alert(
                "Insufficient Balance"
                );

                return;

            }

            const q =
            query(
                collection(
                    db,
                    "users"
                ),
                where(
                    "email",
                    "==",
                    receiverEmail
                )
            );

            const receiverSnap =
            await getDocs(q);

            if(receiverSnap.empty){

                alert(
                "Recipient not found."
                );

                return;

            }

            const receiverDoc =
            receiverSnap.docs[0];

            const receiverId =
            receiverDoc.id;

            const receiverData =
            receiverDoc.data();

            if(
                receiverId ===
                currentUser.uid
            ){

                alert(
                "You cannot transfer to yourself."
                );

                return;

            }

            await updateDoc(
                doc(
                    db,
                    "users",
                    currentUser.uid
                ),
                {
                    balance:
                    senderBalance -
                    transferAmount
                }
            );

            await updateDoc(
                doc(
                    db,
                    "users",
                    receiverId
                ),
                {
                    balance:
                    Number(
                        receiverData.balance || 0
                    )
                    +
                    transferAmount
                }
            );

            await addDoc(
                collection(
                    db,
                    "transactions"
                ),
                {
                    userId:
                    currentUser.uid,

                    type:
                    "Transfer Sent",

                    amount:
                    transferAmount,

                    status:
                    "Completed",

                    description:
                    `Sent to ${receiverEmail}`,

                    createdAt:
                    serverTimestamp()
                }
            );

            await addDoc(
                collection(
                    db,
                    "transactions"
                ),
                {
                    userId:
                    receiverId,

                    type:
                    "Transfer Received",

                    amount:
                    transferAmount,

                    status:
                    "Completed",

                    description:
                    `Received from ${currentUser.email}`,

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
                    receiverId,

                    title:
                    "Funds Received",

                    message:
                    `You received $${transferAmount} from ${currentUser.email}`,

                    createdAt:
                    serverTimestamp()
                }
            );

            transferMessage.textContent =
            "Transfer Successful";

            alert(
            "Transfer Successful"
            );

            location.reload();

        }catch(error){

            console.error(error);

            alert(
                error.message
            );

        }

    });

}


