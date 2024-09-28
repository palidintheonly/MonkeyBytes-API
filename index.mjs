import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import helmet from 'helmet';
import axios from 'axios';
import xml2js from 'xml2js';
import { decode } from 'html-entities';

// ================== Configuration Constants ================== //

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1283861457007673506/w4zSpCb8m-hO5tf5IP4tcq-QiNgHmLz4mTUztPusDlZOhC0ULRhC64SMMZF2ZFTmM6eT';
const PORT = 21560;
const REDDIT_RSS_URL = 'https://www.reddit.com/r/all/new/.rss';

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

async function getRandomDogImage() {
  try {
    const response = await axios.get('https://dog.ceo/api/breeds/image/random');
    logger.debug('Random dog image fetched.', { imageUrl: response.data.message, source: 'getRandomDogImage' });
    return response.data.message;
  } catch (error) {
    logger.error('Error fetching random dog image.', { error: error.message, source: 'getRandomDogImage' });
    return 'https://i.ibb.co/wgfvKYb/2.jpg';
  }
}

function generateRandomBotName() {
  const adjectives = [
    'Barking',
    'Waggy',
    'Sniffy',
    'Drooly',
    'Furry',
    'Pawsy',
    'Playful',
    'Chewy',
    'Fluffy',
  ];

  const nouns = [
    'Tailwagger',
    'Bonechaser',
    'Pawsome',
    'Snoutster',
    'Whisker',
    'Furball',
    'Barker',
    'Woofster',
    'Pupper',
  ];

  const number = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  const botName = `${randomAdjective}${randomNoun}${number}`;
  logger.debug('Generated random doggy bot name.', { botName, source: 'generateRandomBotName' });
  return botName;
}

const facts = [
  {
    id: 'fact1',
    testText:
      "In days of old, the hound did serve as loyal guardian, ever watchful by the hearth and field.",
  },
  {
    id: 'fact2',
    testText:
      'The noble hound dost know the way of the hunt, guiding its master with nose keen and eyes sharp.',
  },
  {
    id: 'fact3',
    testText:
      'By the fire’s glow, the hound dost lay, a companion steadfast through cold and storm.',
  },
  {
    id: 'fact4',
    testText:
      'No truer friend hath man than the hound, whose loyalty doth shine brighter than gold.',
  },
  {
    id: 'fact5',
    testText:
      'In many a battle, the hound stood by its master’s side, fearless and true in the face of danger.',
  },
  {
    id: 'fact6',
    testText:
      'The bark of a hound doth ward off evil spirits, or so the old tales tell.',
  },
  {
    id: 'fact7',
    testText:
      'In the chase, the hound dost fly with speed unmatched, bringing swift end to the quarry.',
  },
  {
    id: 'fact8',
    testText:
      'To a hound, the bond of friendship is as sacred as any vow, held strong through time and trial.',
  },
  {
    id: 'fact9',
    testText:
      'The hound’s sense of smell doth rival even the sharpest of minds, discerning scent with unmatched skill.',
  },
  {
    id: 'fact10',
    testText:
      'From pup to old age, the hound remains a source of joy and comfort, a true blessing in life’s journey.',
  },
];

// ================== Routes ================== //

// Root Endpoint
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
              .box h3 { 
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
                  <li><strong>Routes:</strong> Defines the API endpoints, including this root route and others like <code>/testing</code>.</li>
                  <li><strong>NPM Packages Used:</strong>
                      <ul>
                          <li><strong>express:</strong> A web application framework for building APIs and handling HTTP requests and responses.</li>
                          <li><strong>fs/promises:</strong> A promise-based API for interacting with the file system, used to read the updates.json file.</li>
                          <li><strong>path:</strong> A utility module for handling and transforming file paths, used to locate files within the project.</li>
                          <li><strong>winston:</strong> A versatile logging library for recording logs with timestamps and formatting them with colors.</li>
                          <li><strong>helmet:</strong> A middleware that helps secure Express apps by setting various HTTP headers.</li>
                          <li><strong>axios:</strong> A promise-based HTTP client used for making requests to external APIs like Reddit and Discord.</li>
                          <li><strong>xml2js:</strong> A library for parsing XML data into JSON format, used to process Reddit's RSS feed.</li>
                          <li><strong>html-entities:</strong> A library for decoding HTML entities, used to clean up text retrieved from external APIs.</li>
                      </ul>
                  </li>
              </ul>
          </div>
          <div class="box">
              <h2>Features</h2>
              <div class="box">
                  <h3>Random Images</h3>
                  <p>This API provides randomly selected images from the Dog CEO API, ensuring a unique experience with every request.</p>
              </div>
              <div class="box">
                  <h3>Random Bot Names</h3>
                  <p>Need a bot name? This API can generate a random name composed of an adjective and noun, with a four-digit number appended.</p>
              </div>
              <div class="box">
                  <h3>Fun Facts</h3>
                  <p>For a bit of fun, the API also returns facts about man’s first best friend styled in the speech of 1066 UK, adding a whimsical touch to your interactions.</p>
              </div>
          </div>
          <div class="box">
              <h2>Guide for Dummies</h2>
              <p>Using this API is as simple as pie:</p>
              <ol>
                  <li>To get a random image, simply send a GET request to <code>/testing</code>.</li>
                  <li>If you want a random bot name, you'll also find it in the response from <code>/testing</code>.</li>
                  <li>Want a fun fact? You guessed it—<code>/testing</code> will give you one, too!</li>
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
  logger.info('Endpoint accessed.', { endpoint: '/testing' });

  try {
    const testImage1Url = await getRandomDogImage();
    const testImage2Url = await getRandomDogImage();
    const botName = generateRandomBotName();
    const randomIndex = Math.floor(Math.random() * facts.length);
    const randomFact = { ...facts[randomIndex] };

    logger.debug('Random fact selected.', { factId: randomFact.id, source: '/testing' });

    randomFact.dateUnixUK = Math.floor(Date.now() / 1000);
    randomFact.testimage1 = testImage1Url;
    randomFact.testimage2 = testImage2Url;
    randomFact.testingBotName = botName;

    res.json(randomFact);
  } catch (error) {
    logger.error('An error hath occurred within the /testing route.', { error: error.message, source: '/testing' });
    res.status(500).json({
      error: 'Alas! An error hath occurred while fetching data. Please try again later.',
    });
  }
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

// Fetch and post Reddit RSS data every 30 seconds
setInterval(postNewestToDiscord, 30000);

// ================== Start the Server ================== //

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running at http://us2.bot-hosting.net:${PORT}`);
});

// ================== 404 Error Handler ================== //

app.use((req, res) => {
  logger.warn('Unknown endpoint accessed.', { path: req.path, source: '404Handler' });
  res.status(404).json({ error: 'Oh dear! The page thou seekest is not to be found.' });
});

// ================== Helper Functions ================== //

// Simple sanitization function to escape HTML characters
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
