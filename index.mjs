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

// ================== Configuration Constants ================== //

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1283861457007673506/w4zSpCb8m-hO5tf5IP4tcq-QiNgHmLz4mTUztPusDlZOhC0ULRhC64SMMZF2ZFTmM6eT';
const PORT = 21560;
const REDDIT_RSS_URL = 'https://www.reddit.com/r/all/new/.rss';
const RESERVED_USERNAME = 'REDACTED';
const RESERVED_PASSWORD = 'REDACTED';

// ================== Setup Directory Paths ================== //

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== Initialize Express App ================== //

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const shuffledImages = shuffleArray([...allTestImages]);
const testImage1List = shuffledImages.slice(0, 5);
const testImage2List = shuffledImages.slice(5, 10);

function getRandomImage(imageList) {
  if (!Array.isArray(imageList) || imageList.length === 0) {
    logger.warn('Image list is empty or invalid.', { source: 'getRandomImage' });
    return 'https://i.ibb.co/wgfvKYb/2.jpg';
  }
  const randomIndex = Math.floor(Math.random() * imageList.length);
  const selectedImage = imageList[randomIndex];
  logger.debug('Random image selected.', { imageUrl: selectedImage, source: 'getRandomImage' });
  return selectedImage;
}

function getRandomProfilePicture() {
  const randomUsername = crypto.randomBytes(4).toString('hex');
  const profilePictureUrl = `https://robohash.org/${randomUsername}.png`;
  logger.debug('Generated random profile picture URL.', { profilePictureUrl, source: 'getRandomProfilePicture' });
  return profilePictureUrl;
}

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

// ================== Chat Message Storage ================== //

const chatHistory = [];
const validTokens = {};

// ================== Routes ================== //

app.get('/', async (req, res) => {
  logger.info('Root endpoint accessed.', { endpoint: '/' });
  try {
    const updates = await getUpdates();
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>MonkeyBytes-API Dashboard</title>
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
              .box p { 
                  line-height: 1.6; 
              }
          </style>
      </head>
      <body>
          <h1>Welcome to the MonkeyBytes-API</h1>
          <div class="box">
              <h2>About the API</h2>
              <p>This API allows users to interact with various endpoints, providing random images, bot names, and facts styled after medieval English.</p>
          </div>
          <div class="box">
              <h2>Code Structure</h2>
              <p>The code is organized into multiple sections:</p>
              <ul>
                  <li><strong>Configuration Constants:</strong> This section defines constants like port numbers, URLs, and reserved credentials.</li>
                  <li><strong>Utility Functions:</strong> Contains helper functions for shuffling images, generating random names, and retrieving updates.</li>
                  <li><strong>Routes:</strong> Defines the API endpoints, including this root route and others like <code>/testing</code> and <code>/chat</code>.</li>
                  <li><strong>Socket.IO Integration:</strong> Handles real-time communication with connected clients.</li>
                  <li><strong>Asynchronous Tasks:</strong> Manages tasks like fetching and posting Reddit RSS data to Discord.</li>
              </ul>
          </div>
          <div class="box">
              <h2>Random Images</h2>
              <p>This API provides randomly selected images from a predefined list, ensuring a unique experience with every request.</p>
          </div>
          <div class="box">
              <h2>Random Bot Names</h2>
              <p>Need a bot name? This API can generate a random name composed of an adjective and noun, with a four-digit number appended.</p>
          </div>
          <div class="box">
              <h2>Fun Facts</h2>
              <p>For a bit of fun, the API also returns facts styled in the speech of 1066 UK, adding a whimsical touch to your interactions.</p>
          </div>
          <div class="box">
              <h2>Guide for Dummies</h2>
              <p>Using this API is as simple as pie:</p>
              <ol>
                  <li>To get a random image, simply send a GET request to <code>/testing</code>.</li>
                  <li>If you want a random bot name, you'll also find it in the response from <code>/testing</code>.</li>
                  <li>Want a fun fact? You guessed it—<code>/testing</code> will give you one, too!</li>
                  <li>Need to chat? Visit the <code>/chat</code> endpoint to start a real-time conversation.</li>
              </ol>
          </div>
          <div class="box">
              <h2>Latest Updates</h2>
              ${updates
                .map(
                  (update) => `
              <div class="box">
                  <h3>${update.updateText}</h3>
                  <p>${update.description.replace(/\n/g, '<br>')}</p>
              </div>
              `
                )
                .join('')}
          </div>
          <div class="box">
              <h2>NPM Packages Used</h2>
              <ul>
                  <li><strong>express:</strong> A web application framework for building APIs and handling HTTP requests and responses.</li>
                  <li><strong>fs/promises:</strong> A promise-based API for interacting with the file system, used to read the updates.json file.</li>
                  <li><strong>path:</strong> A utility module for handling and transforming file paths, used to locate files within the project.</li>
                  <li><strong>winston:</strong> A versatile logging library for recording logs with timestamps and formatting them with colors.</li>
                  <li><strong>helmet:</strong> A middleware that helps secure Express apps by setting various HTTP headers.</li>
                  <li><strong>axios:</strong> A promise-based HTTP client used for making requests to external APIs like Reddit and Discord.</li>
                  <li><strong>xml2js:</strong> A library for parsing XML data into JSON format, used to process Reddit's RSS feed.</li>
                  <li><strong>crypto:</strong> A module providing cryptographic functionalities, used for generating random values like bot names and tokens.</li>
                  <li><strong>html-entities:</strong> A library for decoding HTML entities, used to clean up text retrieved from external APIs.</li>
                  <li><strong>socket.io:</strong> A library for enabling real-time, bidirectional communication between web clients and servers.</li>
                  <li><strong>http:</strong> A core Node.js module used to create an HTTP server, which is necessary for integrating with Socket.IO.</li>
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

    res.json(randomFact);
  } catch (error) {
    logger.error('An error hath occurred within the /testing route.', { error: error.message, source: '/testing' });
    res.status(500).json({
      error: 'Alas! An error hath occurred while fetching data. Please try again later.',
    });
  }
});

