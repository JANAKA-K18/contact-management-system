import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");

const togglePassword = document.getElementById("togglePassword");

const password = document.getElementById("password");

togglePassword.addEventListener("click", () => {

    if(password.type==="password"){

        password.type="text";
        togglePassword.classList.replace("fa-eye","fa-eye-slash");

    }else{

        password.type="password";
        togglePassword.classList.replace("fa-eye-slash","fa-eye");

    }

});

loginForm.addEventListener("submit", async(e)=>{

    e.preventDefault();

    const email=document.getElementById("email").value.trim();

    const pass=password.value;

    try{

        await signInWithEmailAndPassword(auth,email,pass);

        alert("Login Successful!");

        window.location.href="dashboard.html";

    }

    catch(error){

        alert(error.message);

    }

});

document.getElementById("forgotPassword").addEventListener("click",async(e)=>{

    e.preventDefault();

    const email=document.getElementById("email").value.trim();

    if(email===""){

        alert("Enter your email first.");

        return;

    }

    try{

        await sendPasswordResetEmail(auth,email);

        alert("Password reset email sent.");

    }

    catch(error){

        alert(error.message);

    }

});