import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ---------- DOM ----------

const form = document.getElementById("contactForm");

const phoneInput = document.querySelector("#mobile");

const alternateInput = document.querySelector("#alternateMobile");

// ---------- intl-tel-input ----------

const iti = window.intlTelInput(phoneInput, {

    initialCountry: "auto",

    preferredCountries: ["in", "us", "gb"],

    separateDialCode: true,

    loadUtils: () =>
        import("https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.0/build/js/utils.js")

});

const itiAlt = window.intlTelInput(alternateInput, {

    initialCountry: "auto",

    preferredCountries: ["in", "us", "gb"],

    separateDialCode: true,

    loadUtils: () =>
        import("https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.0/build/js/utils.js")

});

// ---------- Authentication ----------

let currentUser = null;

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

});

// ---------- Save Contact ----------

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!currentUser) {

        alert("Please login again.");

        return;

    }

    const fullName = document.getElementById("fullName").value.trim();

    const mobile = phoneInput.value.trim();

    const alternateMobile = alternateInput.value.trim();

    const email = document.getElementById("email").value.trim();

    const company = document.getElementById("company").value.trim();

    const designation = document.getElementById("designation").value.trim();

    const category = document.getElementById("category").value;

    const birthday = document.getElementById("birthday").value;

    const address = document.getElementById("address").value.trim();

    const notes = document.getElementById("notes").value.trim();

    const favourite = document.getElementById("favorite").checked;

    // ---------- Validation ----------

    if (fullName === "") {

        alert("Please enter the full name.");

        return;

    }

    if (category === "") {

        alert("Please select a category.");

        return;

    }

    if (!iti.isValidNumber()) {

        alert("Please enter a valid mobile number.");

        return;

    }

    const country = iti.getSelectedCountryData();

    // India validation

    if (country.iso2 === "in") {

        if (!/^[6-9]\d{9}$/.test(mobile)) {

            alert("Please enter a valid 10-digit Indian mobile number.");

            return;

        }

    }

    // Email validation

    if (email !== "") {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            alert("Please enter a valid email address.");

            return;

        }

    }

    // Alternate number

    if (alternateMobile !== "") {

        if (!itiAlt.isValidNumber()) {

            alert("Please enter a valid alternate number.");

            return;

        }

    }

    try {

        await addDoc(

            collection(db, "users", currentUser.uid, "contacts"),

            {

                fullName,

                country: country.name,

                countryCode: "+" + country.dialCode,

                mobile: iti.getNumber(),

                alternateMobile:

                    alternateMobile === ""
                        ? ""
                        : itiAlt.getNumber(),

                email,

                company,

                designation,

                category,

                birthday,

                address,

                notes,

                favourite,

                createdAt: serverTimestamp()

            }

        );

        alert("Contact added successfully!");

        form.reset();

        window.location.href = "view-contact.html";

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});