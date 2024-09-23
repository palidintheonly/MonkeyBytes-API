// index.mjs

import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import helmet from 'helmet';
import axios from 'axios';
import xml2js from 'xml2js';
import crypto from 'crypto';
import { decode } from 'html-entities';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import https from 'https';

// ================== Configuration Constants ================== //

// Hardcoded Discord webhook URL
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1283861457007673506/w4zSpCb8m-hO5tf5IP4tcq-QiNgHmLz4mTUztPusDlZOhC0ULRhC64SMMZF2ZFTmM6eT';

// Hardcoded Port and Reddit RSS URL
const PORT = 21560; // Hardcoded port for HTTP or HTTPS
const REDDIT_RSS_URL = 'https://www.reddit.com/r/all/new/.rss';

// ================== Setup Directory Paths ================== //

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== Initialize Express App ================== //

const app = express();

// Adjust helmet configuration to fix CSP and other security issues
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "ws://localhost:*", `ws://${reqHostname()}:*`, `https://${reqHostname()}:*`],
        formAction: ["'self'", "https://us2.bot-hosting.net:21560"], // Adjust this to allow form submissions
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    originAgentCluster: true,
  })
);

// Function to get the hostname for connectSrc
function reqHostname() {
  return 'us2.bot-hosting.net';
}

// Enable JSON and URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== Initialize Logger ================== //

// Logger configuration (Winston) with colorized output
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

// Function to load updates from updates.json
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

// Updated Test Image URLs (10 Images, Randomized Order)
const allTestImages = [
  'https://i.ibb.co/5cM4FY5/MNAPI-10.png',
  'https://i.ibb.co/60MFZFy/MNAPI-1.png',
  'https://i.ibb.co/DD0LhmF/MNAPI-3.jpg',
  'https://i.ibb.co/bvkHphH/MNAPI-4.jpg',
  'https://i.ibb.co/RQ9SLn7/MNAPI-5.png',
  'https://i.ibb.co/T2tXRKZ/MNAPI-6.png',
  'https://i.ibb.co/XzwZS2N/MNAPI-7.png',
  'https://i.ibb.co/CW2S423/MNAPI-8.jpg',
  'https://i.ibb.co/W0G6pDW/MNAPI-9.jpg',
  'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png', // Google Logo PNG
];

// Shuffle the array to randomize the order
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const shuffledImages = shuffleArray([...allTestImages]);

// Distribute images evenly between testImage1List and testImage2List
const testImage1List = shuffledImages.slice(0, 5);
const testImage2List = shuffledImages.slice(5, 10);

// Function to get a random image from a given list
function getRandomImage(imageList) {
  if (!Array.isArray(imageList) || imageList.length === 0) {
    logger.warn('Image list is empty or invalid.', { source: 'getRandomImage' });
    return 'https://i.ibb.co/wgfvKYb/2.jpg'; // Default image
  }
  const randomIndex = Math.floor(Math.random() * imageList.length);
  const selectedImage = imageList[randomIndex];
  logger.debug('Random image selected.', { imageUrl: selectedImage, source: 'getRandomImage' });
  return selectedImage;
}

// Function to get a random profile picture using RoboHash API
function getRandomProfilePicture() {
  const randomUsername = crypto.randomBytes(4).toString('hex');
  const profilePictureUrl = `https://robohash.org/${randomUsername}.png`;
  logger.debug('Generated random profile picture URL.', { profilePictureUrl, source: 'getRandomProfilePicture' });
  return profilePictureUrl;
}

// Function to generate a random bot name
function generateRandomBotName() {
  const adjectives = [
    'Ghooghle',
    'Alphabeta',
    'Betacode',
    'Qyantum',
    'Novus',
    'Nebulab',
    'Ethereon',
    'Lumina',
    'Mysticus',
  ];

  const nouns = [
    'Gliph',
    'Cypher',
    'Runic',
    'Scriptum',
    'Atlaz',
    'Echoom',
    'Vortyx',
    'Reyalm',
    'Spectyr',
  ];

  const number = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  const botName = `${randomAdjective}${randomNoun}${number}`;
  logger.debug('Generated random bot name.', { botName, source: 'generateRandomBotName' });
  return botName;
}

