// Table of Contents ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 1. Global Declarations
// 2. Initialization
// 3. Login/Signup
// 4. Settings
// 5. Sidebar
// 6. Helper Functions
// 7. User Menu
// 8. API/Model Selection
// 9. Submit Button Handler
// 10. Clear Chat Handler
// 11. Read Aloud
// 12. Avatar Upload
// 13. Event Listeners
// 14. Chat Display
// 15. Chat Savings
// 16. Download Chats
// 17. Themes
// 18. Chatbot Mode
// 19. LLM Model Selection 


// 1. Global Declarations ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Declare all global variables
let apiKey;
let modelName;
let selectedApi;
let db; // Declare db here
let userUpload = '';
let readAloudEnabled = false;
let userAvatar = '';
let chatHistory = [];
let savedChats = [];
let auth; // Declare auth at the top-level scope
let isInitialized = false;
let currentUser = null;
let currentMode = 'general';  // Defaults to 'general'
let themeDropdown;
let modeDropdown;


// 2. Initialization ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to load saved chats from Firestore
async function loadSavedChatsFromFirestore() {
    const chatsRef = db.collection('chats');
    const doc = await chatsRef.doc('chatHistory').get();
    if (doc.exists) {
        const savedChatHistory = JSON.parse(doc.data().history);
        chatHistory = savedChatHistory;
        updateChatDisplay(chatHistory);
    }
}

async function loadUserAvatar(avatarURL) {
    // Check if avatarURL exists
    if (!avatarURL) {
        console.log("No avatar URL provided.");
        return;
    }

    // Function to replace avatar for a given element
    function replaceAvatar(element, avatarURL) {
        if (element) {
            const originalId = element.id;  // Store the original ID
            element.outerHTML = '<img src="' + avatarURL + '" class="' + element.className + '" id="' + originalId + '" onclick="' + element.getAttribute('onclick') + '" alt="Avatar">';
        }
    }

    // Update the 'user-icon' element in the navbar
    const userIconElement = document.getElementById('user-icon');
    replaceAvatar(userIconElement, avatarURL);

    // Update all 'avatar-user-icon' elements in the chat area
    const avatarUserIcons = document.querySelectorAll('.avatar-user-icon');
    avatarUserIcons.forEach(element => {
        replaceAvatar(element, avatarURL);
    });
}



// Function to fetch and display user profile data and load avatar
function fetchUserProfileData() {
    // Get the current authenticated user
    const currentUser = firebase.auth().currentUser;

    // Check if a user is authenticated
    if (currentUser) {
        // Get the unique user ID
        const userId = currentUser.uid;

        // Reference to the user's document in Firestore
        const userRef = firebase.firestore().collection('users').doc(userId);

        // Fetch user data from Firestore
        userRef.get().then(doc => {
            if (doc.exists) {
                // Retrieve user data from the document
                const userData = doc.data();
                console.log("Fetched user data:", userData);

                // Extract first name and last name from the user's display name as default values
                const defaultFirstName = currentUser.displayName ? currentUser.displayName.split(' ')[0] : 'John';
                const defaultLastName = currentUser.displayName ? currentUser.displayName.split(' ')[1] : 'Doe';

                // Update the 'firstName' element with user's first name or default value
                if (document.getElementById('firstName')) {
                    document.getElementById('firstName').textContent = userData.firstName || defaultFirstName;
                }

                // Update the 'lastName' element with user's last name or default value
                if (document.getElementById('lastName')) {
                    document.getElementById('lastName').textContent = userData.lastName || defaultLastName;
                }

                // Update the 'email' element with user's email or default value
                if (document.getElementById('email')) {
                    document.getElementById('email').textContent = userData.email || currentUser.email || 'john.doe@example.com';
                    console.log("Updated email to:", userData.email);
                }

                // Determine which avatar URL to use: user-uploaded avatar or Google profile picture
                const avatarURL = userData.avatarURL || currentUser.photoURL;

                // Load the avatar into relevant elements on the page
                loadUserAvatar(avatarURL);

            } else {
                // Log if the user's document is not found in Firestore
                console.log("No user document found.");
            }
        }).catch(error => {
            // Log any error encountered during the Firestore fetch operation
            console.log("Error fetching user data:", error);
        });
    }
}




// Initialize function definition
async function initialize() {

    // Check if already initialized
    if (isInitialized) {
        console.log('Already initialized, skipping...');
        return;
    }

    console.log('DOM Content Loaded');

    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBF0KDFT26Jp_04cSzvPQah9a4ZD1m5Ap8",
        authDomain: "soloknows-32b12.firebaseapp.com",
        projectId: "soloknows-32b12",
        storageBucket: "soloknows-32b12.appspot.com",
        messagingSenderId: "672545320344",
        appId: "1:672545320344:web:4a16fb010c474341c74fed",
        measurementId: "G-QVM86WRPBC"
    };

    // Initialize Firebase if not initialized
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Initialize Firebase Auth and Firestore
    if (!auth) {
        auth = firebase.auth();
    }
    if (!db) {
        db = firebase.firestore();
    }

    // Initialize Firebase Storage
    const storage = firebase.storage();

    // Ensure DOM is loaded before running code  
    document.addEventListener('DOMContentLoaded', () => {


        // onAuthStateChanged listener
        firebase.auth().onAuthStateChanged(async user => {

            if (user) {

                console.log("Debug: User is already logged in");

                // Display main app sections  
                mainContainer.style.display = 'block';
                sidebar.style.display = 'block';
                loginPopup.style.display = 'none';
                signupPopup.style.display = 'none';

                // Fetch data from Firestore
                const userId = user.uid;
                const userRef = db.collection('users').doc(userId);
                const doc = await userRef.get();

                if (doc.exists) {

                    const userData = doc.data();

                    apiKey = userData.apiKey || '';
                    modelName = userData.modelName || '';
                    selectedApi = userData.selectedApi || 'OpenAI';

                    // Get and display first/last name
                    const userFirstName = userData.firstName || 'John';
                    const userLastName = userData.lastName || 'Doe';
                    document.getElementById('first-name').innerText = userFirstName;
                    document.getElementById('last-name').innerText = userLastName;

                    // Update display  
                    updateDisplay(selectedApi, apiKey, modelName);

                } else {
                    console.log("Debug: No user data found in Firestore.");
                }
                

            } else {

                console.log("Debug: No user is logged in");

                // Show login sections
                mainContainer.style.display = 'none';
                sidebar.style.display = 'none';
                loginPopup.style.display = 'block';

            }

        });

        loadUserAvatar(); 

        

    });

    // Load saved chats
    if (db) {
        await loadSavedChatsFromFirestore();
        console.log('Calling updateSavedChatsList after loading saved chats.');
    }

    // Load most recent saved chat
    if (db) {
        const chatsRef = db.collection('savedChats').orderBy("timestamp", "desc").limit(1);
        const mostRecentChat = await chatsRef.get();
        mostRecentChat.forEach(doc => {
            chatHistory = doc.data().history;
            currentChatID = doc.id;
            isNewConversation = false;
            updateChatDisplay(chatHistory);
        });
    }

    // Fetch user profile data
    fetchUserProfileData();

    // Load user avatar
    loadUserAvatar();
}


// Call initialize on DOM load  
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}


// 3. Login/Signup //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Initialize Google Provider
const provider = new firebase.auth.GoogleAuthProvider();

// Get the HTML elements with the respective IDs
const googleLoginButton = document.getElementById('google-login-button');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const mainContainer = document.getElementById('mainContainer');
const sidebar = document.getElementById('sidebar');
const loginPopup = document.getElementById('login-popup');
const signupPopup = document.getElementById('signup-popup');
const signupButton = document.getElementById('signup-button');
const loginButton = document.getElementById('login-button');
const gotoSignupButton = document.getElementById('goto-signup');
const gotoLoginButton = document.getElementById('goto-login');
const logoutButton = document.getElementById('logout-button');

console.log("Debug: Initialized all required variables");


