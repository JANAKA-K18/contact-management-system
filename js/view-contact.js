import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// ==========================================
// DOM ELEMENTS
// ==========================================

const contactsTableBody =
    document.getElementById("contactsTableBody");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const totalContactsElement =
    document.getElementById("totalContacts");

const favouriteContactsElement =
    document.getElementById("favouriteContacts");

const logoutBtn =
    document.getElementById("logoutBtn");

const deleteModal =
    document.getElementById("deleteModal");

const cancelDelete =
    document.getElementById("cancelDelete");

const confirmDelete =
    document.getElementById("confirmDelete");


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let currentUser = null;

let allContacts = [];

let contactToDelete = null;


// ==========================================
// CHECK AUTHENTICATION
// ==========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    await loadContacts();

});


// ==========================================
// LOAD CONTACTS FROM FIRESTORE
// ==========================================

async function loadContacts() {

    try {

        const contactsRef = collection(
            db,
            "users",
            currentUser.uid,
            "contacts"
        );

        const contactsQuery = query(
            contactsRef,
            orderBy("createdAt", "desc")
        );

        const querySnapshot =
            await getDocs(contactsQuery);

        allContacts = [];

        querySnapshot.forEach((contactDocument) => {

            allContacts.push({

                id: contactDocument.id,

                ...contactDocument.data()

            });

        });

        updateStatistics();

        filterContacts();

    }

    catch (error) {

        console.error(
            "Error loading contacts:",
            error
        );

        alert(
            "Unable to load contacts. Please try again."
        );

    }

}


// ==========================================
// DISPLAY CONTACTS
// ==========================================

function displayContacts(contacts) {

    contactsTableBody.innerHTML = "";

    if (contacts.length === 0) {

        emptyState.style.display = "block";

        return;

    }

    emptyState.style.display = "none";


    contacts.forEach((contact) => {

        const row =
            document.createElement("tr");


        const favouriteText =
            contact.favourite
                ? "Yes"
                : "No";


        const favouriteClass =
            contact.favourite
                ? "favourite-yes"
                : "favourite-no";


        row.innerHTML = `

            <td>
                ${escapeHTML(contact.fullName || "")}
            </td>

            <td>
                ${escapeHTML(contact.mobile || "-")}
            </td>

            <td>
                ${escapeHTML(contact.email || "-")}
            </td>

            <td>

                <span class="category-badge">

                    ${escapeHTML(contact.category || "-")}

                </span>

            </td>

            <td>
                ${escapeHTML(contact.company || "-")}
            </td>

            <td>

                <span
                    class="favourite-status ${favouriteClass}">

                    ${favouriteText}

                </span>

            </td>

            <td>

                <div class="action-buttons">

                    <button
                        type="button"
                        class="action-btn view-btn"
                        data-id="${contact.id}">

                        View

                    </button>

                    <button
                        type="button"
                        class="action-btn edit-btn"
                        data-id="${contact.id}">

                        Edit

                    </button>

                    <button
                        type="button"
                        class="action-btn contact-delete-btn"
                        data-id="${contact.id}">

                        Delete

                    </button>

                </div>

            </td>

        `;


        contactsTableBody.appendChild(row);

    });


    addActionListeners();

}


// ==========================================
// ADD BUTTON EVENT LISTENERS
// ==========================================

function addActionListeners() {


    // EDIT BUTTONS

    const editButtons =
        document.querySelectorAll(".edit-btn");


    editButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const contactId =
                    button.dataset.id;

                window.location.href =
                    `edit-contact.html?id=${contactId}`;

            }
        );

    });


    // DELETE BUTTONS

    const deleteButtons =
        document.querySelectorAll(
            ".contact-delete-btn"
        );


    deleteButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                contactToDelete =
                    button.dataset.id;

                deleteModal.classList.add(
                    "show"
                );

            }
        );

    });


    // VIEW BUTTONS

    const viewButtons =
        document.querySelectorAll(".view-btn");


    viewButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const contactId =
                    button.dataset.id;

                window.location.href =
                    `edit-contact.html?id=${contactId}&mode=view`;

            }
        );

    });

}


// ==========================================
// SEARCH AND CATEGORY FILTER
// ==========================================

function filterContacts() {

    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedCategory =
        categoryFilter.value;


    const filteredContacts =
        allContacts.filter((contact) => {


            const fullName =
                (contact.fullName || "")
                    .toLowerCase();


            const mobile =
                (contact.mobile || "")
                    .toLowerCase();


            const email =
                (contact.email || "")
                    .toLowerCase();


            const matchesSearch =

                fullName.includes(searchValue) ||

                mobile.includes(searchValue) ||

                email.includes(searchValue);


            const matchesCategory =

                selectedCategory === "All" ||

                contact.category ===
                selectedCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    displayContacts(filteredContacts);

}


// ==========================================
// SEARCH EVENT
// ==========================================

searchInput.addEventListener(
    "input",
    filterContacts
);


// ==========================================
// CATEGORY FILTER EVENT
// ==========================================

categoryFilter.addEventListener(
    "change",
    filterContacts
);


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    totalContactsElement.textContent =
        allContacts.length;


    const favouriteCount =
        allContacts.filter(
            (contact) =>
                contact.favourite === true
        ).length;


    favouriteContactsElement.textContent =
        favouriteCount;

}


// ==========================================
// DELETE CONTACT
// ==========================================

confirmDelete.addEventListener(
    "click",
    async () => {

        if (
            !contactToDelete ||
            !currentUser
        ) {

            return;

        }


        try {

            const contactRef = doc(

                db,

                "users",

                currentUser.uid,

                "contacts",

                contactToDelete

            );


            await deleteDoc(contactRef);


            deleteModal.classList.remove(
                "show"
            );


            contactToDelete = null;


            await loadContacts();


            alert(
                "Contact deleted successfully."
            );

        }

        catch (error) {

            console.error(
                "Error deleting contact:",
                error
            );


            alert(
                "Unable to delete contact."
            );

        }

    }
);


// ==========================================
// CANCEL DELETE
// ==========================================

cancelDelete.addEventListener(
    "click",
    () => {

        contactToDelete = null;

        deleteModal.classList.remove(
            "show"
        );

    }
);


// ==========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==========================================

deleteModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === deleteModal
        ) {

            contactToDelete = null;

            deleteModal.classList.remove(
                "show"
            );

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


// ==========================================
// SECURITY
// Prevent contact data from being inserted
// directly as HTML.
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}