import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import helmet from 'helmet';
import axios from 'axios';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// ================== Configuration Constants ================== //

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1283861457007673506/w4zSpCb8m-hO5tf5IP4tcq-QiNgHmLz4mTUztPusDlZOhC0ULRhC64SMMZF2ZFTmM6eT';
const PORT = 21560;
const REDDIT_RSS_URL = 'https://www.reddit.com/r/all/new/.rss';

// ================== Setup Directory Paths ================== //

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== Initialize Express App ================== //

const app = express();

// Apply security-related headers
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
}));

// Use middleware for handling JSON, URL-encoded data, cookies, and logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(morgan('combined'));

// ================== Initialize Logger ================== //

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...metadata }) => {
            let msg = `${timestamp} [${level}]: ${message}`;
            if (Object.keys(metadata).length) {
                msg += ` | ${JSON.stringify(metadata)}`;
            }
            return msg;
        })
    ),
    transports: [new winston.transports.Console()],
});

// ================== Utility Functions ================== //

// Fetch random cat image from The Cat API
async function getRandomCatImage() {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search');
        const imageUrl = response.data[0].url;
        const imageId = response.data[0].id;
        const width = response.data[0].width;
        const height = response.data[0].height;

        logger.debug('Random cat image fetched.', { imageUrl, imageId, width, height, source: 'getRandomCatImage' });

        // Return all necessary data
        return {
            url: imageUrl,
            id: imageId,
            width: width,
            height: height,
        };
    } catch (error) {
        logger.error('Error fetching random cat image.', { error: error.message, source: 'getRandomCatImage' });
        return {
            url: 'https://i.ibb.co/wgfvKYb/2.jpg', // Fallback image
            id: 'unknown',
            width: 0,
            height: 0,
        };
    }
}

// Generate a random bot name
function generateRandomBotName() {
    const adjectives = [
        'Purring',
        'Sneaky',
        'Clawy',
        'Fluffy',
        'Whiskery',
        'Playful',
        'Curious',
        'Cuddly',
        'Mischievous',
    ];

    const nouns = [
        'Furball',
        'Whiskers',
        'Meowster',
        'Purrfect',
        'Clawson',
        'Kittypaw',
        'Feline',
        'Tailchaser',
        'Napster',
    ];

    const number = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

    const botName = `${randomAdjective}${randomNoun}${number}`;
    logger.debug('Generated random cat bot name.', { botName, source: 'generateRandomBotName' });
    return botName;
}

// Generate a random profile picture URL based on username
function getRandomProfilePicture(username) {
    const profilePictureUrl = `https://robohash.org/${encodeURIComponent(username)}.png`;
    logger.debug('Generated random profile picture URL.', { profilePictureUrl, source: 'getRandomProfilePicture' });
    return profilePictureUrl;
}

// Retrieve updates from the updates.json file
async function getUpdates() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'updates.json'), 'utf-8');
        logger.info('Updates file successfully read.', { source: 'getUpdates' });
        return JSON.parse(data);
    } catch (error) {
        logger.error('Error reading updates.json.', { error: error.message, source: 'getUpdates' });
        return [];
    }
}

// ================== Routes ================== //