// Google Login Button
if (googleLoginButton) {
    console.log('Debug: Google Login button found');
    googleLoginButton.addEventListener('click', async (e) => {
        console.log('Debug: Google Login button clicked');
        e.preventDefault();  // Prevent the button from submitting the form

        // Start Google login
        auth.signInWithPopup(provider).then(async (result) => {
            console.log('Debug: Successfully logged in with Google');

            // Capture Google user details
            const googleUser = result.user;
            const googleProfilePic = googleUser.photoURL;
            let googleFirstName = '';
            let googleLastName = '';

            if (googleUser.displayName) {
                const nameParts = googleUser.displayName.split(' ');
                googleFirstName = nameParts[0];
                googleLastName = nameParts.length > 1 ? nameParts[1] : '';
            }

            console.log(`Debug: Extracted Google Name - First Name: ${googleFirstName}, Last Name: ${googleLastName}`);

            const googleEmail = googleUser.email;
            // Fetch user profile data
            fetchUserProfileData();

            // Save user details to Firestore
            const userId = googleUser.uid;
            const userRef = db.collection('users').doc(userId);
            await userRef.set({
                firstName: googleFirstName,
                lastName: googleLastName,
                email: googleEmail,
                // ... any other data you want to save
            }, { merge: true });  // Using merge: true to ensure we don't overwrite other data

            console.log(`Debug: Google Details saved to Firestore - ${googleFirstName}, ${googleLastName}, ${googleEmail}, ${googleProfilePic}`);

            // Update the user profile icon with Google profile picture
            document.getElementById('user-icon').src = googleProfilePic;

            // Update user info in the user-menu
            document.getElementById('first-name').innerText = googleFirstName;
            document.getElementById('last-name').innerText = googleLastName;
            document.getElementById('email').innerText = googleEmail;

            // User is signed in, hide the login form and show the main app
            mainContainer.style.display = 'block';
            sidebar.style.display = 'block';
            loginPopup.style.display = 'none';
            signupPopup.style.display = 'none';
        }).catch((error) => {
            console.log('Debug: Error during Google Login:', error);
        });
    });
} else {
    console.log('Debug: Google Login button not found');
}

// Signup Button
if (signupButton) {
    signupButton.addEventListener('click', function (e) {
        e.preventDefault();
        loginPopup.style.display = 'none';
        signupPopup.style.display = 'block';
    });
}

// Login Button
if (loginButton) {
    loginButton.addEventListener('click', function (e) {
        e.preventDefault();
        signupPopup.style.display = 'none';
        loginPopup.style.display = 'block';
    });
}

// Login form's 'Sign Up' button
if (gotoSignupButton) {
    gotoSignupButton.addEventListener('click', function (e) {
        e.preventDefault();
        loginPopup.style.display = 'none';
        signupPopup.style.display = 'block';
    });
}

// Signup form's 'Back to Login' button
if (gotoLoginButton) {
    gotoLoginButton.addEventListener('click', function (e) {
        e.preventDefault();
        signupPopup.style.display = 'none';
        loginPopup.style.display = 'block';
    });
}

// Logout Button
if (logoutButton) {
    logoutButton.addEventListener('click', function () {
        firebase.auth().signOut().then(function () {
            console.log('User logged out');
            mainContainer.style.display = 'none';
            sidebar.style.display = 'none';
            loginPopup.style.display = 'block';
        }).catch(function (error) {
            console.log('Error logging out:', error);
        });
    });
}

// Login Form
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log('User logged in successfully', userCredential.user);
            loginPopup.style.display = 'none';
            signupPopup.style.display = 'none';
            mainContainer.style.display = 'block';
            sidebar.style.display = 'block';
        } catch (error) {
            if (error.code === 'auth/wrong-password') {
                alert('The password is incorrect. Please try again.');
            } else if (error.code === 'auth/user-not-found') {
                alert('No user found with the provided email. Please sign up first.');
            } else {
                alert('An error occurred during login. Please try again.');
            }
            console.error('Error during login', error);
        }
    });
}

// Signup Form
if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const firstName = document.getElementById('signup-first-name').value;
        const lastName = document.getElementById('signup-last-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const userRef = db.collection('users').doc(userCredential.user.uid);
            await userRef.set({
                firstName: firstName,
                lastName: lastName
            });
            console.log('User signed up successfully', userCredential.user);
            loginPopup.style.display = 'none';
            signupPopup.style.display = 'none';
            mainContainer.style.display = 'block';
            sidebar.style.display = 'block';
        } catch (error) {
            console.error('Error during signup', error);
        }
    });
}

function checkAndUpdateUserInfo() {
    auth.onAuthStateChanged(function (user) {
        if (user) {
            console.log('Debug: User is signed in');
            const profilePic = user.photoURL;
            const firstName = user.displayName.split(' ')[0];
            const lastName = user.displayName.split(' ')[1];
            const email = user.email;

            document.getElementById('user-icon').src = profilePic;
            document.getElementById('first-name').innerText = firstName;
            document.getElementById('last-name').innerText = lastName;
            document.getElementById('email').innerText = email;
        } else {
            console.log('Debug: No user is signed in');
        }
        
    });
}


// 4. Settings //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Get the HTML element with the ID 'settings-button'
const settingsButton = document.getElementById('settings-button');

// Get the HTML element with the ID 'settings-popup'
const settingsPopup = document.getElementById('settings-popup');

// Function to close the settings popup
function closeSettings() {
    settingsPopup.style.display = 'none';
}

// Attach event listener for settings popup open/close
if (settingsButton) {
    settingsButton.addEventListener("click", function (event) {

        // Toggle the visibility of the settings popup
        if (settingsPopup.style.display === 'none' || settingsPopup.style.display === '') {
            settingsPopup.style.display = 'block';
        } else {
            closeSettings(); // Use the function to close settings
        }
    });
}

// Reference to the close-settings button
const closeSettingsBtn = document.getElementById("close-settings");
if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener("click", closeSettings);  // Use the function to close settings
}

// Close settings popup when clicked outside of it
document.addEventListener("click", function (event) {
    const isClickedInsideSettings = settingsPopup.contains(event.target);

    if (!isClickedInsideSettings) {
        closeSettings(); // Use the function to close settings
    }
});




// Call display update after loading settings
updateDisplay(selectedApi, apiKey, modelName);

//Clear Avatar Button//
const clearAvatarBtn = document.getElementById('clear-avatar-btn');

// Function to clear the user-uploaded avatar and default back to Google profile picture or default icon
async function clearUserAvatar() {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) {
        console.log("User not authenticated.");
        return;
    }

    const userId = currentUser.uid;
    const userRef = firebase.firestore().collection('users').doc(userId);

    // Delete the user-uploaded avatar from Firebase Storage
    const avatarRef = firebase.storage().ref('avatars/' + userId);
    try {
        await avatarRef.delete();
        console.log("User-uploaded avatar deleted successfully.");
    } catch (error) {
        console.log("Error deleting the user-uploaded avatar:", error);
    }

    // Update Firestore to remove the avatarURL or set to null
    try {
        await userRef.update({
            avatarURL: firebase.firestore.FieldValue.delete()
        });
        console.log("Avatar URL removed from Firestore.");
    } catch (error) {
        console.log("Error updating Firestore:", error);
    }

    // Update the UI to default back to Google profile picture or default icon
    // Assuming googleProfilePicURL contains the URL to the user's Google profile picture
    const googleProfilePicURL = currentUser.photoURL;
    if (googleProfilePicURL) {
        loadUserAvatar(googleProfilePicURL);
    } else {
        // Set to default Font Awesome icon for all avatar elements
        const avatarElements = document.querySelectorAll('.avatar-user-icon, #user-icon');
        avatarElements.forEach(element => {
            element.outerHTML = '<i class="fas fa-user-circle ' + element.className + '" onclick="' + element.getAttribute('onclick') + '"></i>';
        });
    }
}

// Attach the clearUserAvatar function to the clear-avatar-btn click event
clearAvatarBtn.addEventListener('click', clearUserAvatar);


