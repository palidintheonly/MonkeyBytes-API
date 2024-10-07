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
import xml2js from 'xml2js';
import { decode } from 'html-entities';

// ================== Configuration Constants ================== //
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1283861457007673506/w4zSpCb8m-hO5tf5IP4tcq-QiNgHmLz4mTUztPusDlZOhC0ULRhC64SMMZF2ZFTmM6eT';
const DISCORD_WEBHOOK_URL_2 = 'https://discord.com/api/webhooks/1289677050554224661/F8BUQn0hQvsNFlfeJvfXCNcBfWpINo_wcvaWi-uyKLOIYXKkA-F8Rj716bqOBScUetwy';
const PORT = 21560;
const REDDIT_RSS_URL_1 = 'https://www.reddit.com/r/all/new/.rss';
const REDDIT_RSS_URL_2 = 'https://www.reddit.com/r/discordapp/new/.rss';

// ================== Setup Directory Paths ================== //
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== Initialize Express App ================== //
const app = express();

// Apply security-related headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

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
  const adjectives = ['Purring', 'Sneaky', 'Clawy', 'Fluffy', 'Whiskery', 'Playful', 'Curious', 'Cuddly', 'Mischievous'];
  const nouns = ['Furball', 'Whiskers', 'Meowster', 'Purrfect', 'Clawson', 'Kittypaw', 'Feline', 'Tailchaser', 'Napster'];
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

// Root Endpoint with Server Metrics and Updates
app.get('/', async (req, res) => {
  logger.info('The noble root endpoint hath been accessed.', { endpoint: '/' });
  try {
    const updates = await getUpdates();

    // Check if updates is an array
    const updatesHtml = Array.isArray(updates)
      ? updates
          .map(
            (update) => `
          <div class="box">
              <h3>${update.updateText}</h3>
              <p>${update.description.replace(/\n/g, '<br>')}</p>
          </div>
          `
          )
          .join('')
      : `<div class="box">
          <h3>${updates.updateText || 'No Updates'}</h3>
          <p>${updates.description ? updates.description.replace(/\n/g, '<br>') : 'No description available'}</p>
        </div>`;

    // Get server metrics
    const serverUptime = process.uptime();
    const hours = Math.floor(serverUptime / 3600);
    const minutes = Math.floor((serverUptime % 3600) / 60);
    const seconds = Math.floor(serverUptime % 60);

    const serverDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Europe/London',
    });

    const serverTime = new Date().toLocaleTimeString('en-GB', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/London',
    });

    // Create a script to constantly update the server time on the frontend
    const timeUpdateScript = `
      <script>
        function updateTime() {
          const now = new Date();
          const options = { 
            timeZone: 'Europe/London', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
          };
          document.getElementById('server-time').innerText = now.toLocaleTimeString('en-GB', options);
        }
        setInterval(updateTime, 1000); // Update time every second
      </script>
    `;

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
              <h2>Latest Decrees</h2>
              ${updatesHtml}
          </div>
          <div class="box">
              <h2>Server Metrics (UK Timezone)</h2>
              <p><strong>Thy server hath been up for:</strong> ${hours} hours, ${minutes} minutes, and ${seconds} seconds.</p>
              <p><strong>The day of our Lord is:</strong> ${serverDate}.</p>
              <p><strong>The hour doth strike:</strong> <span id="server-time">${serverTime}</span> in the fair lands of the United Kingdom.</p>
          </div>

          ${timeUpdateScript}
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
    // Fetch two random cat images from The Cat API
    const testImage1 = await getRandomCatImage();
    const testImage2 = await getRandomCatImage();

    // Fetch a random cat fact from the catfact.ninja API
    const factResponse = await axios.get('https://catfact.ninja/fact');
    const randomFact = factResponse.data.fact;

    // Generate a random bot name
    const botName = generateRandomBotName();

    // Generate a random profile picture based on bot name
    const avatarUrl = getRandomProfilePicture(botName);

    const responseData = {
      testText: `${randomFact}`,
      testimage1: testImage1.url,
      testimage2: testImage2.url,
      testingBotName: botName,
      avatar: avatarUrl,
      ukUnix: Math.floor(Date.now() / 1000),
    };

    res.json(responseData);
  } catch (error) {
    logger.error('An error hath occurred within the /testing route.', { error: error.message, source: '/testing' });
    res.status(500).json({
      error: 'Alas! An error hath occurred while fetching data. Please try again later.',
    });
  }
});

// ================== Reddit Fetching and Posting ================== //

async function fetchRedditRSS(url) {
  logger.info('Fetching Reddit RSS feed.', { url });
  try {
    const response = await axios.get(url);
    const rssData = response.data;
    const parser = new xml2js.Parser({ explicitArray: false, explicitCharkey: true });
    const jsonData = await parser.parseStringPromise(rssData);
    logger.info('Reddit RSS feed fetched and parsed successfully.', { url });
    return jsonData;
  } catch (error) {
    logger.error('Error fetching Reddit RSS feed.', { error: error.message });
    return null;
  }
}

async function postToDiscord(webhookUrl, rssData) {
  if (!rssData || !rssData.feed || !rssData.feed.entry) {
    logger.warn('Invalid Reddit RSS feed data received.');
    return;
  }

  const entries = Array.isArray(rssData.feed.entry) ? rssData.feed.entry : [rssData.feed.entry];
  const newestPosts = entries.slice(0, 5); // Get the top 5 posts

  const ukTime = new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Europe/London',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const payload = {
    content: `📜 Hear ye, noble lords and ladies! A new proclamation hath been made!\n🕰️ As of the hour of ${ukTime} UK time.`,
  };

  try {
    await axios.post(webhookUrl, payload);
    logger.info('Proclamation posted to Discord successfully.');

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

      await axios.post(webhookUrl, { embeds: [embed] });
      logger.info('Embed posted to Discord successfully.');
    }
  } catch (error) {
    logger.error('Error posting to Discord.', { error: error.message });
  }
}

async function postNewestToDiscord() {
  const redditData1 = await fetchRedditRSS(REDDIT_RSS_URL_1);
  await postToDiscord(DISCORD_WEBHOOK_URL, redditData1);

  const redditData2 = await fetchRedditRSS(REDDIT_RSS_URL_2);
  await postToDiscord(DISCORD_WEBHOOK_URL_2, redditData2);
}

// Fetch and post Reddit RSS data every 5 minutes
setInterval(postNewestToDiscord, 300000);

// Post once at startup
postNewestToDiscord();

// ================== Start the Server ================== //
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`The server is running at http://localhost:${PORT}`);
});

// ================== 404 Error Handler ================== //
app.use((req, res) => {
  logger.warn('An unknown endpoint hath been accessed.', { path: req.path, source: '404Handler' });
  res.status(404).json({ error: 'Oh dear! The page thou seekest is not to be found.' });
});
