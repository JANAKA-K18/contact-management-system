import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// ==========================================
// DOM ELEMENTS
// ==========================================

const userName =
    document.getElementById("userName");

const totalContacts =
    document.getElementById("totalContacts");

const favouriteCount =
    document.getElementById("favouriteCount");

const categoryCount =
    document.getElementById("categoryCount");

const recentCount =
    document.getElementById("recentCount");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// GLOBAL VARIABLE
// ==========================================

let currentUser = null;


// ==========================================
// AUTHENTICATION CHECK
// ==========================================

onAuthStateChanged(auth, async (user) => {

    // If user is not logged in
    if (!user) {

        window.location.href = "login.html";

        return;

    }

    // Store logged-in user
    currentUser = user;


    // Load logged-in user's name
    await loadUserDetails();


    // Load dashboard statistics
    await loadDashboardData();

});


// ==========================================
// LOAD USER DETAILS
// ==========================================

async function loadUserDetails() {

    try {

        const userRef = doc(
            db,
            "users",
            currentUser.uid
        );


        const userSnapshot =
            await getDoc(userRef);


        // Check if user document exists
        if (userSnapshot.exists()) {

            const userData =
                userSnapshot.data();


            // Display full name
            if (userName) {

                userName.textContent =
                    userData.fullName || "User";

            }

        }

        else {

            // Use email if user document does not exist
            if (userName) {

                userName.textContent =
                    currentUser.email || "User";

            }

        }

    }

    catch (error) {

        console.error(
            "Error loading user details:",
            error
        );


        if (userName) {

            userName.textContent = "User";

        }

    }

}


// ==========================================
// LOAD DASHBOARD DATA
// ==========================================

async function loadDashboardData() {

    try {

        // Reference to logged-in user's contacts
        const contactsRef =
            collection(
                db,
                "users",
                currentUser.uid,
                "contacts"
            );


        // Get all contacts
        const contactsSnapshot =
            await getDocs(contactsRef);


        // Store contacts
        const contacts = [];


        contactsSnapshot.forEach(
            (contactDocument) => {

                contacts.push({

                    id: contactDocument.id,

                    ...contactDocument.data()

                });

            }
        );


        // ==================================
        // TOTAL CONTACTS
        // ==================================

        if (totalContacts) {

            totalContacts.textContent =
                contacts.length;

        }


        // ==================================
        // FAVOURITE CONTACTS
        // ==================================

        const favouriteContacts =
            contacts.filter(

                (contact) =>
                    contact.favourite === true

            );


        if (favouriteCount) {

            favouriteCount.textContent =
                favouriteContacts.length;

        }


        // ==================================
        // CATEGORIES
        // ==================================

        const categories =
            new Set(

                contacts

                    .map(
                        (contact) =>
                            contact.category
                    )

                    .filter(Boolean)

            );


        if (categoryCount) {

            categoryCount.textContent =
                categories.size;

        }


        // ==================================
        // RECENT CONTACT COUNT
        // ==================================

        // Dashboard shows maximum 5 recent contacts

        if (recentCount) {

            recentCount.textContent =
                Math.min(
                    contacts.length,
                    5
                );

        }


        // ==================================
        // CONSOLE INFORMATION
        // ==================================

        console.log(
            "Total Contacts:",
            contacts.length
        );


        console.log(
            "Favourite Contacts:",
            favouriteContacts.length
        );


        console.log(
            "Categories:",
            categories.size
        );


        console.log(
            "Recent Contacts:",
            Math.min(
                contacts.length,
                5
            )
        );


        // ==================================
        // LOAD RECENT CONTACTS LIST
        // ==================================

        await loadRecentContacts();

    }

    catch (error) {

        console.error(
            "Error loading dashboard data:",
            error
        );

    }

}


// ==========================================
// LOAD RECENT CONTACTS
// ==========================================

async function loadRecentContacts() {

    const recentBox =
        document.querySelector(
            ".recent-box"
        );


    // Stop if recent-box does not exist
    if (!recentBox) {

        return;

    }


    try {

        // Reference to user's contacts
        const contactsRef =
            collection(
                db,
                "users",
                currentUser.uid,
                "contacts"
            );


        // Get latest 5 contacts
        const recentQuery =
            query(

                contactsRef,

                orderBy(
                    "createdAt",
                    "desc"
                ),

                limit(5)

            );


        const recentSnapshot =
            await getDocs(
                recentQuery
            );


        // Clear existing content
        recentBox.innerHTML = "";


        // ==================================
        // NO CONTACTS
        // ==================================

        if (recentSnapshot.empty) {

            recentBox.innerHTML = `

                <p class="no-contacts">

                    No contacts available.

                </p>

            `;

            return;

        }


        // ==================================
        // DISPLAY RECENT CONTACTS
        // ==================================

        recentSnapshot.forEach(
            (contactDocument) => {

                const contact =
                    contactDocument.data();


                // Create contact row
                const contactItem =
                    document.createElement(
                        "div"
                    );


                contactItem.classList.add(
                    "recent-contact-item"
                );


                // Contact information
                contactItem.innerHTML = `

                    <div class="recent-contact-info">

                        <h3>

                            ${escapeHTML(
                                contact.fullName ||
                                "Unnamed Contact"
                            )}

                        </h3>


                        <p>

                            ${escapeHTML(
                                contact.mobile ||
                                "No mobile number"
                            )}

                        </p>

                    </div>


                    <span class="recent-category">

                        ${escapeHTML(
                            contact.category ||
                            "Others"
                        )}

                    </span>

                `;


                // Add contact to recent box
                recentBox.appendChild(
                    contactItem
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Error loading recent contacts:",
            error
        );


        recentBox.innerHTML = `

            <p class="no-contacts">

                Unable to load recent contacts.

            </p>

        `;

    }

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            try {

                // Firebase logout
                await signOut(auth);


                // Redirect to login
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

}


// ==========================================
// SECURITY HELPER
// PREVENT HTML INJECTION
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}