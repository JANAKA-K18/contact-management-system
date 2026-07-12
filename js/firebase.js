import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {

    apiKey: "AIzaSyDg63RG5Q2JorO_nKC8L2hp8C0M9NcQ4G0",

    authDomain: "contact-management-syste-a9ce6.firebaseapp.com",

    projectId: "contact-management-syste-a9ce6",

    storageBucket: "contact-management-syste-a9ce6.firebasestorage.app",

    messagingSenderId: "360318277142",

    appId: "1:360318277142:web:f4f6177590b8e7c24f8737"

};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);