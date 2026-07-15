import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// ==========================================
// DOM ELEMENTS
// ==========================================

const form = document.getElementById("editContactForm");

const fullNameInput = document.getElementById("fullName");

const mobileInput = document.getElementById("mobile");

const alternateMobileInput =
    document.getElementById("alternateMobile");

const emailInput = document.getElementById("email");

const companyInput = document.getElementById("company");

const designationInput =
    document.getElementById("designation");

const categoryInput =
    document.getElementById("category");

const birthdayInput =
    document.getElementById("birthday");

const addressInput =
    document.getElementById("address");

const notesInput =
    document.getElementById("notes");

const favoriteInput =
    document.getElementById("favorite");

const logoutBtn =
    document.getElementById("logoutBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const backBtn =
    document.getElementById("backBtn");

const pageTitle =
    document.getElementById("pageTitle");

const pageDescription =
    document.getElementById("pageDescription");

const editButtons =
    document.getElementById("editButtons");

const viewButtons =
    document.getElementById("viewButtons");


// ==========================================
// GET URL PARAMETERS
// ==========================================

const urlParams =
    new URLSearchParams(window.location.search);

const contactId =
    urlParams.get("id");

const mode =
    urlParams.get("mode");

const isViewMode =
    mode === "view";


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let currentUser = null;


// ==========================================
// INITIALIZE INTL TEL INPUT
// ==========================================

const iti = window.intlTelInput(
    mobileInput,
    {
        initialCountry: "in",

        separateDialCode: true,

        preferredCountries: [
            "in",
            "us",
            "gb",
            "au",
            "ca"
        ],

        loadUtils: () =>
            import(
                "https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.0/build/js/utils.js"
            )
    }
);


const itiAlt = window.intlTelInput(
    alternateMobileInput,
    {
        initialCountry: "in",

        separateDialCode: true,

        preferredCountries: [
            "in",
            "us",
            "gb",
            "au",
            "ca"
        ],

        loadUtils: () =>
            import(
                "https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.0/build/js/utils.js"
            )
    }
);


// ==========================================
// CHECK CONTACT ID
// ==========================================

if (!contactId) {

    alert("Contact not found.");

    window.location.href =
        "view-contact.html";

}


// ==========================================
// AUTHENTICATION
// ==========================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }

        currentUser = user;

        await loadContact();

    }
);


// ==========================================
// LOAD CONTACT FROM FIRESTORE
// ==========================================

async function loadContact() {

    try {

        const contactRef = doc(

            db,

            "users",

            currentUser.uid,

            "contacts",

            contactId

        );


        const contactSnapshot =
            await getDoc(contactRef);


        if (!contactSnapshot.exists()) {

            alert(
                "This contact does not exist."
            );

            window.location.href =
                "view-contact.html";

            return;

        }


        const contact =
            contactSnapshot.data();


        // Populate form

        fullNameInput.value =
            contact.fullName || "";


        emailInput.value =
            contact.email || "";


        companyInput.value =
            contact.company || "";


        designationInput.value =
            contact.designation || "";


        categoryInput.value =
            contact.category || "";


        birthdayInput.value =
            contact.birthday || "";


        addressInput.value =
            contact.address || "";


        notesInput.value =
            contact.notes || "";


        favoriteInput.checked =
            contact.favourite === true;


        // Set phone number

        if (contact.mobile) {

            iti.setNumber(
                contact.mobile
            );

        }


        // Set alternate phone number

        if (contact.alternateMobile) {

            itiAlt.setNumber(
                contact.alternateMobile
            );

        }


        // Check View Mode

        if (isViewMode) {

            enableViewMode();

        }

    }

    catch (error) {

        console.error(
            "Error loading contact:",
            error
        );

        alert(
            "Unable to load contact details."
        );

    }

}


// ==========================================
// VIEW MODE
// ==========================================

function enableViewMode() {

    pageTitle.textContent =
        "Contact Details";


    pageDescription.textContent =
        "View the saved contact information.";


    editButtons.style.display =
        "none";


    viewButtons.style.display =
        "flex";


    const fields =
        form.querySelectorAll(
            "input, select, textarea"
        );


    fields.forEach((field) => {

        field.disabled = true;

    });

}


// ==========================================
// UPDATE CONTACT
// ==========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (isViewMode) {

            return;

        }


        if (!currentUser) {

            alert(
                "Please login again."
            );

            return;

        }


        // Get form values

        const fullName =
            fullNameInput.value.trim();


        const mobile =
            mobileInput.value.trim();


        const alternateMobile =
            alternateMobileInput.value.trim();


        const email =
            emailInput.value.trim();


        const company =
            companyInput.value.trim();


        const designation =
            designationInput.value.trim();


        const category =
            categoryInput.value;


        const birthday =
            birthdayInput.value;


        const address =
            addressInput.value.trim();


        const notes =
            notesInput.value.trim();


        const favourite =
            favoriteInput.checked;


        // ==================================
        // REQUIRED FIELD VALIDATION
        // ==================================

        if (fullName === "") {

            alert(
                "Please enter the full name."
            );

            return;

        }


        if (mobile === "") {

            alert(
                "Please enter a mobile number."
            );

            return;

        }


        if (category === "") {

            alert(
                "Please select a category."
            );

            return;

        }


        // ==================================
        // PHONE VALIDATION
        // ==================================

        if (!iti.isValidNumber()) {

            alert(
                "Please enter a valid mobile number."
            );

            return;

        }


        const country =
            iti.getSelectedCountryData();


        // India validation

        if (country.iso2 === "in") {

            const indianMobile =
                mobile.replace(/\D/g, "");


            if (
                !/^[6-9]\d{9}$/.test(
                    indianMobile
                )
            ) {

                alert(
                    "Please enter a valid 10-digit Indian mobile number."
                );

                return;

            }

        }


        // ==================================
        // ALTERNATE NUMBER VALIDATION
        // ==================================

        if (alternateMobile !== "") {

            if (!itiAlt.isValidNumber()) {

                alert(
                    "Please enter a valid alternative mobile number."
                );

                return;

            }

        }


        // ==================================
        // EMAIL VALIDATION
        // ==================================

        if (email !== "") {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailRegex.test(email)) {

                alert(
                    "Please enter a valid email address."
                );

                return;

            }

        }


        // ==================================
        // UPDATE FIRESTORE
        // ==================================

        try {

            const contactRef = doc(

                db,

                "users",

                currentUser.uid,

                "contacts",

                contactId

            );


            await updateDoc(
                contactRef,
                {

                    fullName,

                    country:
                        country.name,

                    countryCode:
                        "+" +
                        country.dialCode,

                    mobile:
                        iti.getNumber(),

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

                    updatedAt:
                        serverTimestamp()

                }
            );


            alert(
                "Contact updated successfully!"
            );


            window.location.href =
                "view-contact.html";

        }

        catch (error) {

            console.error(
                "Error updating contact:",
                error
            );


            alert(
                "Unable to update contact. Please try again."
            );

        }

    }
);


// ==========================================
// CANCEL BUTTON
// ==========================================

cancelBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "view-contact.html";

    }
);


// ==========================================
// BACK BUTTON
// ==========================================

backBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "view-contact.html";

    }
);


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener(
    "click",
    async (event) => {

        event.preventDefault();


        try {

            await signOut(auth);


            window.location.href =
                "login.html";

        }

        catch (error) {

            console.error(
                "Logout error:",
                error
            );


            alert(
                "Unable to logout."
            );

        }

    }
);
