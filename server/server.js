// Import necessary modules
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import admin from 'firebase-admin'; // Import Firebase Admin SDK

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

// Get a reference to the Firestore service
const db = admin.firestore();

// Create an Express application
const app = express();

// Use CORS middleware
app.use(cors());

// Set the port for the server to listen on
const port = process.env.PORT || 8080;

// Set up file and directory names for later use
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up server logging with Morgan
const accessLogStream = fs.createWriteStream(path.join(__dirname, '/server.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// Use JSON middleware for parsing JSON bodies
app.use(express.json());

// Set up static file serving
app.use(express.static(path.join(__dirname, '../client')));

// Define a custom logging function
function customLog(message) {
  const logStream = fs.createWriteStream('./server.log', { flags: 'a' });
  logStream.write(`${new Date().toISOString()} - ${message}\n`);
  logStream.end();
}

// Define the POST route for /api
app.post('/api', async (req, res) => {
  customLog('Received POST request on /api');
  const request = req.body;

  const apiKey = request.apiKey;
  const modelName = request.modelName;
  const selectedApi = request.selectedApi;

  if (selectedApi === 'OpenAI' && apiKey) {
    customLog('OpenAI selected and API key found. Preparing to call OpenAI API.');
    const messagesToSend = request.messages.map(({ role, content }) => {
      if (role === 'bot') {
        role = 'assistant';
      }
      return { role, content };
    });

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messagesToSend
        })
      });

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        res.json({ result: data.choices[0].message.content });
      } else {
        customLog('OpenAI response: ' + JSON.stringify(data));
        res.json({ error: 'No text received from OpenAI' });
      }
    } catch (error) {
      customLog('OpenAI error: ' + error + ', Response: ' + JSON.stringify(data));
      res.json({ error: error.message });
    }
  } else if (selectedApi === 'OpenSource' && modelName) {
    customLog('Open Source selected and model name found. Preparing to call Flask app endpoint.');

    const FLASK_APP_ENDPOINT = process.env.FLASK_APP_ENDPOINT || 'http://localhost:5000/generate';
    try {
      const response = await fetch(FLASK_APP_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages: request.messages
        })
      });

      const data = await response.json();
      res.json({ result: data.result });
    } catch (error) {
      customLog('API error: ' + error);
      res.json({ error: error.message });
    }
  } else {
    customLog('Error: Either selected API or required information for API call is missing');
    res.json({ error: 'Required information for API call is missing' });
  }
});

// Define POST route for '/save-chat'
app.post('/save-chat', async (req, res) => {
  // Log the incoming request
  customLog('Received POST request on /save-chat');

  // Extract the saved chat from the request body
  const savedChat = req.body.savedChat;

  // Save the new chat to Firestore
  try {
    await db.collection('savedChats').add(savedChat);
    res.json({ status: "success" });
  } catch (error) {
    customLog('Error saving chat to Firestore: ' + error);
    res.json({ error: error.message });
  }
});

// Start the server and listen on the specified port
app.listen(port, () => {
  customLog(`Server listening on port ${port}`);
});
