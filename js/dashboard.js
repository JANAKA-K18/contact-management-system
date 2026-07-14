import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// DOM Elements
const userName = document.getElementById("userName");
const totalContacts = document.getElementById("totalContacts");
const logoutBtn = document.getElementById("logoutBtn");

// Check Login Status
onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    try {

        // Get User Details
        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {

            const data = userSnap.data();

            userName.textContent = data.fullName;

        } else {

            userName.textContent = "User";

        }

        // Count Contacts
        const contactsRef = collection(db, "contacts");

        const q = query(
            contactsRef,
            where("uid", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);

        totalContacts.textContent = querySnapshot.size;

    }

    catch (error) {

        console.error(error);

    }

});

// Logout
logoutBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    try {

        await signOut(auth);

        alert("Logged out successfully.");

        window.location.href = "login.html";

    }

    catch (error) {

        alert(error.message);

    }

});