// Updated Facts Array (10 Facts About Google, Styled in 1066 Noble UK)
const facts = [
  {
    id: 'fact1',
    testText:
      "There be a great ledger of knowledge, which doth grow each passing moment, unseen hands gathering the world's wisdom.",
  },
  {
    id: 'fact2',
    testText:
      'A far-reaching eye dost peer upon the stars and streets alike, knowing the paths of mortals and the heavens above.',
  },
  {
    id: 'fact3',
    testText:
      'By a single utterance, ye may summon untold knowledge from the void, as though consulting a mystical oracle.',
  },
  {
    id: 'fact4',
    testText:
      'In many tongues doth it speak, from the simple folk to the scholars, uniting all under one grand banner of understanding.',
  },
  {
    id: 'fact5',
    testText:
      "A humble abode began this tale, with two seekers of truth crafting a doorway to the world's wisdom in yon ancient times.",
  },
  {
    id: 'fact6',
    testText:
      'Maps beyond reckoning dost it provide, guiding both humble traveler and noble knight through the farthest reaches of the land.',
  },
  {
    id: 'fact7',
    testText:
      'Fortune beyond imagination flows from its coffers, though much of its treasure is unseen, drawn from the wares of merchants far and wide.',
  },
  {
    id: 'fact8',
    testText:
      'A name it bears most curious, derived from the vastest of numbers, yet it doth count even the smallest of things.',
  },
  {
    id: 'fact9',
    testText:
      'Many tools hath it forged, not least of which a wondrous scribe, able to pen thoughts and ideas as fast as they come.',
  },
  {
    id: 'fact10',
    testText:
      'At the heart of many ventures, this unseen force doth unite men, beasts, and machines alike, guiding them all with but a whisper.',
  },
];

// ================== Routes ================== //

// /testing route with random test images and random bot name
app.get('/testing', (req, res) => {
  logger.info('Endpoint accessed.', { endpoint: '/testing' });

  try {
    const testImage1Url = getRandomImage(testImage1List);
    const testImage2Url = getRandomImage(testImage2List);
    const profilePictureUrl = getRandomProfilePicture();
    const botName = generateRandomBotName();
    const randomIndex = Math.floor(Math.random() * facts.length);
    const randomFact = { ...facts[randomIndex] };

    logger.debug('Random fact selected.', { factId: randomFact.id, source: '/testing' });

    randomFact.dateUnixUK = Math.floor(Date.now() / 1000);
    randomFact.testimage1 = testImage1Url;
    randomFact.testimage2 = testImage2Url;
    randomFact.testingProfilePicture = profilePictureUrl;
    randomFact.testingBotName = botName;

    res.json(randomFact); // Return JSON response
  } catch (error) {
    logger.error('An error hath occurred within the /testing route.', { error: error.message, source: '/testing' });
    res.status(500).json({
      error: 'Alas! An error hath occurred while fetching data. Please try again later.',
    });
  }
});

// ================== Socket.IO Integration ================== //

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Adjust as needed for security
    methods: ["GET", "POST"]
  }
});

// Handle Socket.IO Connections
io.on('connection', (socket) => {
  logger.info('A user connected via Socket.IO', { socketId: socket.id });

  // Handle user joining the chat with a username
  socket.on('joinChat', (username) => {
    socket.username = username || 'Anonymous';
    logger.info(`User joined the chat: ${socket.username}`, { socketId: socket.id });
    io.emit('userConnected', socket.username);
  });

  // Listen for a custom 'chatMessage' event
  socket.on('chatMessage', (data) => {
    const { username, message } = data;
    logger.info('Received chat message', { username, message, socketId: socket.id });

    // Broadcast the message to all connected clients
    io.emit('chatMessage', { username, message });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('userDisconnected', socket.username);
      logger.info('User disconnected', { username: socket.username, socketId: socket.id });
    } else {
      logger.info('A user disconnected', { socketId: socket.id });
    }
  });
});

// ================== /chat Endpoint ================== //

