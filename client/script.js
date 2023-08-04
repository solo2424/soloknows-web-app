// Global Declarations
let chatHistory;
let savedChats;
let apiKey;
let modelName;
let selectedApi;
let userAvatar;

if (document.readyState === 'loading') {  // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', initialize);
} else {  // `DOMContentLoaded` has already fired
    initialize();
}

function initialize() {
    console.log('DOM Content Loaded');

    // Load Variables
    console.log('Loading Global Variables');
    chatHistory = localStorage.getItem('chatHistory') ? JSON.parse(localStorage.getItem('chatHistory')) : [];
    console.log('Loaded chatHistory');
    savedChats = localStorage.getItem('savedChats') ? JSON.parse(localStorage.getItem('savedChats')) : [];
    console.log('Loaded savedChats');
    apiKey = localStorage.getItem('apiKey') || '';
    console.log('Loaded apiKey');
    modelName = localStorage.getItem('modelName') || '';
    console.log('Loaded modelName');
    selectedApi = localStorage.getItem('selectedApi') || 'OpenAI';
    console.log('Loaded selectedApi');
    userAvatar = 'images/UserAvatar.png';
    console.log('Loaded userAvatar');

    // After loading apiKey, modelName, and selectedApi from localStorage, call updateDisplay
    updateDisplay(selectedApi, apiKey, modelName);

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyBF0KDFT26Jp_04cSzvPQah9a4ZD1m5Ap8",
        authDomain: "soloknows-32b12.firebaseapp.com",
        projectId: "soloknows-32b12",
        storageBucket: "soloknows-32b12.appspot.com",
        messagingSenderId: "672545320344",
        appId: "1:672545320344:web:4a16fb010c474341c74fed",
        measurementId: "G-QVM86WRPBC"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase Initialized');
    const auth = firebase.auth();
    const db = firebase.firestore();
    console.log('Initializing Firebase');

    // Initialize Google Provider
    const provider = new firebase.auth.GoogleAuthProvider();

    // Get the HTML elements with the respective IDs
    const googleLoginButton = document.getElementById('google-login-button'); // The button to open the Google login

    // Google Login Button
    if (googleLoginButton) {
        console.log('Google Login button found');
        googleLoginButton.addEventListener('click', (e) => {
            console.log('Google Login button clicked');

            e.preventDefault();  // Prevent the button from submitting the form

            // Start Google login
            auth.signInWithPopup(provider).then((result) => {
                // User is signed in, hide the login form and show the main app
                mainContainer.style.display = 'block';
                sidebar.style.display = 'block';
                loginPopup.style.display = 'none';
                signupPopup.style.display = 'none';
            }).catch((error) => {
                // Handle Errors here.
                console.log('Error during Google Login:', error);
            });
        });
    } else {
        console.log('Google Login button not found');
    }
    // Get the HTML elements with the respective IDs
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    console.log(signupForm);
    const mainContainer = document.getElementById('mainContainer');
    const sidebar = document.getElementById('sidebar');
    const loginPopup = document.getElementById('login-popup');
    const signupPopup = document.getElementById('signup-popup');
    const signupButton = document.getElementById('signup-button'); // The button to open the signup form
    console.log(signupButton);
    const logoutButton = document.getElementById('logout-button');
    const loginButton = document.getElementById('login-button'); // The button to open the login form
    console.log(loginButton);
    const gotoSignupButton = document.getElementById('goto-signup');
    const gotoLoginButton = document.getElementById('goto-login');

    // ...

    // Check if user is already logged in
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in, hide the login form and show the main app
            mainContainer.style.display = 'block';
            sidebar.style.display = 'block';
            loginPopup.style.display = 'none';
            signupPopup.style.display = 'none';
        } else {
            // No user is signed in, so show the login form and hide the main app
            mainContainer.style.display = 'none';
            sidebar.style.display = 'none';
            loginPopup.style.display = 'block';
        }
    });

    // Adjust the sidebar position when the window is resized
    window.addEventListener('resize', adjustSidebar);

    function adjustSidebar() {
        var sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('closed')) {
            sidebar.style.right = -sidebar.offsetWidth + 'px';
        }
    }

    // Get references to the sidebarToggle elements
    var sidebarToggle = document.getElementById('sidebarToggle');
    var sidebarToggleNav = document.getElementById('sidebarToggleNav');

    // Attach the event listener to both sidebarToggle elements
    sidebarToggle.addEventListener('click', toggleSidebar);
    sidebarToggleNav.addEventListener('click', toggleSidebar);

    function toggleSidebar() {
        var sidebar = document.getElementById('sidebar');
        var mainContainer = document.getElementById('mainContainer');
        var icon = document.querySelector('#sidebarToggle i');
        var iconNav = document.querySelector('#sidebarToggleNav i');

        if (sidebar.classList.contains('closed')) {
            sidebar.classList.remove('closed');
            sidebar.classList.add('open');
            mainContainer.classList.remove('main-closed');
            mainContainer.classList.add('main-open');
            icon.classList.remove('fas', 'fa-th-list'); // Change to the correct classes
            icon.classList.add('new-icon-class'); // Change to the correct class
            iconNav.classList.remove('fas', 'fa-th-list'); // Change to the correct classes
            iconNav.classList.add('new-icon-class'); // Change to the correct class
        } else {
            sidebar.classList.add('closed');
            sidebar.classList.remove('open');
            mainContainer.classList.remove('main-open');
            mainContainer.classList.add('main-closed');
            icon.classList.remove('new-icon-class'); // Revert to the original classes
            icon.classList.add('fas', 'fa-th-list'); // Revert to the original classes
            iconNav.classList.remove('new-icon-class'); // Revert to the original classes
            iconNav.classList.add('fas', 'fa-th-list'); // Revert to the original classes
        }
    }


    // Set the initial state of the sidebar
    document.getElementById('sidebar').classList.add('closed');

