
/**
Table of Contents:
1. Global Declarations
2. Helper Functions
3. Event Listeners 
4. Chat Display Functions
5. Chat Saving Functions
**/

// 1. Global Declarations
let chatHistory;
let savedChats;
let apiKey;
let modelName;
let selectedApi;

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
    userAvatar('Loaded userAvatar');

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

    // Initialize Storage
    var storage = firebase.storage();

    // Variable to hold the user uploaded image
    let userUpload = '';

    // Function to handle user avatar upload
    function handleUserAvatarUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const storageRef = firebase.storage().ref('avatars/' + file.name);
            storageRef.put(file).then(snapshot => {
                snapshot.ref.getDownloadURL().then(downloadURL => {
                    userUpload = downloadURL;
                    updateChatDisplay();

                    // Get the logged-in user's ID
                    if (firebase.auth().currentUser) {
                        const userId = firebase.auth().currentUser.uid;

                        // Save the download URL to Firestore using the user's ID
                        const userRef = firebase.firestore().collection('users').doc(userId);
                        userRef.set({ avatarURL: downloadURL });
                    } else {
                        console.log("User not logged in during upload");
                    }
                });
            });
        }
    }

    // Function to retrieve and display the user avatar
    function loadUserAvatar() {
        if (firebase.auth().currentUser) {
            const userId = firebase.auth().currentUser.uid;
            console.log("User ID:", userId); // Debugging log

            const userRef = firebase.firestore().collection('users').doc(userId);
            userRef.get().then(doc => {
                if (doc.exists) {
                    userUpload = doc.data().avatarURL;
                    // Preload the image
                    const img = new Image();
                    img.src = userUpload;
                    img.onload = () => {
                        console.log("Avatar preloaded");
                        updateChatDisplay();
                    };
                } else {
                    console.log("No such document!"); // Debugging log
                }
            }).catch(error => {
                console.log("Error getting document:", error); // Debugging log
            });
        } else {
            console.log("User not logged in during load");
        }
    }

    // Using Firebase's authentication state observer to call loadUserAvatar once the user's login state is known
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            loadUserAvatar();
        } else {
            console.log("User not logged in");
        }
    });

    // Add event listener for user avatar file input
    document.getElementById('userAvatarInput').addEventListener('change', handleUserAvatarUpload);

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
            return `${ diffDays } days ago`;
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
            apiKeyDisplay.innerText = `API Key: ${ apiKey.slice(-5) }...`;
        } else if (selectedApi === 'OpenSource' && modelName) {
            modelNameDisplay.innerText = `Model: ${ modelName } `;
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
        const confirmModal = document.getElementById('confirmModal');
        const yesButton = document.getElementById('yesButton');
        const noButton = document.getElementById('noButton');
        let userAvatar = localStorage.getItem('userAvatar') || ''; // Retrieve from localStorage

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

        function handleUserAvatarUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const storageRef = firebase.storage().ref('avatars/' + file.name);
                storageRef.put(file).then(snapshot => {
                    snapshot.ref.getDownloadURL().then(downloadURL => {
                        userUpload = downloadURL;
                        updateChatDisplay();

                        // Save the download URL to Firestore
                        const userRef = firebase.firestore().collection('users').doc('USER_ID');
                        userRef.set({ avatarURL: downloadURL });
                    });
                });
            }
        }

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
                confirmModal.style.display = 'block'; // Show the modal
            });
        }

        if (yesButton) {
            yesButton.addEventListener('click', () => {
                saveChatHistory().then(() => {
                    chatHistory = [];
                    updateChatDisplay();
                    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
                });
                confirmModal.style.display = 'none'; // Hide the modal
            });
        }

        if (noButton) {
            noButton.addEventListener('click', () => {
                chatHistory = [];
                updateChatDisplay();
                localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
                confirmModal.style.display = 'none'; // Hide the modal
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
