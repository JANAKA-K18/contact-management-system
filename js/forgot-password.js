import { auth } from "./firebase.js";

import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";


const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const emailInput =
    document.getElementById("email");

const message =
    document.getElementById("message");

const resetBtn =
    document.getElementById("resetBtn");


forgotPasswordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            emailInput.value.trim();


        if (email === "") {

            showMessage(
                "Please enter your email address.",
                "error"
            );

            return;

        }


        try {

            resetBtn.disabled = true;

            resetBtn.textContent =
                "Sending...";


            await sendPasswordResetEmail(
                auth,
                email
            );


            showMessage(
                "If an account is associated with this email address, password reset instructions will be sent to it.",
                "success"
            );


            forgotPasswordForm.reset();

        }

        catch (error) {

            console.error(
                "Password reset error:",
                error
            );


            if (
                error.code ===
                "auth/invalid-email"
            ) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

            }

            else if (
                error.code ===
                "auth/network-request-failed"
            ) {

                showMessage(
                    "Network error. Please check your internet connection.",
                    "error"
                );

            }

            else {

                showMessage(
                    "Unable to process the password reset request. Please try again.",
                    "error"
                );

            }

        }

        finally {

            resetBtn.disabled = false;

            resetBtn.textContent =
                "Send Reset Link";

        }

    }
);


function showMessage(text, type) {

    message.textContent = text;

    message.className = type;

}