// 5. Sidebar ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Adjust the sidebar position when the window is resized
    

    function adjustSidebar() {
        var sidebar = document.getElementById('sidebar');
        var isDesktop = window.innerWidth > 768; // Check if it's desktop view

        // Adjust the sidebar's right position only if it's in the closed state and on desktop view
        if (sidebar.classList.contains('closed')) {
            if (isDesktop) {
                sidebar.style.right = -sidebar.offsetWidth + 'px';  // Adjust based on width if on desktop
            } else {
                sidebar.style.right = '-100%';  // Push completely off-screen on smaller screens
            }
        }
    }

// Get references to the sidebarToggle elements
var sidebarToggleNav = document.getElementById('sidebarToggleNav');

// Attach the event listener to the sidebarToggleNav element
sidebarToggleNav.addEventListener('click', toggleSidebar);

function toggleSidebar(event) {
    event.stopPropagation(); // Prevent the event from bubbling up

    var sidebar = document.getElementById('sidebar');
    var mainContainer = document.getElementById('mainContainer');
    var iconNav = document.querySelector('#sidebarToggleNav i');
    var overlay = document.getElementById('overlay'); // Get the overlay element

    var isDesktop = window.innerWidth > 768; // Check if it's desktop view

    if (sidebar.classList.contains('closed')) {
        sidebar.classList.remove('closed');
        sidebar.classList.add('open');
        mainContainer.classList.remove('main-closed');
        mainContainer.classList.add('main-open');

        // Show overlay only on non-desktop views
        if (!isDesktop) {
            overlay.style.display = 'block';
        }
    } else {
        sidebar.classList.add('closed');
        sidebar.classList.remove('open');
        mainContainer.classList.remove('main-open');
        mainContainer.classList.add('main-closed');
        iconNav.classList.remove('new-icon-class');
        iconNav.classList.add('fas', 'fa-th-list');
        overlay.style.display = 'none'; // Hide the overlay
    }
}

// This listener is to close the sidebar when clicking outside of it
document.addEventListener('click', function (event) {
    var sidebar = document.getElementById('sidebar');
    var isClickInsideSidebar = sidebar.contains(event.target);
    var isClickOnToggleNav = sidebarToggleNav.contains(event.target);

    if (!isClickInsideSidebar && !isClickOnToggleNav && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        sidebar.classList.add('closed');
        document.getElementById('mainContainer').classList.remove('main-open');
        document.getElementById('mainContainer').classList.add('main-closed');
        document.getElementById('overlay').style.display = 'none'; // Hide the overlay
    }
});

// Attach the event listener for the overlay outside to close the sidebar when the overlay is clicked
document.getElementById('overlay').addEventListener('click', toggleSidebar);

// Set the initial state of the sidebar
document.getElementById('sidebar').classList.add('closed');


// 6. Helper Functions //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    console.log('Defining Helper Functions');

    function isDifferentDay(date1, date2) {
        console.log('Executing isDifferentDay function');
        return date1.getFullYear() !== date2.getFullYear() ||
            date1.getMonth() !== date2.getMonth() ||
            date1.getDate() !== date2.getDate();
    }

    function getSeparatorText(chatDate) {
        console.log('Executing getSeparatorText function');
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const chatDay = new Date(chatDate);
        chatDay.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(now - chatDay);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return "Today";
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays <= 6) {
            return `${diffDays} days ago`;
        } else if (diffDays <= 30) {
            return "Over a week ago";
        } else {
            return "Over a month ago";
        }
    }


// 7. User Menu /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to handle clicking outside the user menu
function handleUserMenuClick(event) {
    const userMenu = document.getElementById('user-menu');
    // If the click is outside the user menu and it's open, close it
    if (userMenu && !userMenu.contains(event.target) && userMenu.classList.contains('open')) {
        userMenu.classList.remove('open');
        userMenu.classList.add('closed');
        console.log("Clicked outside, user menu closed.");  // Debug log
    }
}

// Function to toggle the visibility of the user menu
function toggleUserMenu() {
    const userMenu = document.getElementById('user-menu');

    if (userMenu.classList.contains('closed') || !userMenu.classList.contains('open')) {
        userMenu.classList.remove('closed');
        userMenu.classList.add('open');
        console.log("User menu opened.");  // Debug log
    } else {
        userMenu.classList.remove('open');
        userMenu.classList.add('closed');
        console.log("User menu closed.");  // Debug log
    }
}

// Function to close the user menu
function closeUserMenu() {
    const userMenu = document.getElementById('user-menu');
    userMenu.classList.remove('open');
    userMenu.classList.add('closed');
    console.log("User menu closed via settings button.");  // Debug log
}

// Attach event listener to the document
document.addEventListener('click', handleUserMenuClick);

// Attach event listener to the user profile icon
const userProfile = document.getElementById('userProfile');
if (userProfile) {
    userProfile.addEventListener('click', function (event) {
        // Prevent the document click event from firing
        event.stopPropagation();
        // Toggle the user menu
        toggleUserMenu();
    });
}

// Attach event listener to the settings button to close the user menu

if (settingsButton) {
    settingsButton.addEventListener('click', function () {
        closeUserMenu();
    });
}

// Stop propagation for the user menu so it doesn't close when clicking within it
const userMenu = document.getElementById('user-menu');
if (userMenu) {
    userMenu.addEventListener('click', function (event) {
        event.stopPropagation();
    });
}


// 8. API/Model Selection ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Initialize variables
let apiSelect = document.getElementById('apiSelect');
let saveApiKeyButton = document.getElementById('save-api-key-button');
let saveModelNameButton = document.getElementById('save-model-name-button');


if (apiSelect) {
    console.log('Setting up event listener for apiSelect');

    apiSelect.addEventListener('change', async function () {
        console.log('API selection changed');

        const selectedApi = apiSelect.value;

        // Update selectedApi in Firestore
        await updateUserInfoInFirestore({ selectedApi: selectedApi });

        // Show the appropriate modal based on the API selection
        if (selectedApi === 'OpenAI') {
            document.getElementById('api-key-modal').style.display = 'block';
        } else if (selectedApi === 'OpenSource') {
            document.getElementById('model-name-modal').style.display = 'block';
        }
    });
}

async function saveApiKey() {
    console.log("saveApiKey called");
    const newAPIKey = document.getElementById('api-key-input').value;
    if (newAPIKey) {
        apiKey = newAPIKey;
        await updateUserInfoInFirestore({ apiKey: newAPIKey });
        document.getElementById('api-key-modal').style.display = 'none';
    }
}

async function saveModelName() {
    console.log("saveModelName called");
    const newModelName = document.getElementById('model-name-input').value;
    if (newModelName) {
        modelName = newModelName;
        await updateUserInfoInFirestore({ modelName: newModelName });
        document.getElementById('model-name-modal').style.display = 'none';
    }
}

// Setting up event listeners for saveApiKeyButton and saveModelNameButton outside of apiSelect event listener
if (saveApiKeyButton) {
    saveApiKeyButton.removeEventListener('click', saveApiKey);
    saveApiKeyButton.addEventListener('click', saveApiKey);
}

if (saveModelNameButton) {
    saveModelNameButton.removeEventListener('click', saveModelName);
    saveModelNameButton.addEventListener('click', saveModelName);
}

document.getElementById('close-api-key-modal').addEventListener('click', function () {
    document.getElementById('api-key-modal').style.display = 'none';
});

document.getElementById('close-model-name-modal').addEventListener('click', function () {
    document.getElementById('model-name-modal').style.display = 'none';
});


// 9. Submit Button Handler /////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Load saved chats from Firestore at the beginning of your application
loadSavedChatsFromFirestore();

// DOM elements
const inputText = document.getElementById('inputText');
const chatArea = document.getElementById('chatArea');
//const modeDropdown = document.getElementById('mode-dropdown');  // Assuming you have a dropdown with ID 'mode-dropdown' for mode selection