// Root Endpoint
app.get('/', async (req, res) => {
    logger.info('The noble root endpoint hath been accessed.', { endpoint: '/' });
    try {
        const updates = await getUpdates();
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>MonkeyBytes-API Royal Court</title>
          <style>
              body { 
                  font-family: Arial, sans-serif; 
                  background-color: #121212; 
                  color: #e0e0e0; 
                  padding: 20px; 
              }
              .box { 
                  background-color: #1e1e1e; 
                  padding: 15px; 
                  margin-bottom: 20px; 
                  border-radius: 8px; 
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); 
              }
              .box h2 { 
                  margin-top: 0; 
                  color: #ffcc00; 
              }
              .box h3 { 
                  color: #ffcc00; 
              }
              .box p { 
                  line-height: 1.6; 
              }
          </style>
      </head>
      <body>
          <h1>Welcome to the MonkeyBytes-API Royal Court</h1>
          <div class="box">
              <h2>About the API</h2>
              <p>This API alloweth the honored user to engage with sundry endpoints, granting random images, bot names, and facts spun in the tongue of medieval England, with tidings from the land of Reddit posted to the realm of Discord.</p>
          </div>
          <div class="box">
              <h2>Code Structure</h2>
              <p>The script is most wisely organized into several noble sections:</p>
              <ul>
                  <li><strong>Configuration Constants:</strong> Herein are defined the constants of the realm, such as port numbers, URLs, and sacred credentials.</li>
                  <li><strong>Setup Directory Paths:</strong> The pathways and filenames are established using <code>fileURLToPath</code> and <code>path</code> to guide the way.</li>
                  <li><strong>Initialize Express App:</strong> The Express app is readied, with security ensured through the application of the <code>helmet</code> middleware.</li>
                  <li><strong>Initialize Logger:</strong> Winston, the trusted scribe, is set to record all events of note with color and precision, as time passes in the kingdom.</li>
                  <li><strong>Utility Functions:</strong> The realm is blessed with helper functions for reading scrolls, fetching random images of cats, generating bot names, and more.</li>
                  <li><strong>Routes:</strong> These noble pathways allow guests to interact with the kingdom's API:
                      <ul>
                          <li><strong>/:</strong> The grand gateway to the kingdom, where noble lords and ladies may learn of the API’s purpose and latest decrees.</li>
                          <li><strong>/testing:</strong> A path of great intrigue, where visitors shall receive a randomized image of a cat, a bot name fit for a curious kitten, and a fact worthy of any royal court's conversation.</li>
                      </ul>
                  </li>
                  <li><strong>Asynchronous Tasks:</strong> Duties are undertaken to fetch and post the latest from the Reddit kingdom to the Discord realm.</li>
                  <li><strong>NPM Packages Used:</strong> 
                      <ul>
                          <li><strong>express:</strong> A framework most versatile for building the castle’s web-based applications and handling the scrolls of request and response.</li>
                          <li><strong>fs/promises:</strong> A promise-based API for engaging with the kingdom's file system, especially for reading the sacred updates.json scroll.</li>
                          <li><strong>path:</strong> A utility module for navigating the labyrinth of file paths, ensuring safe passage to each desired location within the castle.</li>
                          <li><strong>winston:</strong> A logging scribe, recording each event in the annals of history with color and precision.</li>
                          <li><strong>helmet:</strong> A safeguard for the castle, fortifying its Express walls with headers that protect against invaders.</li>
                          <li><strong>axios:</strong> A trusted messenger, delivering and receiving missives from far-off lands like Reddit and Discord.</li>
                          <li><strong>cors:</strong> A tool for allowing noble guests from across different domains to communicate with our API.</li>
                          <li><strong>morgan:</strong> A scribe, chronicling each request made to the kingdom’s API for posterity.</li>
                          <li><strong>cookie-parser:</strong> A tool to read and manage cookies, those delectable morsels shared across the land.</li>
                      </ul>
                  </li>
              </ul>
          </div>
      </body>
      </html>
    `);
    } catch (error) {
        res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Error</title>
          <style>
              body { 
                  font-family: Arial, sans-serif; 
                  background-color: #121212; 
                  color: #e0e0e0; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  height: 100vh; 
                  margin: 0; 
              }
              .error-container { 
                  background-color: #1e1e1e; 
                  padding: 20px; 
                  border-radius: 8px; 
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); 
                  text-align: center; 
              }
              .error-container h1 { 
                  color: #ff4d4d; 
              }
          </style>
      </head>
      <body>
          <div class="error-container">
              <h1>Oh dear! An error hath occurred.</h1>
              <p>Please try again later.</p>
          </div>
      </body>
      </html>
    `);
    }
});

// Testing Endpoint
app.get('/testing', async (req, res) => {
    logger.info('The testing endpoint hath been accessed.', { endpoint: '/testing' });

    try {
        // Fetch two random cat images
        const testImage1 = await getRandomCatImage();
        const testImage2 = await getRandomCatImage();

        // Generate a random bot name
        const botName = generateRandomBotName();

        // Use the cat image data for facts
        const randomFactText = `Behold the mighty feline! Image with id "${testImage1.id}" has a width of ${testImage1.width} and height of ${testImage1.height}.`;

        // Generate a random profile picture based on bot name
        const avatarUrl = getRandomProfilePicture(botName);

        const responseData = {
            testText: randomFactText,
            testimage1: testImage1.url,
            testimage2: testImage2.url,
            testingBotName: botName,
            avatar: avatarUrl,
        };

        res.json(responseData);
    } catch (error) {
        logger.error('An error hath occurred within the /testing route.', { error: error.message, source: '/testing' });
        res.status(500).json({
            error: 'Alas! An error hath occurred while fetching data. Please try again later.',
        });
    }
});

// ================== Start the Server ================== //

app.listen(PORT, '0.0.0.0', () => {
    logger.info(`The server is running at http://localhost:${PORT}`);
});

// ================== 404 Error Handler ================== //

app.use((req, res) => {
    logger.warn('An unknown endpoint hath been accessed.', { path: req.path, source: '404Handler' });
    res.status(404).json({ error: 'Oh dear! The page thou seekest is not to be found.' });
});