// Signup Button

    if (signupButton) {
        console.log('Signup button found');
        signupButton.addEventListener('click', (e) => {
            console.log('Signup button clicked');  // <-- This should be logged when the button is clicked

            e.preventDefault();  // Prevent the button from submitting the form
            loginPopup.style.display = 'none';  // Hide login form
            signupPopup.style.display = 'block';  // Show signup form
        });
    } else {
        console.log('Signup button not found');
    }

    // Login Button
    if (loginButton) {
        console.log('Login button found');
        loginButton.addEventListener('click', (e) => {
            console.log('Login button clicked');

            e.preventDefault();  // Prevent the button from submitting the form
            signupPopup.style.display = 'none';  // Hide signup form
            loginPopup.style.display = 'block';  // Show login form
        });
    } else {
        console.log('Login button not found');
    }

    // Login form's 'Sign Up' button
    if (gotoSignupButton) {
        gotoSignupButton.addEventListener('click', (e) => {
            e.preventDefault();
            loginPopup.style.display = 'none';
            signupPopup.style.display = 'block';
        });
    }

    // Signup form's 'Back to Login' button
    if (gotoLoginButton) {
        gotoLoginButton.addEventListener('click', (e) => {
            e.preventDefault();
            signupPopup.style.display = 'none';
            loginPopup.style.display = 'block';
        });
    }

    // Logout Button
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            firebase.auth().signOut().then(() => {
                console.log('User logged out');
                // After logout, hide the mainContainer and sidebar, and show the login form
                mainContainer.style.display = 'none';
                sidebar.style.display = 'none';
                loginPopup.style.display = 'block';
            }).catch((error) => {
                console.log('Error logging out:', error);
            });
        });
    } else {
        console.log('Logout button not found');
    }

    // Login Form
    if (loginForm) {
        console.log('Setting up Login Event Listener');
        loginForm.addEventListener('submit', async (e) => {
            // prevent the form from submitting normally
            e.preventDefault();

            // your login logic here...
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                console.log('User logged in successfully', userCredential.user);

                // after successful login, display the mainContainer and hide the loginPopup
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
    } else {
        console.error('Login form not found');
    }

    // Signup Form
    if (signupForm) {
        console.log('Setting up Signup Event Listener');
        signupForm.addEventListener('submit', async (e) => {
            // prevent the form from submitting normally
            e.preventDefault();

            // your signup logic here...
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            try {
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                console.log('User signed up successfully', userCredential.user);

                // After successful signup, display the mainContainer and hide the signupPopup
                loginPopup.style.display = 'none';
                signupPopup.style.display = 'none';
                mainContainer.style.display = 'block';
                sidebar.style.display = 'block';
            } catch (error) {
                if (error.code === 'auth/weak-password') {
                    alert('The password is too weak. It should be at least 6 characters.');
                } else if (error.code === 'auth/email-already-in-use') {
                    alert('The email address is already in use by another account.');
                } else {
                    alert('An error occurred during signup. Please try again.');
                }
                console.error('Error during signup', error);
            }
        });
    } else {
        console.error('Signup form not found');
    }

    // Add a chat message to Firestore
    console.log('Adding a chat message to Firestore');
    (async () => {
        try {
            let docRef = await db.collection('chats').add({
                message: 'Hello, world!',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            });
            console.log('Document written with ID: ', docRef.id);
        } catch (error) {
            console.error('Error adding document: ', error);
        }
    })();
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// After loading apiKey, modelName, and selectedApi from localStorage, call updateDisplay
updateDisplay(selectedApi, apiKey, modelName);

// 2. Helper Functions
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

// Function to update display
function updateDisplay(selectedApi, apiKey, modelName) {
    console.log('Executing updateDisplay function');
    // Clear the existing displays
    modelNameDisplay.innerText = '';
    apiKeyDisplay.innerText = '';

    // Update the display with the loaded data based on the selected API
    if (selectedApi === 'OpenAI' && apiKey) {
        apiKeyDisplay.innerText = `API Key: ${apiKey.slice(-5)}...`;
    } else if (selectedApi === 'OpenSource' && modelName) {
        modelNameDisplay.innerText = `Model: ${modelName}`;
    }
}

function addMessageToChatHistory(message) {
    console.log('Executing addMessageToChatHistory function');
    chatHistory.push(message);
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

    // Save the message to Firestore
    addDoc(collection(db, 'chats'), {
        message: message.content,
        timestamp: message.timestamp,
    })
        .then((docRef) => {
            console.log('Document written with ID: ', docRef.id);
        })
        .catch((error) => {
            console.error('Error adding document: ', error);
        });

}


function clearChatHistory() {
    console.log('Executing clearChatHistory function');
    chatHistory = [];
    localStorage.removeItem('chatHistory');
    clearChatDisplay(); // This function should be defined elsewhere in your script
}


// 3. Event Listeners 
console.log('Setting up Event Listeners');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    const inputText = document.getElementById('inputText');
    const submitButton = document.getElementById('submitButton');
    const clearButton = document.getElementById('clearChat');
    const saveButton = document.getElementById('saveChat');
    const apiSelect = document.getElementById('apiSelect');
    const apiKeyDisplay = document.getElementById('apiKeyDisplay');
    const modelNameDisplay = document.getElementById('modelNameDisplay');
    const clearAllChatsButton = document.getElementsByClassName('clear-button')[0];

    window.onload = function () {
        console.log('Executing onload function');
        const savedChatHistoryString = localStorage.getItem('chatHistory');

        if (savedChatHistoryString) {
            const savedChatHistoryArray = JSON.parse(savedChatHistoryString);
            chatHistory = savedChatHistoryArray;
            updateChatDisplay();
        }

        // Call updateSavedChatsList to display saved chats in the sidebar when the page loads
        updateSavedChatsList();
    };

    // Load the stored apiKey, modelName, chatHistory, savedChats, and selectedApi from localStorage
    console.log('Loading stored data from localStorage');
    apiKey = localStorage.getItem('apiKey') || '';
    modelName = localStorage.getItem('modelName') || '';
    chatHistory = localStorage.getItem('chatHistory') ? JSON.parse(localStorage.getItem('chatHistory')) : [];
    savedChats = localStorage.getItem('savedChats') ? JSON.parse(localStorage.getItem('savedChats')) : [];

    if (inputText) {
        console.log('Setting up event listener for inputText');
        inputText.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                console.log('Enter key pressed. Clicking submitButton.');
                submitButton.click();
            }
        });
    }

    if (apiSelect) {
        console.log('Setting up event listener for apiSelect');
        apiSelect.addEventListener('change', () => {
            console.log('API selection changed');
            const selectedApi = apiSelect.value;

            // Save selectedApi to localStorage
            localStorage.setItem('selectedApi', selectedApi);

            if (selectedApi === 'OpenAI') {
                const newAPIKey = prompt('Enter OpenAI API key', apiKey);
                if (newAPIKey) {
                    apiKey = newAPIKey;

                    // Save apiKey to localStorage
                    localStorage.setItem('apiKey', apiKey);
                }
            } else if (selectedApi === 'OpenSource') {
                const newModelName = prompt('Enter model name', modelName);
                if (newModelName) {
                    modelName = newModelName;

                    // Save modelName to localStorage
                    localStorage.setItem('modelName', modelName);
                }
            }
            updateDisplay(selectedApi, apiKey, modelName);
        });
    }

    if (submitButton) {
        console.log('Setting up event listener for submitButton');
        submitButton.addEventListener('click', async () => {
            console.log('submitButton clicked');
            let userMessage = inputText.value.trim();
            if (!userMessage) return;

            // Load the selectedApi value from localStorage
            selectedApi = localStorage.getItem('selectedApi') || 'OpenAI';
            chatHistory = localStorage.getItem('chatHistory') ? JSON.parse(localStorage.getItem('chatHistory')) : [];

            if (!apiKey && !modelName) {
                alert('Please enter an API key or select a model.');
                return;
            }

            // Push user message into chatHistory
            console.log('Adding user message to chatHistory');
            chatHistory.push({ role: 'user', content: userMessage, timestamp: Date.now() });

            // Update chat display
            console.log('Updating chat display');
            updateChatDisplay();
            inputText.value = '';
            inputText.focus();

            // Save chatHistory to localStorage
            console.log('Saving chatHistory to localStorage');
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

            // Add chat to Firestore
            firebase.firestore().collection('chats').add({
                message: userMessage,
                timestamp: Date.now(),
            })
                .then((docRef) => {
                    console.log('Document written with ID: ', docRef.id);
                })
                .catch((error) => {
                    console.error('Error adding document: ', error);
                });

            // Call to the server
            console.log('Calling server with chatHistory');
            try {
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
                    console.log('Server response received');
                    chatHistory.push({ role: 'bot', content: data.result, timestamp: Date.now() });
                    // Update chat display
                    console.log('Updating chat display with server response');
                    updateChatDisplay();
                } else {
                    console.error('Server error:', data.error);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            saveChatHistory();
            chatHistory = [];
            updateChatDisplay();

            // Save chatHistory to localStorage
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        });
    }

    if (clearAllChatsButton) {
        console.log('Setting up event listener for clearAllChatsButton');
        clearAllChatsButton.addEventListener('click', function () {
            console.log('clearAllChatsButton clicked');
            savedChats = [];
            localStorage.setItem('savedChats', JSON.stringify([])); // Store the cleared chats
            updateSavedChatsList();
        });
    }

    if (saveButton) {
        console.log("Setting up event listener for saveButton");
        saveButton.addEventListener('click', saveChatHistory);
    }
});

