import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";


// ==========================================
// DOM ELEMENTS
// ==========================================

const loginForm =
    document.getElementById("loginForm");

const togglePassword =
    document.getElementById("togglePassword");

const password =
    document.getElementById("password");

const emailInput =
    document.getElementById("email");

const loginBtn =
    document.getElementById("loginBtn");


// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

togglePassword.addEventListener(
    "click",
    () => {

        if (password.type === "password") {

            password.type = "text";

            togglePassword.classList.replace(
                "fa-eye",
                "fa-eye-slash"
            );

        }

        else {

            password.type = "password";

            togglePassword.classList.replace(
                "fa-eye-slash",
                "fa-eye"
            );

        }

    }
);


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            emailInput.value.trim();

        const pass =
            password.value;


        // ==================================
        // VALIDATION
        // ==================================

        if (email === "") {

            alert(
                "Please enter your email address."
            );

            return;

        }


        if (pass === "") {

            alert(
                "Please enter your password."
            );

            return;

        }


        try {

            // Disable button while logging in

            loginBtn.disabled = true;

            loginBtn.textContent =
                "Logging in...";


            // Firebase Authentication

            await signInWithEmailAndPassword(
                auth,
                email,
                pass
            );


            alert(
                "Login successful!"
            );


            // Redirect to Dashboard

            window.location.href =
                "dashboard.html";

        }

        catch (error) {

            console.error(
                "Login Error:",
                error
            );


            // ==================================
            // FIREBASE ERROR HANDLING
            // ==================================

            switch (error.code) {

                case "auth/invalid-email":

                    alert(
                        "Please enter a valid email address."
                    );

                    break;


                case "auth/invalid-credential":

                    alert(
                        "Incorrect email or password."
                    );

                    break;


                case "auth/user-disabled":

                    alert(
                        "This account has been disabled."
                    );

                    break;


                case "auth/too-many-requests":

                    alert(
                        "Too many failed login attempts. Please try again later."
                    );

                    break;


                case "auth/network-request-failed":

                    alert(
                        "Network error. Please check your internet connection."
                    );

                    break;


                default:

                    alert(
                        "Unable to login. Please try again."
                    );

            }

        }

        finally {

            // Enable Login button again

            loginBtn.disabled = false;

            loginBtn.textContent =
                "Login";

        }

    }
);