// Define the /chat route to serve the chat interface
app.get('/chat', (req, res) => {
  logger.info('Chat endpoint accessed.', { endpoint: '/chat' });

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>📜 Real-Time Chat</title>
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

                .chat-container {
                    width: 500px;
                    background-color: #2c2c2c;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                }

                .chat-container h1 {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .chat-box {
                    height: 300px;
                    overflow-y: scroll;
                    border: 1px solid #444;
                    padding: 10px;
                    margin-bottom: 10px;
                    background-color: #1e1e1e;
                    border-radius: 4px;
                }

                .chat-box .message {
                    margin-bottom: 10px;
                }

                .chat-box .message .username {
                    font-weight: bold;
                    margin-right: 5px;
                }

                .chat-box .info {
                    color: #999;
                    font-style: italic;
                    margin-bottom: 10px;
                }

                #chat-form {
                    display: flex;
                }

                #chat-input {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 4px;
                    margin-right: 10px;
                    background-color: #333;
                    color: #fff;
                }

                #chat-input:focus {
                    outline: none;
                    background-color: #444;
                }

                #chat-form button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    background-color: #1e90ff;
                    color: #fff;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }

                #chat-form button:hover {
                    background-color: #1c86ee;
                }
            </style>
        </head>
        <body>
            <div class="chat-container">
                <h1>📜 Real-Time Chat</h1>
                <div id="chat-box" class="chat-box"></div>
                <form id="chat-form">
                    <input id="chat-input" type="text" placeholder="Type your message here..." autocomplete="off" required />
                    <button type="submit">Send</button>
                </form>
            </div>

            <!-- Socket.IO Client Library -->
            <script src="/socket.io/socket.io.js"></script>
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    const socket = io();

                    const chatForm = document.getElementById('chat-form');
                    const chatInput = document.getElementById('chat-input');
                    const chatBox = document.getElementById('chat-box');

                    // Prompt user for a username
                    let username = prompt("Enter your username:");
                    if (!username) {
                        username = 'Anonymous';
                    }

                    // Emit joinChat event to notify the server
                    socket.emit('joinChat', username);

                    // Handle form submission
                    chatForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const message = chatInput.value.trim();
                        if (message.length === 0) return;

                        // Emit the message to the server
                        socket.emit('chatMessage', { username, message });

                        // Clear the input field
                        chatInput.value = '';
                        chatInput.focus();
                    });

                    // Listen for incoming chat messages
                    socket.on('chatMessage', (data) => {
                        const messageElement = document.createElement('div');
                        messageElement.classList.add('message');

                        const usernameElement = document.createElement('span');
                        usernameElement.classList.add('username');
                        usernameElement.textContent = data.username + ':';

                        const messageContent = document.createElement('span');
                        messageContent.classList.add('message-content');
                        messageContent.textContent = ' ' + data.message;

                        messageElement.appendChild(usernameElement);
                        messageElement.appendChild(messageContent);
                        chatBox.appendChild(messageElement);

                        // Scroll to the bottom
                        chatBox.scrollTop = chatBox.scrollHeight;
                    });

                    // Listen for user connection notifications
                    socket.on('userConnected', (user) => {
                        const infoElement = document.createElement('div');
                        infoElement.classList.add('info');
                        infoElement.textContent = \`\${user} has joined the chat.\`;
                        chatBox.appendChild(infoElement);

                        // Scroll to the bottom
                        chatBox.scrollTop = chatBox.scrollHeight;
                    });

                    // Listen for user disconnection notifications
                    socket.on('userDisconnected', (user) => {
                        const infoElement = document.createElement('div');
                        infoElement.classList.add('info');
                        infoElement.textContent = \`\${user} has left the chat.\`;
                        chatBox.appendChild(infoElement);

                        // Scroll to the bottom
                        chatBox.scrollTop = chatBox.scrollHeight;
                    });
                });
            </script>
        </body>
        </html>
    `);
});

// ================== Asynchronous Tasks ================== //

// Function to fetch and parse Reddit RSS feed
async function fetchRedditRSS() {
  logger.info('Commencing fetch of Reddit RSS feed.', { url: REDDIT_RSS_URL, source: 'fetchRedditRSS' });
  try {
    const response = await axios.get(REDDIT_RSS_URL);
    const rssData = response.data;
    const parser = new xml2js.Parser({ explicitArray: false, explicitCharkey: true });
    const jsonData = await parser.parseStringPromise(rssData);
    logger.info('Reddit RSS feed successfully fetched and parsed.', { source: 'fetchRedditRSS' });
    return jsonData;
  } catch (error) {
    logger.error('Error whilst fetching Reddit RSS feed.', { error: error.message, source: 'fetchRedditRSS' });
    return null;
  }
}