// Make sure to replace this with the actual ID of your submit button
const submitButtonId = 'YourActualSubmitButtonIdHere';
const submitButton = document.getElementById(submitButtonId);

// Check if the submitButton exists before trying to remove the event listener
if (submitButton) {
    submitButton.removeEventListener('click', submitButtonHandler);
}
// Define the handler function
async function submitButtonHandler(event) {
    console.log('submitButton clicked');

    // Prevent event propagation
    event.stopPropagation();

    // Get user message
    const userMessage = inputText.value.trim();

    // Check if DALL-E mode is selected
    if (modeDropdown.value === 'create') {
        const response = await fetch('/generateImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: userMessage })
        });

        const data = await response.json();
        const imageURL = data.imageURL;

        // Display the image in the chat area
        const imgElement = document.createElement('img');
        imgElement.src = imageURL;
        imgElement.alt = 'Generated Image';
        imgElement.width = 200;
        chatArea.appendChild(imgElement);

        // Clear input
        inputText.value = '';
        return;
    }

    // Log the original user's message
    console.log("Original User Message:", userMessage);

    // Assuming you have a function called modifyChatbotBehaviorForMode
    let apiUserMessageObj = modifyChatbotBehaviorForMode({
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
    });

    // Log the modified message for the bot
    console.log("Message for Bot (after mode modification):", apiUserMessageObj.contentForBot || apiUserMessageObj.content);

    // Add the original user message to chat history (without modifications)
    chatHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
    });

    // Assuming you have a function called updateChatDisplay
    updateChatDisplay(chatHistory);

    if (!userMessage) return;

    // Clear input
    inputText.value = '';

    // Validate API key
    if (selectedApi === 'OpenAI' && !apiKey) {
        document.getElementById('api-key-modal').style.display = 'block';
        return;
    }

    // Prepare data for API call
    const requestBody = {
        selectedApi: selectedApi,
        apiKey: apiKey,
        modelName: modelName,
        messages: [...chatHistory, {
            role: 'user',
            content: apiUserMessageObj.contentForBot || apiUserMessageObj.content,
            timestamp: Date.now()
        }]
    };

    // Call API
    const response = await fetch('/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.result) {
        chatHistory.push({
            role: 'bot',
            content: data.result,
            timestamp: Date.now()
        });
    }

    updateChatDisplay(chatHistory);

    // Read aloud if enabled (assuming you have a function called readAloud)
    if (readAloudEnabled) {
        readAloud(data.result);
    }

    // Assuming you have functions saveChatHistory and updateExistingChatInFirestore
    if (isNewConversation) {
        await saveChatHistory();
    } else {
        await updateExistingChatInFirestore();
    }
}

// Check if the submitButton exists before trying to add the event listener
if (submitButton) {
    submitButton.addEventListener('click', submitButtonHandler);
}


// 10. Clear Chat Handler ///////////////////////////////////////////////////////////////////////////////////////////////////////////////


// DOM element for the Clear Chat button
const newChatButton = document.getElementById('newChatButton');

// Event listener for the Clear Chat button
if (newChatButton) {
    newChatButton.addEventListener('click', clearChatArea);
}

// Function to clear the chat area
function clearChatArea() {
    console.log('Clearing chat area...');

    // Clear the local chat history
    chatHistory = [];
    isNewConversation = true;
    currentChatID = null;

    // Update the chat display
    updateChatDisplay(chatHistory);

    // Remove .active-chat 
    document.querySelectorAll('.active-chat').forEach(el => {
        el.classList.remove('active-chat');
    });
}

// Function to clear the chat history
async function clearChatHistory() {
    const chatsRef = db.collection('chats');
    const snapshot = await chatsRef.get();
    snapshot.forEach(doc => {
        doc.ref.delete();
    });
    isNewConversation = true;  // Indicate that the next chat will be a new conversation
}



// Function to clear all chats in Firestore
const clearAllChatsButton = document.getElementById('clearAllChatsButton');

if (clearAllChatsButton) {
    console.log('Setting up event listener for clearAllChatsButton');

    clearAllChatsButton.addEventListener('click', async function () {
        console.log('clearAllChatsButton clicked');

        // Clear the local chat history
        localStorage.setItem('savedChats', JSON.stringify([]));

        // Continuously delete chats in batches until all are cleared
        const chatsRef = db.collection('savedChats');
        let deletionPending = true;
        while (deletionPending) {
            const snapshot = await chatsRef.limit(50).get();  // Fetching in batches of 50
            if (snapshot.empty) {
                deletionPending = false;  // If no chats are fetched, exit the loop
            } else {
                const batch = db.batch();
                snapshot.docs.forEach((doc) => {
                    console.log(`Scheduling deletion for chat with ID: ${doc.id}`);  // Print document ID
                    batch.delete(doc.ref);  // Schedule a delete operation for the document
                });
                await batch.commit();  // Commit the batch deletion
            }
        }

        // Update the list of saved chats on the UI
        await updateSavedChatsList();
    });
}

   
// 11. Read Aloud //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    console.log("Entered Read Aloud Section");


    // DOM Loaded Event
    window.addEventListener('DOMContentLoaded', () => {
        console.log("DOM fully loaded, setting initial state for Read Aloud");
        const readAloudToggle = document.getElementById('readAloudToggle');
        if (readAloudToggle) {
            // Event Listener for toggle change
            readAloudToggle.addEventListener('change', async () => {
                console.log("Read Aloud Toggle changed");
                readAloudEnabled = readAloudToggle.checked;
                const userId = firebase.auth().currentUser.uid;
                const userRef = db.collection('users').doc(userId);
                try {
                    await userRef.update({ readAloudEnabled: readAloudEnabled });
                    console.log("Read aloud state saved to Firestore.");
                    // Save state to localStorage as well
                    localStorage.setItem('readAloudEnabled', readAloudEnabled);
                } catch (error) {
                    console.log("Error updating read aloud state: ", error);
                }
            });
        }
    });

    // Code to handle readAloudToggle click event
    const readAloudToggle = document.getElementById('readAloudToggle');
    if (readAloudToggle) {
        // Event Listener for readAloudToggle click
        readAloudToggle.addEventListener('click', () => {
            console.log("Read Aloud Toggle clicked");  // Log for toggle clicked

            // Manually toggle the readAloudEnabled state
            readAloudEnabled = !readAloudEnabled;
            console.log("Manually toggled readAloudEnabled to:", readAloudEnabled);  // Log for toggle state

            // Update the checked state of the toggle
            readAloudToggle.checked = readAloudEnabled;

            // Save the state to localStorage
            localStorage.setItem('readAloudEnabled', readAloudEnabled);

            // Update Firestore if user is logged in
            if (firebase.auth().currentUser) {
                const userId = firebase.auth().currentUser.uid;
                const userRef = db.collection('users').doc(userId);
                userRef.update({ readAloudEnabled: readAloudEnabled })
                    .then(() => {
                        console.log("Read aloud state updated in Firestore.");  // Log for successful Firestore update
                    })
                    .catch((error) => {
                        console.log("Error updating read aloud state in Firestore: ", error);  // Log for Firestore update error
                    });
            }
        });
    }



////////// Eleven Labs ////////////////////////

// Eleven Labs API key and URL
const TTS_API_KEY = 'd67ccace1d6cf12546a1767fb1e672a2';
const VOICE_ID = '7IbgKAqJBjOWEb2ILByC'; // Replace with the appropriate voice ID
const TTS_API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