// 4. Chat Display Functions
function updateChatDisplay() {
    console.log('Executing updateChatDisplay function');
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

    chatArea.innerHTML = chatHistory.map(msg => {
        let timestamp = new Date(msg.timestamp).toLocaleString();
        return `
        <div class="message-wrapper ${msg.role === 'user' ? 'user-wrapper' : 'bot-wrapper'}">
            <img class="avatar ${msg.role === 'user' ? 'avatar-user' : 'avatar-bot'}" src="images/${msg.role === 'user' ? 'userAvatar1' : 'ChatbotAvatar'}.png">
            <div class="message-container ${msg.role === 'user' ? 'message-container-user' : 'message-container-bot'}">
                <div class="message ${msg.role === 'user' ? 'message-user' : 'message-bot'}">${msg.content}</div>
                <small class="timestamp">${timestamp}</small>
            </div>
        </div>`;
    }).join('');

    const latestMessage = chatArea.lastChild;
    if (latestMessage) {
        latestMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}


async function updateSavedChatsList() {
    console.log('Executing updateSavedChatsList function');

    // Fetch saved chats from Firestore


    // Fetch saved chats from Firestore
    const querySnapshot = await firebase.firestore().collection('savedChats').get();
    let savedChats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));


    savedChats.sort((a, b) => b.timestamp - a.timestamp);

    const chatsByDay = savedChats.reduce((groups, chat) => {
        const chatDate = getSeparatorText(new Date(chat.timestamp));
        const groupKey = chatDate;
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(chat);
        return groups;
    }, {});

    savedChatsList.innerHTML = '';
    Object.entries(chatsByDay).forEach(([day, chats]) => {
        const dayListItem = document.createElement('li');

        const separator = document.createElement('span');
        separator.textContent = day;
        separator.style.fontWeight = 'bold';
        dayListItem.appendChild(separator);

        chats.forEach((chat, index) => {
            const listItem = document.createElement('li');
            const listItemWrapper = document.createElement('div');
            listItemWrapper.className = 'list-item-wrapper';

            const title = document.createElement('span');
            title.className = 'title';
            title.textContent = chat.title;
            title.title = chat.title;

            const deleteButton = document.createElement('i');
            deleteButton.className = 'far fa-trash-alt';
            deleteButton.addEventListener('click', async (event) => {
                event.stopPropagation();
                // Remove the chat from Firestore
                await deleteDoc(doc(db, 'savedChats', chat.id));
                // Update the list of saved chats in the UI
                updateSavedChatsList();
            });

            listItemWrapper.appendChild(title);
            listItemWrapper.appendChild(deleteButton);
            listItem.appendChild(listItemWrapper);

            listItem.addEventListener('click', () => {
                chatHistory = chat.history;
                updateChatDisplay();

                // Save chatHistory to Firestore
                setDoc(doc(db, 'chatHistory', 'userChatHistory'), chatHistory);
            });
            dayListItem.appendChild(listItem);
        });

        savedChatsList.appendChild(dayListItem);
    });
}



