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
const DISCORD_WEBHOOK_URL_ALT = 'https://discord.com/api/webhooks/1289677050554224661/F8BUQn0hQvsNFlfeJvfXCNcBfWpINo_wcvaWi-uyKLOIYXKkA-F8Rj716bqOBScUetwy';
const PORT = 21560;
const REDDIT_RSS_URL = 'https://www.reddit.com/r/all/new/.rss';
const REDDIT_RSS_URL_ALT = 'https://www.reddit.com/r/discordapp/new.rss';

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

// ================== State Variables ================== //

let lastPostIds = {
  [REDDIT_RSS_URL]: [],
  [REDDIT_RSS_URL_ALT]: [],
};

// ================== Utility Functions ================== //

async function fetchRedditRSS(url) {
  logger.info(`Commencing fetch of Reddit RSS feed from ${url}.`, { url, source: 'fetchRedditRSS' });
  try {
    const response = await axios.get(url);
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

async function postEmbedsSeparately(webhookUrl, proclamationMessage, embeds) {
  // Post the title message first
  try {
    await axios.post(webhookUrl, { content: proclamationMessage });
    logger.info('Proclamation message posted to Discord successfully.', { source: 'postEmbedsSeparately' });
  } catch (error) {
    logger.error('Error posting the proclamation message to Discord.', { error: error.message, source: 'postEmbedsSeparately' });
    return;
  }

  // Post each embed separately
  for (const embed of embeds) {
    const payload = {
      embeds: [embed],
    };

    try {
      await axios.post(webhookUrl, payload);
      logger.info('Embed posted to Discord successfully.', { payloadSent: true, source: 'postEmbedsSeparately' });
    } catch (error) {
      logger.error('Error whilst posting an embed to Discord.', { error: error.message, source: 'postEmbedsSeparately' });
      if (error.response && error.response.data) {
        logger.error('Discord API Response:', { response: error.response.data, source: 'postEmbedsSeparately' });
      }
    }
  }
}

async function postNewestToDiscord(webhookUrl, redditData, previousPostIds, urlKey) {
  logger.info(`Initiating the process to post the newest Reddit posts to Discord via webhook ${webhookUrl}.`, { source: 'postNewestToDiscord' });

  if (!redditData || !redditData.feed || !redditData.feed.entry) {
    logger.error('Invalid Reddit RSS feed data received.', { data: redditData, source: 'postNewestToDiscord' });
    return;
  }

  const entries = Array.isArray(redditData.feed.entry) ? redditData.feed.entry : [redditData.feed.entry];
  const newestPosts = entries.slice(0, 5);

  const newPostIds = newestPosts.map(post => post.id);
  const isNewPostAvailable = newPostIds.some(id => !previousPostIds.includes(id));

  if (!isNewPostAvailable) {
    logger.info('No new posts to report.', { source: 'postNewestToDiscord' });

    const ukTime = new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Europe/London',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const noNewPostsMessage = `📜 **Hear ye, noble lords and ladies!**\n🕰️ As of the hour of ${ukTime} UK time, no new proclamations hath been made from the land of Reddit. We shall keep watch for any new tidings.`;

    try {
      await axios.post(webhookUrl, { content: noNewPostsMessage });
      logger.info('No new posts message sent to Discord successfully.', { source: 'postNewestToDiscord' });
    } catch (error) {
      logger.error('Error whilst posting no new posts message to Discord.', { error: error.message, source: 'postNewestToDiscord' });
    }
    return;
  }

  const ukTime = new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Europe/London',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const proclamationMessage = `📜 **Hear ye, noble lords and ladies! A new proclamation hath been made!**\n🕰️ As of the hour of ${ukTime} UK time.`;

  const embeds = [];

  for (const post of newestPosts) {
    if (previousPostIds.includes(post.id)) continue;

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

    embeds.push(embed);
  }

  if (embeds.length > 0) {
    await postEmbedsSeparately(webhookUrl, proclamationMessage, embeds);
  }

  lastPostIds[urlKey] = newPostIds;
}

// ================== Task Schedulers ================== //

async function handleRedditFetches() {
  const redditData1 = await fetchRedditRSS(REDDIT_RSS_URL);
  const redditData2 = await fetchRedditRSS(REDDIT_RSS_URL_ALT);

  await postNewestToDiscord(DISCORD_WEBHOOK_URL, redditData1, lastPostIds[REDDIT_RSS_URL], REDDIT_RSS_URL);
  await postNewestToDiscord(DISCORD_WEBHOOK_URL_ALT, redditData2, lastPostIds[REDDIT_RSS_URL_ALT], REDDIT_RSS_URL_ALT);
}

// Send webhooks at server startup
handleRedditFetches();

// Fetch and post Reddit RSS data every 5 minutes (300000ms)
setInterval(handleRedditFetches, 300000);

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
                  <li><strong>Utility Functions:</strong> The realm is blessed with helper functions for reading scrolls, fetching random images of hounds, generating bot names, and more.</li>
                  <li><strong>Routes:</strong> These noble pathways allow guests to interact with the kingdom's API:
                      <ul>
                          <li><strong>/:</strong> The grand gateway to the kingdom, where noble lords and ladies may learn of the API’s purpose and latest decrees.</li>
                          <li><strong>/testing:</strong> A path of great intrigue, where visitors shall receive a randomized image of a hound, a bot name fit for a playful pup, and a fact worthy of any royal court's conversation.</li>
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
                          <li><strong>xml2js:</strong> A wise translator, converting the arcane language of XML into JSON for easier understanding.</li>
                          <li><strong>html-entities:</strong> A tool for decoding the magical symbols found within external scrolls and messages.</li>
                      </ul>
                  </li>
              </ul>
          </div>
          <div class="box">
              <h2>A Guide for the Unenlightened</h2>
              <p>Using this API is as simple as breaking one's fast:</p>
              <ol>
                  <li>To receive a random image, simply dispatch a GET request to <code>/testing</code>.</li>
                  <li>If thou dost desire a random bot name, it shall also be found in the response from <code>/testing</code>.</li>
                  <li>If a fun fact is what thou seekest, verily—<code>/testing</code> shall bestow one upon thee!</li>
              </ol>
          </div>
          <div class="box">
              <h2>Latest Decrees</h2>
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
  logger.info('The testing endpoint hath been accessed.', { endpoint: '/testing' });

  try {
    // Fetch two random dog images
    const testImage1Url = await getRandomDogImage();
    const testImage2Url = await getRandomDogImage();

    // Generate a random bot name
    const botName = generateRandomBotName();
    
    // Select a random fact
    const randomIndex = Math.floor(Math.random() * facts.length);
    const randomFact = { ...facts[randomIndex] };

    // Generate a random profile picture based on bot name
    const avatarUrl = getRandomProfilePicture(botName);

    logger.debug('Random fact selected.', { factId: randomFact.id, source: '/testing' });

    randomFact.dateUnixUK = Math.floor(Date.now() / 1000);
    randomFact.testimage1 = testImage1Url;
    randomFact.testimage2 = testImage2Url;
    randomFact.testingBotName = botName;
    randomFact.avatar = avatarUrl;

    res.json(randomFact);
  } catch (error) {
    logger.error('An error hath occurred within the /testing route.', { error: error.message, source: '/testing' });
    res.status(500).json({
      error: 'Alas! An error hath occurred while fetching data. Please try again later.',
    });
  }
});

// ================== Start the Server ================== //

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`The server is running at http://us2.bot-hosting.net:${PORT}`);
});

// ================== 404 Error Handler ================== //

app.use((req, res) => {
  logger.warn('An unknown endpoint hath been accessed.', { path: req.path, source: '404Handler' });
  res.status(404).json({ error: 'Oh dear! The page thou seekest is not to be found.' });
});

// ================== Helper Functions ================== //

// Fetch a random dog image from dog.ceo API
async function getRandomDogImage() {
  try {
    const response = await axios.get('https://dog.ceo/api/breeds/image/random');
    logger.debug('Random dog image fetched.', { imageUrl: response.data.message, source: 'getRandomDogImage' });
    return response.data.message;
  } catch (error) {
    logger.error('Error fetching random dog image.', { error: error.message, source: 'getRandomDogImage' });
    return 'https://i.ibb.co/wgfvKYb/2.jpg'; // Fallback image
  }
}

// Generate a random bot name
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