async function readAloud(text) {
    console.log('Starting readAloud function with text:', text);

    // Set options for the API request
    const options = {
        method: 'POST',
        headers: {
            accept: 'audio/mpeg', // Set the expected response type to audio/mpeg
            'content-type': 'application/json', // Set the content type to application/json
            'xi-api-key': `${TTS_API_KEY}`, // Set the API key in the headers
        },
        body: JSON.stringify({ text: text }) // Pass in the text to be converted to speech
    };

    // Make the request to the API
    console.log('Sending request to API...');
    const response = await fetch(TTS_API_URL, options);

    // Check for successful response
    if (!response.ok) {
        console.error('Error in API response:', response.statusText);
        return;
    }

    // Get the audio data from the response as ArrayBuffer
    const audioData = await response.arrayBuffer();
    console.log('Received audio data from API.');

    // Convert the audio data to a Blob with MIME type 'audio/mpeg'
    const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
    console.log('Converted audio data to Blob.');

    // Create an Object URL from the Blob
    const audioUrl = URL.createObjectURL(audioBlob);
    console.log('Created Object URL for audio:', audioUrl);

    // Create an audio element
    const audioElement = new Audio(audioUrl);
    console.log('Created audio element.');

    // Play the audio
    audioElement.play();
    console.log('Playing audio.');
}


if (inputText) {
    inputText.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitButton.click();
        }
    });
}


// 12. Avatar Upload ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to handle user avatar upload
function handleUserAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const storageRef = firebase.storage().ref('avatars/' + file.name);
        storageRef.put(file).then(snapshot => {
            snapshot.ref.getDownloadURL().then(downloadURL => {
                userUpload = downloadURL;
                updateChatDisplay();

                // Save the download URL to Firestore
                if (firebase.auth().currentUser) {
                    const userId = firebase.auth().currentUser.uid;

                    // Define userRef here
                    const userRef = firebase.firestore().collection('users').doc(userId);

                    userRef.set({ avatarURL: downloadURL }, { merge: true });
                }
            });
        });
    }
}


// 13. Event Listeners /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
    // All your DOM related initializations and event bindings

    const inputText = document.getElementById('inputText');
    const submitButton = document.getElementById('submitButton');
    const newChatButton = document.getElementById('newChatButton');
    const apiSelect = document.getElementById('apiSelect');
    const apiKeyDisplay = document.getElementById('apiKeyDisplay');
    const modelNameDisplay = document.getElementById('modelNameDisplay');
    const confirmModal = document.getElementById('confirmModal');
    const yesButton = document.getElementById('yesButton');
    const noButton = document.getElementById('noButton');

    // Upload User Avatar
    const userAvatarInput = document.getElementById('userAvatarInput');
    userAvatarInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        const storageRef = firebase.storage().ref('avatars/' + file.name);
        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed',
            function (snapshot) {
                // Handle the upload
            },
            function (error) {
                // Handle upload errors
                console.error("Error uploading avatar:", error);
            },
            function () {
                // Successful upload
                uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    console.log('Uploaded file available at', downloadURL);

                    // Save the URL to Firestore
                    const userRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid);
                    userRef.update({
                        avatarURL: downloadURL
                    });

                    // This is where we should be updating the avatars without a page refresh
                    loadUserAvatar(downloadURL);
                });
            }
        );
    });

});


// Firebase User Authentication State Change Listener
firebase.auth().onAuthStateChanged(async function (user) {
    if (user) {
        console.log('User authenticated. UID:', user.uid);
        currentUser = user;  // Set the global user variable

        // Load chat history and saved chats list AFTER confirming user authentication
        await loadChatHistoryFromFirestore();
        await updateSavedChatsList();

        // Fetch the saved mode from Firebase
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().selectedMode) {
            currentMode = userDoc.data().selectedMode;

            // Update the dropdown to reflect the saved mode
            console.log(modeDropdown);
            modeDropdown.value = currentMode;

            // Update the system message in the navbar
            document.getElementById('systemMessages').textContent = `You are in ${currentMode} mode`;

        }

    } else {
        console.log('User not authenticated or logged out.');
        currentUser = null;  // Reset the global user variable
    }
});


// 14. Chat Display ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Code Syntax Highlighting ///
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
});

// Function to handle the copy code button click event
async function handleCopyButtonClick(event) {
    const content = event.target.getAttribute('data-content');
    console.log('Attempting to copy:', content);

    try {
        await navigator.clipboard.writeText(content);
        console.log('Code copied successfully using Clipboard API!');
    } catch (err) {
        console.warn('Clipboard API failed, using fallback:', err);

        // Check if execCommand is available in the document
        if (document.execCommand) {
            console.log('execCommand is available. Trying to use it.');

            const textArea = document.createElement('textarea');
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    console.log('Code copied successfully using execCommand!');
                } else {
                    console.error('Failed to copy using execCommand. No exception thrown.');
                    alert('Failed to copy code!');
                }
            } catch (err) {
                alert('Failed to copy code!');
                console.error('execCommand method threw an exception:', err);
            }

            // Clean up
            document.body.removeChild(textArea);
        } else {
            console.error('Both Clipboard API and execCommand are unavailable.');
            alert('Failed to copy code. Both methods are unavailable.');
        }
    }
}

