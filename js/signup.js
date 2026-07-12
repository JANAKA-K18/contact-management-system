import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const confirmPassword = document.getElementById("confirmPassword").value;

    const terms = document.getElementById("terms").checked;

    if (fullName === "") {

        alert("Please enter your full name.");

        return;

    }

    if (email === "") {

        alert("Please enter your email.");

        return;

    }

    if (password.length < 6) {

        alert("Password must contain at least 6 characters.");

        return;

    }

    if (password !== confirmPassword) {

        alert("Passwords do not match.");

        return;

    }

    if (!terms) {

        alert("Please accept the Terms & Conditions.");

        return;

    }

    try {

        const userCredential = await createUserWithEmailAndPassword(

            auth,

            email,

            password

        );

        await setDoc(

            doc(db, "users", userCredential.user.uid),

            {

                fullName: fullName,

                email: email,

                createdAt: new Date()

            }

        );

        alert("Account created successfully!");

        window.location.href = "dashboard.html";

    }

    catch (error) {

        alert(error.message);

    }

});