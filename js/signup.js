import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

console.log("signup.js loaded successfully");

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    // Get Form Values
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const terms = document.getElementById("terms").checked;

    // Validation
    if (fullName === "") {
        alert("Please enter your full name.");
        return;
    }

    if (email === "") {
        alert("Please enter your email address.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
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

        // Create User
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        // Save User Details
        await setDoc(doc(db, "users", userCredential.user.uid), {

            fullName: fullName,
            email: email,
            createdAt: serverTimestamp()

        });

        alert("Account created successfully!");

        window.location.href = "login.html";

    } catch (error) {

        console.error(error);

        switch (error.code) {

            case "auth/email-already-in-use":
                alert("Email already registered.");
                break;

            case "auth/invalid-email":
                alert("Invalid email address.");
                break;

            case "auth/weak-password":
                alert("Password is too weak.");
                break;

            case "auth/network-request-failed":
                alert("Network error. Please check your internet connection.");
                break;

            default:
                alert(error.message);

        }

    }

});