function encodeContent(content) {
    return content.replace(/"/g, '&quot;');
}


// Setup event listeners for copy code buttons
function setupCodeCopyEventListeners() {
    console.log('setupCodeCopyEventListeners called');

    // Select all the buttons with the class '.copy-code-btn' within the chatArea
    const copyButtons = chatArea.querySelectorAll('.copy-code-btn');
    console.log(`Found ${copyButtons.length} copy code buttons`);

    // For each button found
    copyButtons.forEach(btn => {
        // Before adding the event listener, check if it has already been added
        if (!btn.hasAttribute('data-listener-added')) {
            btn.setAttribute('data-listener-added', 'true'); // Mark the button as having the listener

            // Add the event listener to the button
            btn.addEventListener('click', async function () {
                console.log('Copy code button clicked');
                // Get the content that needs to be copied from the data-content attribute
                const content = this.getAttribute('data-content');
                console.log('Attempting to copy:', content);

                // Try using the Clipboard API to copy the content
                try {
                    await navigator.clipboard.writeText(content);
                    console.log('Code copied successfully using Clipboard API!');

                    // Update the button's text to show the checkmark and "Copied"
                    this.textContent = '✔ Copied!';

                    // Revert the button's text back to "Copy Code" after 2 seconds
                    setTimeout(() => {
                        this.textContent = 'Copy Code';
                    }, 2000);

                } catch (err) {
                    console.warn('Clipboard API failed, using fallback:', err);

                    // The rest of the fallback code to handle browsers that don't support the Clipboard API
                    // ... (rest of the fallback code remains unchanged)
                }
            });
        }
    });
}


// Function to update display
function updateDisplay(selectedApi, apiKey, modelName) {
    console.log('Executing updateDisplay function');
    modelNameDisplay.innerText = '';
    apiKeyDisplay.innerText = '';

    if (selectedApi === 'OpenAI' && apiKey) {
        apiKeyDisplay.innerText = `API Key: ${apiKey.slice(-5)}...`;
    } else if (selectedApi === 'OpenSource' && modelName) {
        modelNameDisplay.innerText = `Model: ${modelName}`;
    }
}

// Chat Display Functions
function updateChatDisplay(chats) {
    console.log("Executing updateChatDisplay function with chats:", chats);

    const currentAvatarElement = document.querySelector('.avatar-user-icon');
    let currentAvatar = currentAvatarElement ? currentAvatarElement.src : null;

    function formatCodeMessage(msg) {
        const regex = /```(.*?)\n([\s\S]*?)```/g;
        return msg.replace(regex, (match, lang, codeContent) => {
            const encodedContent = encodeContent(codeContent.trim());
            return `
        <div class="code-container">
            <span class="language-name">${lang.toUpperCase()}</span>
            <pre><code class="language-${lang}">${codeContent}</code></pre>
            <button class="copy-code-btn" data-content="${encodedContent}">Copy Code</button>
        </div>`;
        });
    }


    chatArea.innerHTML = chatHistory.map((msg, index) => {
        let timestamp = new Date(msg.timestamp).toLocaleString();
        let formattedMessage = formatCodeMessage(msg.content);

        return `
    <div class="message-wrapper ${msg.role === 'user' ? 'user-wrapper' : 'bot-wrapper'}">
    ${msg.role === 'user' ? (currentAvatar ? `<img class="avatar-user-icon" src="${currentAvatar}" onclick="document.getElementById('userAvatarInput').click()">` : `<i class="fas fa-user-circle avatar-user-icon" onclick="document.getElementById('userAvatarInput').click()"></i>`) : `<img class="avatar avatar-bot" src="images/ChatbotAvatar.png">`}
    <div class="message-container ${msg.role === 'user' ? 'message-container-user' : 'message-container-bot'}">
        <div class="message ${msg.role === 'user' ? 'message-user' : 'message-bot'}">${formattedMessage}</div>
        <div class="timestamp-container">
            <small class="timestamp">${timestamp}</small>
            <i class="far fa-times-circle delete-message-btn" onclick="deleteMessage(${index})"></i>
        </div>
    </div>
</div>
`;
    }).join('');

    // Extract the language from the CSS class and add it to the language-name span
    const codeBlocks = chatArea.querySelectorAll('code.hljs');
    codeBlocks.forEach(block => {
        const language = block.classList[1]; // the 2nd class contains the language

        // Get the parent language-name span
        const languageNameSpan = block.closest('.code-container').querySelector('.language-name');

        if (languageNameSpan && language) {
            languageNameSpan.innerText = language.toUpperCase();
        }
    });

    const userIconElement = document.getElementById('user-icon');
    if (currentAvatar && userIconElement) {
        userIconElement.outerHTML = `<img src="${currentAvatar}" alt="User Avatar" id="user-icon" />`;
    }

    const chatMessages = chatArea.querySelectorAll('.message');
    if (chatMessages.length > 0) {
        const latestMessage = chatMessages[chatMessages.length - 1];
        latestMessage.scrollIntoView();
    }

    // Use setTimeout to defer the setupCodeCopyEventListeners execution
    setTimeout(() => {
        setupCodeCopyEventListeners();
    }, 0);

    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
}




function deleteMessage(index) {
    chatHistory.splice(index, 1); // Remove the message from chatHistory
    updateChatDisplay(chatHistory); // Refresh the display
}

function displaySavedChats(chatsQuery) {
    // Display each chat document in the sidebar
    chatsQuery.forEach(doc => {
        // Implementation for displaying chats in the sidebar would go here.
    });
}


// 15. Chat Savings ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Global variable to store the Firestore document ID of the current chat
let currentChatID = null;

// Global variable to indicate if a new conversation has started
let isNewConversation = true;

// Function to get user-specific chat reference
function getUserChatsRef(userId) {
    console.log('Getting user-specific chat reference...');
    return db.collection('users').doc(userId).collection('chats');
}

async function addMessageToChat(role, message, caller = "Unknown") {
    console.log(`Adding message to chat from ${caller}...`);

    // Create the message object
    const messageObject = {
        role: role,
        content: message,
        timestamp: Date.now()
    };

    // Add the message to chatHistory
    chatHistory.push(messageObject);
    console.log('Message added to chatHistory.');

    // Update the chat display
    updateChatDisplay(chatHistory);

    // Save the updated chat history to Firestore
    if (isNewConversation) {
        await saveChatHistory();
    } else {
        await updateExistingChatInFirestore();
    }
}


async function updateExistingChatInFirestore() {
    console.log('Updating existing chat in Firestore...');
    const userId = firebase.auth().currentUser.uid;
    if (currentChatID) {
        try {
            const docRef = getUserChatsRef(userId).doc(currentChatID);
            await docRef.update({
                history: chatHistory,
                timestamp: Date.now()
            });
            console.log('Chat updated in Firestore with ID:', currentChatID);
        } catch (error) {
            console.error('Error updating chat:', error);
        }
    } else {
        console.log('currentChatID is null. No chat to update.');
    }
}

async function saveChatHistory() {
    console.trace("Tracing saveChatHistory call");

    console.log('Executing saveChatHistory function...');

    // Open the sidebar if it's not already open
    var sidebar = document.getElementById('sidebar');
    var mainContainer = document.getElementById('mainContainer');
    var isSidebarOpen = sidebar.classList.contains('open');
    if (!isSidebarOpen) {
        sidebar.classList.remove('closed');
        sidebar.classList.add('open');
        mainContainer.classList.remove('main-closed');
        mainContainer.classList.add('main-open');
    }

    // Generate the title request message for OpenAI to process
    const titleRequestMessage = 'Please generate a conversation title based on the context that best describes the question being asked. Please keep the title under 25 characters and to the point and format it as "conversationTitle: [Title]".';
    chatHistory.push({
        role: 'user',
        content: titleRequestMessage,
        timestamp: Date.now(),
        isTitleRequest: true
    });

    try {
        // API call to get the conversation title from OpenAI
        let response = await fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                selectedApi: selectedApi,
                apiKey: apiKey,
                modelName: modelName,
                messages: chatHistory
            })
        });

        let data = await response.json();
        if (data.result) {
            // Extract conversation title from the API response
            const titleStartIndex = data.result.indexOf('conversationTitle: ');
            if (titleStartIndex !== -1) {
                let conversationTitle = data.result.slice(titleStartIndex + 'conversationTitle: '.length);
                conversationTitle = conversationTitle.replace(/[\\/:*?"<>|]/g, " ").trim();

                // Remove the title request message from chat history
                chatHistory.pop();

                // Prepare the chat object to save in Firestore
                const savedChat = {
                    title: conversationTitle,
                    history: chatHistory,
                    timestamp: Date.now()
                };

                // Save chat to Firestore and set the currentChatID
                const docRef = await saveChatToFirestore(savedChat);
                console.log('Chat saved to Firestore with ID: ', docRef.id);
                currentChatID = docRef.id;

                // Reset the isNewConversation flag
                console.log("saveChatHistory: Resetting isNewConversation to false");
                isNewConversation = false;

                // Update UI
                updateChatDisplay(chatHistory);
                updateSavedChatsList();
            }
        } else {
            console.error('Server error:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function saveChatToFirestore(savedChat) {
    console.log('Saving chat to Firestore...');
    const userId = firebase.auth().currentUser.uid;
    const chatsRef = getUserChatsRef(userId);
    try {
        const docRef = await chatsRef.add(savedChat);
        console.log('Chat saved with ID: ', docRef.id);
        return docRef;
    } catch (error) {
        console.error('Error saving chat:', error);
    }
}

async function clearChatHistory() {
    console.log('Clearing chat history...');
    const userId = firebase.auth().currentUser.uid;
    console.log("Current savedChatsList before update:", savedChatsList.innerHTML);

    // Clear the chat history in Firestore for the logged-in user
    const chatsRef = getUserChatsRef(userId);
    const snapshot = await chatsRef.get();
    snapshot.forEach(doc => {
        doc.ref.delete();
    });

    // Clear the local chat history
    chatHistory = [];
    isNewConversation = true;
    currentChatID = null;

    // Update the chat display and the saved chats list
    updateChatDisplay(chatHistory);
    updateSavedChatsList();
    console.log("Current savedChatsList after update:", savedChatsList.innerHTML);
}

function saveMessageToFirestore(role, message) {
    console.log(`Saving ${role} message to Firestore...`);
    const currentChatRef = db.collection('currentChat');
    const messageObject = {
        role: role,
        content: message,
        timestamp: Date.now()
    };

    currentChatRef.add(messageObject)
        .then((docRef) => {
            console.log(`${role} message saved with ID: `, docRef.id);
        })
        .catch((error) => {
            console.error(`Error saving ${role} message: `, error);
        });
}

async function updateSavedChatsList() {
    // Log the start of the function
    console.log('Updating saved chats list...');

    // Get the user ID from Firebase authentication
    const userId = firebase.auth().currentUser.uid;

    // Get the reference to the user's chats in Firestore
    const chatsRef = getUserChatsRef(userId);

    // Clear the saved chats list in the DOM
    savedChatsList.innerHTML = '';

    try {
        // Fetch the chats from Firestore, ordered by timestamp in descending order
        const querySnapshot = await chatsRef.orderBy("timestamp", "desc").get();

        // Loop through each chat document
        querySnapshot.forEach((doc) => {
            const chat = doc.data(); // Extract the chat data

            // Create DOM elements for each chat item in the list
            const listItem = document.createElement('li');
            const listItemWrapper = document.createElement('div');
            listItemWrapper.className = 'list-item-wrapper';

            const titleAndTrashContainer = document.createElement('div');
            titleAndTrashContainer.className = 'titleAndTrashContainer';

            const title = document.createElement('span');
            title.className = 'title';
            title.textContent = chat.title.trim();
            title.title = chat.title.trim();

            // Create a delete button for each chat item
            const deleteButton = document.createElement('i');
            deleteButton.className = 'far fa-trash-alt';
            deleteButton.addEventListener('click', async (event) => {
                event.stopPropagation();
                try {
                    await doc.ref.delete(); // Delete the chat from Firestore

                    // Check if the chat being deleted is the currently active chat
                    if (currentChatID === doc.id) {
                        chatHistory = []; // Clear the chat history
                        currentChatID = null; // Reset the current chat ID
                        updateChatDisplay(); // Clear the chat area
                    }

                    await updateSavedChatsList(); // Refresh the chat list in the DOM
                } catch (error) {
                    console.error("Error deleting chat: ", error);
                }
            });

            // Create a download button for each chat item
            const downloadButton = document.createElement('i');
            downloadButton.className = 'fas fa-download';
            downloadButton.addEventListener('click', (event) => {
                event.stopPropagation();
                downloadChatAsHTML(chat); // Download the chat as an HTML file
            });

            // Append the elements to their respective containers
            titleAndTrashContainer.appendChild(title);
            titleAndTrashContainer.appendChild(deleteButton);
            titleAndTrashContainer.appendChild(downloadButton);
            listItemWrapper.appendChild(titleAndTrashContainer);
            listItem.appendChild(listItemWrapper);

            // Add a click event listener to each chat item
            listItem.addEventListener('click', async () => {
                // Remove .active-chat class from all chats in the list
                document.querySelectorAll('.active-chat').forEach(el => {
                    el.classList.remove('active-chat');
                });

                // Add .active-chat class to the clicked chat
                title.classList.add('active-chat');

                // Set the chat history, ID, and status
                chatHistory = chat.history;
                currentChatID = doc.id;
                isNewConversation = false;
                
                // Update the timestamp of the selected chat in Firestore to make it the most recent
                try {
                    await doc.ref.update({
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    // Refresh the saved chats list in the DOM after updating the timestamp
                    await updateSavedChatsList();
                } catch (error) {
                    console.error("Error updating chat timestamp: ", error);
                }

                // Refresh the main chat display in the DOM
                updateChatDisplay();
            });

            // Append the chat item to the saved chats list in the DOM
            savedChatsList.appendChild(listItem);
        });
    } catch (error) {
        // Log any errors that occur
        console.error("Error fetching chats: ", error);
    }
}


async function updateUserInfoInFirestore(data) {
    console.log('Updating user info in Firestore...');
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
        const userId = currentUser.uid;
        const userRef = db.collection('users').doc(userId);
        await userRef.update(data);
        console.log('User info updated in Firestore');
    } else {
        console.log('User not logged in. Could not update Firestore.');
    }
}

async function updateApiKeyInFirestore(newApiKey) {
    console.log('Updating API key in Firestore...');
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
        const userId = currentUser.uid;
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            apiKey: newApiKey
        });
        console.log('API key updated in Firestore');
    } else {
        console.log('User not logged in. Could not update API key in Firestore.');
    }
}

// Function to load chat history from Firestore when the page loads or when the user logs in
async function loadChatHistoryFromFirestore() {
    console.log("Attempting to load chat history from Firestore...");

    const currentUser = firebase.auth().currentUser;  // Get the current user object

    // Check if the user is authenticated
    if (!currentUser) {
        console.log("User is not logged in. Exiting loadChatHistoryFromFirestore function early.");
        return;  // If the user is not logged in, don't proceed
    }

    const userId = currentUser.uid;  // Now, it's safe to access the uid
    const chatsRef = getUserChatsRef(userId);

    try {
        const latestChatDoc = await chatsRef.orderBy("timestamp", "desc").limit(1).get();

        if (!latestChatDoc.empty) {
            const latestChat = latestChatDoc.docs[0].data();
            chatHistory = latestChat.history;
            currentChatID = latestChatDoc.docs[0].id;

            // Set isNewConversation to false since chat history exists
            isNewConversation = false;

            console.log("Chat history successfully fetched from Firestore. Updating chat display...");
            updateChatDisplay(chatHistory);
        } else {
            console.log("No chat history found for the user in Firestore.");
        }
    } catch (error) {
        console.error("Error fetching chat history from Firestore:", error);
    }
    // After loading the chat history and updating the DOM, reapply the syntax highlighting:
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
}


// 16. Download Chats /////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//// Download Chat to HTML ////

function getCSSVariables() {
    // Get the root style (":root") to access CSS variables
    const rootStyle = getComputedStyle(document.documentElement);
    let variables = '';

    // Iterate through the properties to find variables (those starting with "--")
    for (const prop of rootStyle) {
        if (prop.startsWith('--')) {
            variables += `${prop}: ${rootStyle.getPropertyValue(prop)};`;
        }
    }

    return variables;
}


// Extract CSS variables
const cssVariables = getCSSVariables();

function downloadChatAsHTML() {
    // Get the user avatar from the displayed image in the chat area
    const userAvatarElement = document.querySelector('.avatar-user-icon');
    const userAvatarSrc = userAvatarElement ? userAvatarElement.src : '';

    // Use the correct path for the bot avatar
    const botAvatarSrc = 'images/ChatbotAvatar.png';

    Promise.all([
        userAvatarSrc, // No need to encode as Base64, as it's already displayed on the page
        encodeImageFileAsBase64(botAvatarSrc)
    ])
        .then(([userAvatar, botAvatar]) => {
            // Create the HTML content
            const htmlContent = `
        <!DOCTYPE html>
     <html>
    <head>
        <style>
            /* Global styling for the body */
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                padding: 10px;
            }

            /* Styling for the container that holds each message */
            .message-container {
                display: flex;
                width: 60%;
                margin-bottom: 10px;
            }

            /* Styling for the assistant's message container, aligning to the left */
            .assistant-container {
                align-items: flex-start;
                flex-direction: row; /* Avatar on the left */
            }

            /* Styling for the user's message container, aligning to the right */
            .user-container {
                align-items: flex-end;
                flex-direction: row-reverse; /* Avatar on the right */
            }

            /* Container for the avatar and message */
            .message-avatar-container {
                display: flex;
            }

            /* General styling for the message bubble */
            .message {
                padding: 10px;
                border-radius: 15px;
                line-height: 1.5;
                position: relative;
                margin: 5px;
            }

            /* Styling for the assistant's message bubble */
            .bot {
                background-color: #e3f2fd;
                color: #000000;
                border: 1px solid #012d4b;
            }

            /* Styling for the user's message bubble */
            .user {
                background-color: #b3e5fc;
                color: #000000;
                border: 1px solid #4b4b4b;
            }

            /* Styling for the avatar image */
            .avatar {
                border-radius: 50%;
                height: 50px;
                width: 50px;
                margin: 5px;
                border: 2px solid #4b4b4b;
            }
        </style>
    </head>
            <body>
                <div class="chat-container">
                    ${chatHistory.map(msg => {
                const avatar = msg.role === 'user' ? userAvatar : botAvatar;
                const timestamp = new Date(msg.timestamp).toLocaleString();
                const timestampWrapper = msg.role === 'user' ? 'user-timestamp-wrapper' : 'bot-timestamp-wrapper';
                return `
                        <div class="message-container ${msg.role}-container">
                            <div class="message-avatar-container">
                                <img class="avatar" src="${avatar}">
                                <div class="message-wrapper">
                                    <div class="${timestampWrapper}"><div class="timestamp">${timestamp}</div></div>
                                    <div class="message ${msg.role}">${msg.content}</div>
                                </div>
                            </div>
                        </div>
                        `;
            }).join('')}
                </div>
            </body>
        </html>`;
            // Create a blob from the HTML content and download it
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Chat History.html'; // You can adjust the download file name here
            link.click();
            URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error encoding images:', error);
        });
}


// 17. Themes /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let themeChoices;

// Function to get saved theme
async function getSavedTheme() {
    console.log("getSavedTheme called");
    if (!auth.currentUser) {
        console.log("No user logged in");
        return null;
    }
    const userId = auth.currentUser.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
        console.log("Got user doc");
        const savedTheme = userDoc.data().selectedTheme;
        console.log("Got saved theme:", savedTheme);
        return savedTheme;
    } else {
        console.log("No user doc found");
        return null;
    }
}

