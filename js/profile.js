import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    updatePassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// ==========================================
// DOM ELEMENTS
// ==========================================

// Profile display

const profileAvatar =
    document.getElementById("profileAvatar");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const displayFullName =
    document.getElementById("displayFullName");

const displayEmail =
    document.getElementById("displayEmail");

const profileTotalContacts =
    document.getElementById("profileTotalContacts");

const accountCreated =
    document.getElementById("accountCreated");


// Buttons

const editProfileBtn =
    document.getElementById("editProfileBtn");

const changePasswordBtn =
    document.getElementById("changePasswordBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


// Edit Profile Modal

const editProfileModal =
    document.getElementById("editProfileModal");

const editProfileForm =
    document.getElementById("editProfileForm");

const editFullName =
    document.getElementById("editFullName");

const editEmail =
    document.getElementById("editEmail");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");


// Change Password Modal

const passwordModal =
    document.getElementById("passwordModal");

const passwordForm =
    document.getElementById("passwordForm");

const newPassword =
    document.getElementById("newPassword");

const confirmNewPassword =
    document.getElementById("confirmNewPassword");

const cancelPasswordBtn =
    document.getElementById("cancelPasswordBtn");


// ==========================================
// GLOBAL VARIABLE
// ==========================================

let currentUser = null;

let currentFullName = "";


// ==========================================
// AUTHENTICATION CHECK
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


        // Load user profile

        await loadProfile();


        // Load total contacts

        await loadTotalContacts();

    }
);


// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile() {

    try {

        const userRef = doc(

            db,

            "users",

            currentUser.uid

        );


        const userSnapshot =
            await getDoc(userRef);


        let fullName = "User";


        if (userSnapshot.exists()) {

            const userData =
                userSnapshot.data();


            fullName =
                userData.fullName ||
                "User";

        }


        currentFullName =
            fullName;


        const email =
            currentUser.email ||
            "No email available";


        // Display profile name

        profileName.textContent =
            fullName;


        // Display profile email

        profileEmail.textContent =
            email;


        // Display account information

        displayFullName.textContent =
            fullName;


        displayEmail.textContent =
            email;


        // Profile Avatar
        // Shows first letter of user's name

        profileAvatar.textContent =
            fullName
                .charAt(0)
                .toUpperCase();


        // Fill Edit Profile Modal

        editFullName.value =
            fullName;


        editEmail.value =
            email;


        // Account creation date

        if (
            currentUser.metadata &&
            currentUser.metadata.creationTime
        ) {

            const createdDate =
                new Date(
                    currentUser.metadata.creationTime
                );


            accountCreated.textContent =
                createdDate.toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );

        }

        else {

            accountCreated.textContent =
                "Not available";

        }

    }

    catch (error) {

        console.error(
            "Error loading profile:",
            error
        );


        alert(
            "Unable to load profile information."
        );

    }

}


// ==========================================
// LOAD TOTAL CONTACTS
// ==========================================

async function loadTotalContacts() {

    try {

        const contactsRef =
            collection(

                db,

                "users",

                currentUser.uid,

                "contacts"

            );


        const contactsSnapshot =
            await getDocs(
                contactsRef
            );


        profileTotalContacts.textContent =
            contactsSnapshot.size;

    }

    catch (error) {

        console.error(
            "Error loading total contacts:",
            error
        );


        profileTotalContacts.textContent =
            "0";

    }

}


// ==========================================
// OPEN EDIT PROFILE MODAL
// ==========================================

editProfileBtn.addEventListener(
    "click",
    () => {

        editFullName.value =
            currentFullName;


        editEmail.value =
            currentUser.email || "";


        editProfileModal.classList.add(
            "show"
        );

    }
);


// ==========================================
// CLOSE EDIT PROFILE MODAL
// ==========================================

cancelEditBtn.addEventListener(
    "click",
    () => {

        editProfileModal.classList.remove(
            "show"
        );

    }
);


// ==========================================
// UPDATE PROFILE
// ==========================================

editProfileForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const newFullName =
            editFullName.value.trim();


        // Validate name

        if (newFullName === "") {

            alert(
                "Please enter your full name."
            );

            return;

        }


        if (newFullName.length < 2) {

            alert(
                "Full name must contain at least 2 characters."
            );

            return;

        }


        try {

            const userRef = doc(

                db,

                "users",

                currentUser.uid

            );


            // Update Firestore

            await updateDoc(

                userRef,

                {

                    fullName:
                        newFullName

                }

            );


            // Update local value

            currentFullName =
                newFullName;


            // Update UI

            profileName.textContent =
                newFullName;


            displayFullName.textContent =
                newFullName;


            profileAvatar.textContent =
                newFullName
                    .charAt(0)
                    .toUpperCase();


            // Close modal

            editProfileModal.classList.remove(
                "show"
            );


            alert(
                "Profile updated successfully!"
            );

        }

        catch (error) {

            console.error(
                "Error updating profile:",
                error
            );


            alert(
                "Unable to update profile. Please try again."
            );

        }

    }
);


// ==========================================
// OPEN CHANGE PASSWORD MODAL
// ==========================================

changePasswordBtn.addEventListener(
    "click",
    () => {

        // Clear old input

        passwordForm.reset();


        // Show modal

        passwordModal.classList.add(
            "show"
        );

    }
);


// ==========================================
// CLOSE CHANGE PASSWORD MODAL
// ==========================================

cancelPasswordBtn.addEventListener(
    "click",
    () => {

        passwordModal.classList.remove(
            "show"
        );


        passwordForm.reset();

    }
);


// ==========================================
// CHANGE PASSWORD
// ==========================================

passwordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const password =
            newPassword.value;


        const confirmPassword =
            confirmNewPassword.value;


        // Validate password length

        if (password.length < 6) {

            alert(
                "Password must contain at least 6 characters."
            );

            return;

        }


        // Check passwords match

        if (
            password !==
            confirmPassword
        ) {

            alert(
                "Passwords do not match."
            );

            return;

        }


        try {

            // Update Firebase Authentication password

            await updatePassword(

                currentUser,

                password

            );


            // Close modal

            passwordModal.classList.remove(
                "show"
            );


            // Reset form

            passwordForm.reset();


            alert(
                "Password updated successfully!"
            );

        }

        catch (error) {

            console.error(
                "Password update error:",
                error
            );


            // Firebase requires recent login
            // for sensitive operations

            if (
                error.code ===
                "auth/requires-recent-login"
            ) {

                alert(
                    "For security reasons, please log out and log in again before changing your password."
                );

            }

            else if (
                error.code ===
                "auth/weak-password"
            ) {

                alert(
                    "Please choose a stronger password."
                );

            }

            else {

                alert(
                    "Unable to update password. Please try again."
                );

            }

        }

    }
);


// ==========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==========================================

editProfileModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            editProfileModal
        ) {

            editProfileModal.classList.remove(
                "show"
            );

        }

    }
);


passwordModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            passwordModal
        ) {

            passwordModal.classList.remove(
                "show"
            );


            passwordForm.reset();

        }

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

            await signOut(
                auth
            );


            window.location.href =
                "login.html";

        }

        catch (error) {

            console.error(
                "Logout error:",
                error
            );


            alert(
                "Unable to logout. Please try again."
            );

        }

    }
);