// Function to post the 5 newest posts from the Reddit RSS feed to Discord using JSON format
async function postNewestToDiscord() {
  logger.info('Initiating the process to post newest Reddit posts to Discord.', { source: 'postNewestToDiscord' });
  const redditData = await fetchRedditRSS();

  if (!redditData || !redditData.feed || !redditData.feed.entry) {
    logger.error('Invalid Reddit RSS feed data received.', { data: redditData, source: 'postNewestToDiscord' });
    return;
  }

  // Ensure entries is always an array
  const entries = Array.isArray(redditData.feed.entry) ? redditData.feed.entry : [redditData.feed.entry];
  const newestPosts = entries.slice(0, 5);
  logger.info('Extracted the newest posts from Reddit.', { count: newestPosts.length, source: 'postNewestToDiscord' });

  if (newestPosts.length === 0) {
    logger.warn('No new posts found to dispatch.', { source: 'postNewestToDiscord' });
    return;
  }

  const ukTime = new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Europe/London',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Send the initial message before the first embed
  let payload = {
    content: `📜 **Hear ye! A proclamation from the realm of Reddit!**\n🕰️ Fetched at the hour of ${ukTime} UK time`,
  };

  try {
    await axios.post(DISCORD_WEBHOOK_URL, payload);
    logger.info('Initial message posted to Discord successfully.', { payloadSent: true, source: 'postNewestToDiscord' });
  } catch (error) {
    logger.error('Error whilst posting initial message to Discord.', { error: error.message, source: 'postNewestToDiscord' });
    if (error.response && error.response.data) {
      logger.error('Discord API Response:', { response: error.response.data, source: 'postNewestToDiscord' });
    }
    return;
  }

  // Send each post as a separate embed
  for (const post of newestPosts) {
    const postTitle = typeof post.title === 'string' ? decode(post.title) : decode(post.title._ || '');
    const postContentRaw = post.content ? (typeof post.content === 'string' ? post.content : post.content._ || '') : 'No content provided';
    const postContentStripped = postContentRaw.replace(/<\/?[^>]+(>|$)/g, '').trim();
    const postContent = decode(postContentStripped);
    const postLink = post.link && post.link.href ? post.link.href : 'https://reddit.com';
    const postAuthor = post.author && post.author.name ? (typeof post.author.name === 'string' ? post.author.name : post.author.name._ || '') : 'Unknown';
    const postImage = post['media:thumbnail'] && post['media:thumbnail'].$ && post['media:thumbnail'].$.url ? post['media:thumbnail'].$.url : null;

    const embed = {
      title: postTitle.length > 256 ? postTitle.slice(0, 253) + '...' : postTitle,
      url: postLink,
      description: postContent.length > 2048 ? postContent.slice(0, 2045) + '...' : postContent,
      color: 0x1e90ff, // DodgerBlue color
      timestamp: new Date().toISOString(),
      author: { name: `Posted by ${postAuthor.length > 256 ? postAuthor.slice(0, 253) + '...' : postAuthor}` },
      image: postImage ? { url: postImage } : undefined,
    };

    payload = {
      embeds: [embed],
    };

    try {
      await axios.post(DISCORD_WEBHOOK_URL, payload);
      logger.info('Embed posted to Discord successfully.', { payloadSent: true, source: 'postNewestToDiscord' });
    } catch (error) {
      logger.error('Error whilst posting embed to Discord.', { error: error.message, source: 'postNewestToDiscord' });
      if (error.response && error.response.data) {
        logger.error('Discord API Response:', { response: error.response.data, source: 'postNewestToDiscord' });
      }
    }
  }
}

// Schedule to post every 30 seconds (30,000 ms)
setInterval(postNewestToDiscord, 30000);

// ================== Start the Server ================== //

// Start the server using the HTTP server (required for Socket.IO)
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running at http://us2.bot-hosting.net:${PORT}`);
});

// ================== 404 Error Handler ================== //
app.use((req, res) => {
  logger.warn('Unknown endpoint accessed.', { path: req.path, source: '404Handler' });
  res.status(404).json({ error: 'Oh dear! The page thou seekest is not to be found.' });
});