// Function to save theme selection
async function saveThemeSelection(theme) {
    console.log("saveThemeSelection called with:", theme);
    if (!auth.currentUser) {
        console.log("No user logged in");
        return;
    }
    const userId = auth.currentUser.uid;
    const userDocRef = db.collection('users').doc(userId);
    try {
        await userDocRef.update({ selectedTheme: theme });
        console.log("Saved theme selection");
    } catch (err) {
        console.error("Error saving theme:", err);
    }
}

// Function to load theme
function loadTheme(themeName) {
    console.log("loadTheme called with:", themeName);
    const themeStylesheet = document.getElementById('theme-stylesheet');
    themeStylesheet.href = `/css_files/color_themes/${themeName}.css`;
    console.log("Set theme stylesheet href");
}

// DOMContentLoaded handler
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded handler");
    const themeDropdown = document.getElementById('theme-dropdown');
    if (!themeDropdown) {
        console.error("Could not find themeDropdown element");
        return;
    }

    // Fetch theme data
    fetch("/themes")
        .then(res => res.json())
        .then(themes => {
            console.log("Received Themes:", themes);
            console.log(themes);
            // Sort themes alphabetically
            const sortedThemes = themes.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));


            // Add options to dropdown
            sortedThemes.forEach(theme => {
                const option = document.createElement('option');
                option.value = theme.name;
                option.innerHTML = `<span class="theme-color-square" style="background-color: ${theme.color}"></span> ${theme.name}`;
                themeDropdown.appendChild(option);
            });

            // Initialize Choices
            themeChoices = new Choices(themeDropdown, {
                itemSelectText: '',
                removeItemButton: true,
                shouldSortItems: false,
                sorter: function (a, b) {     
                }
            });
        })
        .catch(err => {
            console.error("Error fetching themes data:", err);
        });

    async function applySavedTheme() {
        const savedTheme = await getSavedTheme();
        if (savedTheme) {
            // Load theme
            loadTheme(savedTheme);
            // Set dropdown value
            themeDropdown.value = savedTheme;
            if (themeChoices) {
                themeChoices.setChoiceByValue(savedTheme);
            }
        } else {
            console.log("No saved theme");
        }
    }

    // Theme dropdown change handler
    themeDropdown.addEventListener('change', async event => {
        const selectedTheme = event.target.value;
        await saveThemeSelection(selectedTheme);
        loadTheme(selectedTheme);
        if (themeChoices) {
            themeChoices.setChoiceByValue(selectedTheme);
        }
    });

    // Apply theme on auth state change
    auth.onAuthStateChanged(async user => {
        if (user) {
            await applySavedTheme();
        }
    });

    // Apply saved theme on page load
    applySavedTheme();
});