// 5. Chat Saving Functions

async function saveChatHistory() {
    console.log('Executing saveChatHistory function');

    const titleRequestMessage = 'Please generate a conversation title based on the context that best describes the question being asked. Please keep the title short and to the point and format it as "conversationTitle: [Title]".';
    chatHistory.push({
        role: 'user',
        content: titleRequestMessage,
        timestamp: Date.now(),
        isTitleRequest: true
    });

    // Send a 'generate' request to the AI model
    try {
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
            console.log('Server response received');
            const titleStartIndex = data.result.indexOf('conversationTitle: ');
            if (titleStartIndex !== -1) {
                let conversationTitle = data.result.slice(titleStartIndex + 'conversationTitle: '.length);
                conversationTitle = conversationTitle.replace(/[\\/:*?"<>|]/g, " ").trim();

                // Remove the title request from the chat history and update the chat display
                chatHistory.pop();
                updateChatDisplay();

                // Prepare the chat history to be saved
                const savedChat = {
                    title: conversationTitle,
                    history: chatHistory,
                    timestamp: Date.now() // This creates a timestamp representing the current time
                };

                // Save the chat history to local storage
                localStorage.setItem('savedChat', JSON.stringify(savedChat));

                console.log('Chat saved successfully');

                // Update the list of saved chats in the UI
                updateSavedChatsList();
            }
        } else {
            console.error('Server error:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


