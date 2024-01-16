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
import mime from 'mime-types';

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

// Dedicated static file serving for themes
// Update the static file middleware

app.use('/css_files', express.static(path.join(__dirname, '../css_files'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

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

// Endpoint for DALL-E
app.post('/generateImage', async (req, res) => {
  const prompt = req.body.prompt;  // Get the prompt from the request body

  // Hardcode the OpenAI API key directly for testing purposes
  const apiKey = "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";  // Replace with your actual OpenAI API key

  // Log the API key to the console for debugging
  console.log("Using hardcoded API key for DALL-E:", apiKey);

  // Specify the URL for the OpenAI API's image generation endpoint
  const url = 'https://api.openai.com/v1/images/generations';

  // Set up the headers for the API request
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // Make the API request
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "url"
      })
    });

    // Parse the API response
    const data = await response.json();

    // Log the raw API response for debugging
    console.log("Raw DALL-E Response:", JSON.stringify(data, null, 2));

    // Check the status code of the API response
    if (response.status !== 200) {
      console.error(`Failed to call DALL-E API. Status code: ${response.status}`);
      res.status(500).json({ error: 'Failed to call DALL-E API' });
      return;
    }

    // Extract the image URL from the API response
    if (data && data.data && data.data.length > 0) {
      const imageURL = data.data[0].url;
      res.json({ imageURL });
    } else {
      console.error("Unexpected DALL-E API response structure:", data);
      res.status(500).json({ error: 'Failed to generate image due to unexpected API response' });
    }
  } catch (error) {
    // Log any errors that occur
    console.error("Error generating image with DALL-E:", error);

    // Send an error response
    res.status(500).json({ error: 'Failed to generate image' });
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


// Themes section ///////////////////////////////

// Update express static middleware
app.use(express.static(path.join(__dirname, '../client'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', mime.lookup(path) || 'text/css');
    }
  }
}));

// Handle themes route
app.get('/themes', (req, res) => {

  // Get themes directory
  const themesDirectory = path.join(__dirname, '../client/css_files/color_themes');

  // Read theme files
  fs.readdir(themesDirectory, (err, files) => {

    // Handle errors
    if (err) {
      console.error('Error reading theme directory:', err);
      res.status(500).send('Server error');
      return;
    }

    // Filter css files and extract primary color
    const themePromises = files
      .filter(file => file.endsWith('.css') && file !== 'color_Themes.css') // Filter only .css files and exclude color_Themes.css
      .map(file => {
        return new Promise((resolve, reject) => {
          fs.readFile(path.join(themesDirectory, file), 'utf8', (err, data) => {
            if (err) {
              console.error(`Error reading file: ${file}`, err); // This line will log the problematic file name
              reject(`Error reading file: ${file}`);
              return;
            }
            const match = data.match(/--primary-color:\s*(#[a-fA-F0-9]{6});/);
            if (!match) {
              reject(`Could not find primary color in file: ${file}`);
              return;
            }
            const color = match[1];
            resolve({
              name: file.replace('.css', ''),
              color: color
            });
          });
        });
      });

    Promise.allSettled(themePromises)
      .then(results => {
        const themes = results
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);

        // Sort themes alphabetically by name
        const sortedThemes = themes.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

        // Log the sorted themes for inspection
        console.log("Sorted Themes:", sortedThemes);

        // Send the sorted themes
        res.json(sortedThemes);
      })
      .catch(err => {
        console.error('Error processing themes', err);
        res.status(500).send('Server error');
      });

  });
});



// Start server
app.listen(port, () => {
  customLog(`Server listening on port ${port}`);
});



// 19. Chatbot Modes /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////