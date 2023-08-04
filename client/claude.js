// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtmqBKQAyRC579hjdDOKlx0g1SWsQnwdA",
    authDomain: "myapp-project-123.firebaseapp.com",
    databaseURL: "https://myapp-project-123.firebaseio.com",
    projectId: "myapp-project-123",
    storageBucket: "myapp-project-123.appspot.com",
    messagingSenderId: "65211879809",
    appId: "1:65211879809:web:3ae38ef1cdcb2e01fe5f0c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase references
const auth = firebase.auth();
const db = firebase.firestore();

// Set up authentication state listener
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        // Show chat UI by displaying element with id 'chat-container'
        document.getElementById('chat-container').style.display = 'block';

        // Hide login UI by hiding element with id 'login-container' 
        document.getElementById('login-container').style.display = 'none';

    } else {
        // User is signed out
        // Show login UI by displaying element with id 'login-container'
        document.getElementById('login-container').style.display = 'block';

        // Hide chat UI by hiding element with id 'chat-container'
        document.getElementById('chat-container').style.display = 'none';
    }
});

// Define routes
const routes = {
    '/': 'HomePage',
    '/chat': 'ChatPage'
};

// Router function 
const router = async () => {

    // Get current url pathname
    const url = window.location.pathname;

    // Get page name from routes object
    const page = routes[url];

    // Invalid route, go to home page
    if (!page) {
        window.location.pathname = '/';
        return;
    }

    // Home page route
    if (page === 'HomePage') {

        // Show home page element
        document.getElementById('home').style.display = 'block';

        // Hide other pages
        document.getElementById('chat').style.display = 'none';

    }

    // Chat page route
    if (page === 'ChatPage') {

        // Show chat page element 
        document.getElementById('chat').style.display = 'block';

        // Hide other pages
        document.getElementById('home').style.display = 'none';

        // Initialize chat module
        chat.init();

    }

};

// Listen for load and hashchange events
window.addEventListener('load', router);
window.addEventListener('hashchange', router);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Chat module
const chat = (function () {

    // Array to store chat history
    let chatHistory = [];

    // Get DOM elements
    const chatArea = document.getElementById('chat-area');
    const inputBox = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    return {

        // Initialize chat module
        init: function () {

            // Send message on button click
            sendButton.addEventListener('click', () => {
                this.sendMessage();
            });

        },

        // Send message function
        sendMessage: function () {

            // Get message text
            const message = inputBox.value;

            // Add message to history array
            chatHistory.push({
                user: 'John Doe',
                text: message
            });

            // Clear input
            inputBox.value = '';

            // Display updated chat history
            this.showMessages();

        },

        // Show chat history function
        showMessages: function () {

            // Chat history HTML
            let messagesHtml = '';

            // Loop through history  
            chatHistory.forEach(message => {

                // Add message HTML
                messagesHtml += `
          <div class="message">
            <b>${message.user}:</b> ${message.text}
          </div>
        `;

            });

            // Set chat area inner HTML 
            chatArea.innerHTML = messagesHtml;

        }

    };

})();


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// API module
const api = (function () {

    // Make OpenAI API call
    async function callOpenAI(prompt) {

        // API credentials
        const apiKey = 'sk-12345abcde...';

        // API endpoint  
        const url = 'https://api.openai.com/v1/engines/text-davinci-003/completions';

        // Call parameters
        const params = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: 100
            })
        };

        // Make API call
        const response = await fetch(url, params);

        // Get response data
        const data = await response.json();

        // Return text
        return data.choices[0].text;

    }

    // Make call to other API
    async function callOtherAPI(prompt) {

        // API call logic

        const response = await fetch('https://other-api.com/chat', {
            method: 'POST',
            body: JSON.stringify({
                prompt: prompt
            })
        });

        const data = await response.json();

        return data.botResponse;

    }

    // Exposed functions  
    return {
        openai: callOpenAI,
        other: callOtherAPI
    };

})();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// API module
const api = (function () {

    // Make OpenAI API call
    async function callOpenAI(prompt) {

        // API credentials
        const apiKey = 'sk-12345abcde...';

        // API endpoint  
        const url = 'https://api.openai.com/v1/engines/text-davinci-003/completions';

        // Call parameters
        const params = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: 100
            })
        };

        // Make API call
        const response = await fetch(url, params);

        // Get response data
        const data = await response.json();

        // Return text
        return data.choices[0].text;

    }

    // Make call to other API
    async function callOtherAPI(prompt) {

        // API call logic

        const response = await fetch('https://other-api.com/chat', {
            method: 'POST',
            body: JSON.stringify({
                prompt: prompt
            })
        });

        const data = await response.json();

        return data.botResponse;

    }

    // Exposed functions  
    return {
        openai: callOpenAI,
        other: callOtherAPI
    };

})();



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Local storage module
const storage = (function () {

    // Save data to localStorage
    function saveToLocalStorage(key, data) {

        // Convert data to JSON string
        const json = JSON.stringify(data);

        // Save to localStorage
        localStorage.setItem(key, json);

    }

    // Get data from localStorage
    function getFromLocalStorage(key) {

        // Get JSON string from localStorage
        const json = localStorage.getItem(key);

        // Parse JSON to original data type
        return JSON.parse(json);

    }

    // Exposed storage functions
    return {
        save: saveToLocalStorage,
        get: getFromLocalStorage
    };

})();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// DOM query selector
function $(selector) {
    return document.querySelector(selector);
}

// Format date
function formatDate(date) {

    // Create options object
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    // Format date
    return date.toLocaleDateString('en-US', options);

}

// Scroll chat to bottom
function scrollChatToBottom() {

    // Get chat element
    const chat = $('#chat');

    // Scroll to bottom
    chat.scrollTop = chat.scrollHeight;

}

// Get random number 
function getRandomNumber(min, max) {

    // Return random number in range 
    return Math.floor(Math.random() * (max - min + 1)) + min;

}

// Other helper functions...