// ================== Socket.IO Integration ================== //

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  logger.info('A user connected via Socket.IO', { socketId: socket.id });

  socket.emit('chatHistory', chatHistory);

  socket.on('joinChat', (data) => {
    const { username, authToken } = data;
    const reservedNames = [RESERVED_USERNAME.toLowerCase()];

    if (reservedNames.includes(username.toLowerCase())) {
      if (validTokens[authToken] && validTokens[authToken] === username) {
        socket.username = username;
        logger.info(`User reconnected as ${socket.username}`, { socketId: socket.id });
        io.emit('userConnected', socket.username);
      } else {
        socket.emit('loginRequired', { message: 'Login required for reserved username.' });
        return;
      }
    } else {
      socket.username = username || 'Anonymous';
      logger.info(`User joined the chat: ${socket.username}`, { socketId: socket.id });
      io.emit('userConnected', socket.username);
    }
  });

  socket.on('login', (credentials) => {
    const { username, password } = credentials;

    if (username.toLowerCase() === RESERVED_USERNAME.toLowerCase()) {
      if (password === RESERVED_PASSWORD) {
        socket.username = username;
        const token = crypto.randomBytes(16).toString('hex');
        validTokens[token] = username;
        logger.info(`User logged in successfully as ${socket.username}`, { socketId: socket.id });
        socket.emit('loginSuccess', { message: 'Login successful!', token });
        io.emit('userConnected', socket.username);
      } else {
        socket.emit('loginFailed', { message: 'Incorrect password.' });
        logger.warn('Login failed: incorrect password', { socketId: socket.id });
      }
    } else {
      socket.emit('loginFailed', { message: 'Reserved username login failed.' });
    }
  });

  socket.on('chatMessage', (data) => {
    const { username, message } = data;
    logger.info('Received chat message', { username, message, socketId: socket.id });

    const chatMessage = { username, message };
    chatHistory.push(chatMessage);

    io.emit('chatMessage', chatMessage);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('userDisconnected', socket.username);
      logger.info('User disconnected', { username: socket.username, socketId: socket.id });
      for (const token in validTokens) {
        if (validTokens[token] === socket.username) {
          delete validTokens[token];
          break;
        }
      }
    } else {
      logger.info('A user disconnected', { socketId: socket.id });
    }
  });
});

// ================== Asynchronous Tasks ================== //

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

async function postNewestToDiscord() {
  logger.info('Initiating the process to post newest Reddit posts to Discord.', { source: 'postNewestToDiscord' });
  const redditData = await fetchRedditRSS();

  if (!redditData || !redditData.feed || !redditData.feed.entry) {
    logger.error('Invalid Reddit RSS feed data received.', { data: redditData, source: 'postNewestToDiscord' });
    return;
  }

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

  for (const post of newestPosts) {
    const postTitle = typeof post.title === 'string' ? decode(post.title) : decode(post.title._ || '');
    const postContentRaw = post.content
      ? typeof post.content === 'string'
        ? post.content
        : post.content._ || ''
      : 'No content provided';
    const postContentStripped = postContentRaw.replace(/<\/?[^>]+(>|$)/g, '').trim();
    const postContent = decode(postContentStripped);
    const postLink = post.link && post.link.href ? post.link.href : 'https://reddit.com';
    const postAuthor =
      post.author && post.author.name
        ? typeof post.author.name === 'string'
          ? post.author.name
          : post.author.name._ || ''
        : 'Unknown';
    const postImage =
      post['media:thumbnail'] && post['media:thumbnail'].$ && post['media:thumbnail'].$.url
        ? post['media:thumbnail'].$.url
        : null;

    const embed = {
      title: postTitle.length > 256 ? postTitle.slice(0, 253) + '...' : postTitle,
      url: postLink,
      description: postContent.length > 2048 ? postContent.slice(0, 2045) + '...' : postContent,
      color: 0x1e90ff,
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

setInterval(postNewestToDiscord, 30000);

// ================== Start the Server ================== //

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running at http://us2.bot-hosting.net:${PORT}`);
});

// ================== 404 Error Handler ================== //

app.use((req, res) => {
  logger.warn('Unknown endpoint accessed.', { path: req.path, source: '404Handler' });
  res.status(404).json({ error: 'Oh dear! The page thou seekest is not to be found.' });
});