// 18. Chatbot Mode ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let systemMessage = {};  // Define a global variable to store the system message

// Modify the behavior of the chatbot based on the mode
function modifyChatbotBehaviorForMode(message) {
    switch (currentMode) {
        case 'coding':
            systemMessage = {
                role: "system",
                content: "You are an expert coder proficient in multiple programming languages. Provide detailed responses on coding, programming concepts, algorithms, debugging, software architecture, and best practices. Offer helpful suggestions, tips, and examples to assist users in their coding journey."
            };
            message.contentForBot = `Please provide the code wrapped in triple backticks. Also, start all coding responses with the type of code being used: python, javascript, html, css, sql, csharp, java, etc. ${message.content}`;
            break;
        case 'chat':
            systemMessage = {
                role: "system",
                content: "You are a friendly and empathetic companion who offers support and advice. Act as a trustworthy friend or counselor, providing a listening ear and guidance on various topics. Offer encouragement, understanding, and practical suggestions to help users navigate their challenges and improve their well-being."
            };
            break;
        case 'create':
            systemMessage = {
                role: "system",
                content: "You are an artistic generator with a wide range of creative abilities. Produce unique and imaginative artwork in various styles and mediums. Generate original designs, paintings, illustrations, or sculptures, and describe the artistic techniques employed. Inspire users with your creativity and provide insights into the artistic process."
            };
            break;
        default:
            systemMessage = {};
            break;
    }
    return message;
}

document.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });

    modeDropdown = document.getElementById('mode-dropdown');
    if (!modeDropdown) {
        console.error("Mode dropdown element not found!");
        return;
    }

    currentMode = modeDropdown.value; // Set the initial mode based on dropdown value
    modeDropdown.addEventListener('change', async function () {
        currentMode = modeDropdown.value;
        console.log("Mode changed to:", currentMode);



        if (firebase.auth().currentUser) {
            const userId = firebase.auth().currentUser.uid;
            await firebase.firestore().collection('users').doc(userId).set({
                selectedMode: currentMode
            }, { merge: true });
        }
    });

    const originalSubmitButtonHandler = submitButtonHandler;

    async function modifiedSubmitButtonHandler(event) {
        let userMessageObj = {
            role: 'user',
            content: inputText.value.trim(),
            timestamp: Date.now()
        };

        userMessageObj = modifyChatbotBehaviorForMode(userMessageObj);
        inputText.value = userMessageObj.content;
        await originalSubmitButtonHandler(event);

        if (currentMode === 'coding') {
            const lastMessage = chatHistory[chatHistory.length - 1];
            if (lastMessage && lastMessage.role === 'bot') {
                const languageMapping = {
                    'python script': 'python',
                    'python code': 'python',
                    'javascript function': 'javascript',
                    'html code': 'html',
                    'css code': 'css',
                    'sql query': 'sql',
                    'c# code': 'csharp',
                    'java code': 'java',
                };

                let detectedLanguage = Object.keys(languageMapping).find(phrase => lastMessage.content.toLowerCase().includes(phrase));
                if (detectedLanguage) {
                    const codeStartIndex = lastMessage.content.indexOf(':') + 1;
                    const codeContent = lastMessage.content.substring(codeStartIndex).trim();
                    const nonCodeContent = lastMessage.content.substring(0, codeStartIndex).trim();

                    lastMessage.content = `<span class="language-name">${detectedLanguage.toUpperCase()}</span> ${nonCodeContent}\n\n\`\`\`${detectedLanguage}\n${codeContent}\n\`\`\``;
                } else if (lastMessage.content.includes('{') || lastMessage.content.includes(';')) {
                    lastMessage.content = `\`\`\`\n${lastMessage.content}\n\`\`\``;
                }

                console.log("Post-processed Bot Response:", lastMessage.content);
            }

            const codeBlocks = chatArea.querySelectorAll('pre code');
            codeBlocks.forEach((block) => {
                hljs.highlightBlock(block);
            });
        }
    }

    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.removeEventListener('click', originalSubmitButtonHandler);
        submitButton.addEventListener('click', modifiedSubmitButtonHandler);
    } else {
        console.error("Submit button not found!");
    }

});


// 19. LLM Model Selection ////////////////////////////////////////////////////////////////////////////////////////////////////////////

function selectModel(selectedModel) {
    // Deselect all models
    let models = document.querySelectorAll('.model-selection li');
    models.forEach(model => {
        model.classList.remove('selected');
    });

    // Select the clicked model
    selectedModel.classList.add('selected');
}