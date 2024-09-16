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

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 21560;

// Utilize helmet for enhanced security
app.use(helmet());

// Enable JSON and URL-encoded body parsing (to handle POST requests with Unicode data)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Record the commencement time of the server
const serverStartTime = Date.now();

// Function to format uptime in days, hours, minutes, seconds
function formatUptime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
}

// Logger configuration (Winston)
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(
            ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
        )
    ),
    transports: [new winston.transports.Console()],
});

// Function to load updates dynamically from the updates.json file
async function getUpdates() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'updates.json'), 'utf-8');
        const updates = JSON.parse(data);
        return updates;
    } catch (error) {
        logger.error(`Error reading updates.json: ${error.message}`);
        return [];
    }
}

// Function to get a random dog image URL from random.dog
async function getRandomDogImage() {
    try {
        const response = await axios.get('https://random.dog/woof.json');
        const url = response.data.url;
        // Ensure the URL is a valid image (sometimes random.dog returns videos)
        if (url.endsWith('.mp4') || url.endsWith('.webm')) {
            return await getRandomDogImage(); // Retry if not an image
        }
        return url;
    } catch (error) {
        logger.error(`Error fetching random dog image: ${error.message}`);
        return 'https://via.placeholder.com/300x200?text=Error+fetching+image'; // Placeholder if there's an issue fetching the dog image
    }
}

// Function to get a random robohash profile picture using crypto for a secure random seed
async function getRandomProfilePicture() {
    try {
        const randomSeed = crypto.randomBytes(4).toString('hex'); // Convert 4 random bytes to a hexadecimal string
        return `https://robohash.org/${randomSeed}.png`; // Return the RoboHash image URL
    } catch (error) {
        logger.error(`Error fetching random profile picture: ${error.message}`);
        return 'https://via.placeholder.com/300x200?text=Error+fetching+profile+picture'; // Placeholder in case of error
    }
}

// Function to generate a random bot name
function generateRandomBotName() {
    const adjectives = ['Valiant', 'Noble', 'Mighty', 'Regal', 'Gallant'];
    const nouns = ['Knight', 'Baron', 'Lord', 'Squire', 'Monarch'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective}${randomNoun}${Math.floor(Math.random() * 1000)}`; // Generate a random bot name
}

// Function to fetch and parse Reddit RSS feed
async function fetchRedditRSS() {
    try {
        const response = await axios.get(REDDIT_RSS_URL);
        const rssData = response.data;
        const parser = new xml2js.Parser({ explicitArray: false, explicitCharkey: true });
        const jsonData = await parser.parseStringPromise(rssData);
        return jsonData;
    } catch (error) {
        logger.error(`Error fetching Reddit RSS feed: ${error.message}`);
        return null;
    }
}

// Helper function to clean HTML tags and decode HTML entities from the post content
function cleanHtmlContent(htmlContent) {
    // Ensure htmlContent is a string
    if (typeof htmlContent !== 'string') {
        htmlContent = '';
    }
    // Remove all HTML tags using regex
    let textContent = htmlContent.replace(/<\/?[^>]+(>|$)/g, '').trim();
    // Decode HTML entities
    textContent = decode(textContent);
    return textContent;
}

// Reddit RSS and Discord webhook URLs
const REDDIT_RSS_URL = 'https://www.reddit.com/r/all/new/.rss';
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1283861457007673506/w4zSpCb8m-hO5tf5IP4tcq-QiNgHmLz4mTUztPusDlZOhC0ULRhC64SMMZF2ZFTmM6eT'; // Replace with your actual webhook URL

// Function to post the 5 newest posts from the Reddit RSS feed to Discord using JSON format
async function postNewestToDiscord() {
    const redditData = await fetchRedditRSS();

    if (!redditData || !redditData.feed || !redditData.feed.entry) {
        logger.error('Invalid Reddit RSS feed data.');
        return;
    }

    const entries = Array.isArray(redditData.feed.entry)
        ? redditData.feed.entry
        : [redditData.feed.entry];
    const newestPosts = entries.slice(0, 5);

    // Correct the structure of the embed for Discord
    const embeds = newestPosts.map((post) => {
        const postTitle =
            typeof post.title === 'string' ? decode(post.title) : decode(post.title._);
        const postLink = post.link.href;
        const postAuthor =
            typeof post.author.name === 'string' ? post.author.name : post.author.name._;
        const postContentRaw = post.content
            ? typeof post.content === 'string'
                ? post.content
                : post.content._
            : 'No content provided';
        const postContent = cleanHtmlContent(postContentRaw); // Clean the HTML content to make it human-readable

        // Limit fields to Discord's character limits
        const title = postTitle.length > 256 ? postTitle.slice(0, 253) + '...' : postTitle;
        const description =
            postContent.length > 4096 ? postContent.slice(0, 4093) + '...' : postContent;
        const authorName =
            postAuthor.length > 256 ? postAuthor.slice(0, 253) + '...' : postAuthor;

        // Optional image
        const postImage = post['media:thumbnail'] ? post['media:thumbnail'].$.url : null;

        // Construct the embed object
        const embed = {
            title: title,
            url: postLink,
            description: description,
        };

        // Add author if authorName is available
        if (authorName) {
            embed.author = {
                name: `Posted by ${authorName}`,
            };
        }

        // Add image if available
        if (postImage) {
            embed.image = { url: postImage };
        }

        return embed;
    });

    // Get the current time in GB UK time zone with 24-hour format
    const ukTime = new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Europe/London',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    // Send message with content and embeds
    const payload = {
        content: `📜 **Hear ye! The 5 newest proclamations from the realm of Reddit have arrived!**\n🕰️ Fetched at the hour of ${ukTime} UK time`,
        embeds: embeds,
    };

    // Try posting to Discord
    try {
        await axios.post(DISCORD_WEBHOOK_URL, payload);
        logger.info('Message posted to Discord successfully.');
    } catch (error) {
        logger.error(`Error posting to Discord: ${error.message}`);
        if (error.response && error.response.data) {
            console.error('Discord API Response:', error.response.data);
        }
    }
}

// Schedule to post every 30 seconds (30,000 ms)
setInterval(postNewestToDiscord, 30000);

// Predefined facts array (moved outside the route handler to avoid redefining on each request)
const facts = [
    {
        id: 'fact1',
        testText:
            'Hear ye! In ancient times, craftsmen didst fashion a mechanical knight, moving by wondrous gears and pulleys.',
    },
    {
        id: 'fact2',
        testText:
            'In the days of old, scribes recorded the tales of valor and wisdom, preserving them for generations.',
    },
    {
        id: 'fact3',
        testText:
            'The first automaton was a marvel of its time, demonstrating the ingenuity of its creators.',
    },
    {
        id: 'fact4',
        testText:
            'Artisans of the medieval era crafted intricate devices that blended art with early engineering.',
    },
    {
        id: 'fact5',
        testText:
            'Legends speak of mechanical beings that roamed the lands, serving their lords with unwavering loyalty.',
    },
    // Add more facts as desired
];

// /testing route with random images from random.dog, random RoboHash profile picture, and random bot name
app.get('/testing', async (req, res) => {
    try {
        const dogImageUrl = await getRandomDogImage();
        const profilePictureUrl = await getRandomProfilePicture();
        const botName = generateRandomBotName();
        const randomFact = { ...facts[Math.floor(Math.random() * facts.length)] }; // Create a shallow copy

        // Add dynamic properties
        randomFact.dateUnixUK = Math.floor(Date.now() / 1000);
        randomFact.testImg = dogImageUrl;
        randomFact.testingProfilePicture = profilePictureUrl;
        randomFact.testingBotName = botName;

        res.json(randomFact);
    } catch (error) {
        res.status(500).json({
            error: 'Alas! An error hath occurred while fetching data. Please try again later.',
        });
    }
});

// Root route '/'
app.get('/', async (req, res) => {
    const uptime = formatUptime(Date.now() - serverStartTime);

    let updatesHtml = '';
    try {
        const updates = await getUpdates();
        logger.info('Loaded updates:', updates);

        updatesHtml = updates.length
            ? updates
                  .map(
                      (update) =>
                          `<li><strong>${update.updateText}</strong> - ${update.description}</li>`
                  )
                  .join('')
            : '<li>No updates available at this time.</li>';
    } catch (error) {
        logger.error(`Error in root route: ${error.message}`);
        updatesHtml = '<li>Error loading updates. Please check the server logs for details.</li>';
    }

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>MonkeyBytes-API</title>
            <style>
                body {
                    background-color: #1a1a1a;
                    color: #e0e0e0;
                    font-family: 'Times New Roman', Times, serif;
                    margin: 0;
                    padding: 0;
                }
                a {
                    color: #bb86fc;
                }
                h1, h2 {
                    color: #bb86fc;
                }
                ul {
                    list-style-type: none;
                    padding: 0;
                }
                li {
                    margin: 10px 0;
                }
                .container {
                    max-width: 800px;
                    margin: auto;
                    padding: 40px 20px;
                    background-image: url('https://cdn.discordapp.com/banners/1051503632677359686/0d039ec11c1709a1c1987bfbcaad6e7c.png?size=1024&format=webp&quality=lossless&width=0&height=256');
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                    background-attachment: fixed;
                    background-blend-mode: multiply;
                    background-color: rgba(26, 26, 26, 0.9);
                }
                .content {
                    background-color: rgba(26, 26, 26, 0.8);
                    padding: 20px;
                    border-radius: 10px;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    font-size: 0.9em;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <h1>📜 Greetings, noble visitor, to the MonkeyBytes-API!</h1>
                    <p>Welcome to our humble abode, where knowledge and information flow freely like the rivers of old. Below, thou shalt find the pathways and tales that make up this grand server.</p>

                    <h2>⚔️ Pathways Available</h2>
                    <ul>
                        <li><strong>/</strong> - This very page, offering an overview of our server's well-being, including its duration of service and the latest news, fetched from the sacred <em>updates.json</em> scroll.</li>
                        <li><strong>/testing</strong> - A route that delivers unto thee random tales of the first mechanical knight, each accompanied by an image of a hound from distant lands.</li>
                    </ul>

                    <h2>⏳ State of the Server</h2>
                    <p>Our server hath been steadfast for ${uptime}. May it continue to serve without falter!</p>

                    <h2>📰 Latest Decrees</h2>
                    <ul>${updatesHtml}</ul>

                    <h2>🔍 A Glimpse Behind the Tapestry</h2>
                    <ul>
                        <li><strong>Helmet</strong> - Like a trusty helm, Helmet guards our API with headers that ward off common threats.</li>
                        <li><strong>Winston</strong> - Our herald, Winston, records all notable events, from the dawn of the server's awakening to the requests and errors encountered on our journey.</li>
                        <li><strong>Axios</strong> - Our swift messenger, Axios, fetches tales and images from distant lands.</li>
                        <li><strong>xml2js</strong> - The translator that converts the mystical RSS feed into a language our server can comprehend.</li>
                        <li><strong>crypto</strong> - Provides secure randomization for various functionalities.</li>
                        <li><strong>Reddit RSS Feed</strong> - Every 30 seconds, our server fetches the latest proclamations from Reddit and shares them on our Discord channel.</li>
                    </ul>

                    <h2>📖 The /testing Pathway</h2>
                    <p>Upon traversing the <strong>/testing</strong> route, thou shalt receive a random tale of the first automaton, told in the words of a noble from the year of our Lord 1066, accompanied by a depiction of a loyal hound. These tales are penned within our code, ensuring their consistency.</p>

                    <h2>📡 The Reddit Herald</h2>
                    <p>Our server doth fetch the latest missives from Reddit's realm every 30 seconds, sharing the five newest proclamations with our Discord community.</p>

                    <h2>🚫 In Case of Missteps</h2>
                    <p>Shouldst thou wander astray and seek a path unknown, our server shall gently remind thee: <em>"Oh dear! The page thou seekest is not to be found."</em></p>

                    <h2>🛡️ Security and Logging</h2>
                    <p>We employ various safeguards and loggers to ensure the smooth operation of our server and the safety of our users.</p>

                    <div class="footer">
                        &copy; ${new Date().getFullYear()} MonkeyBytes-API. All rights reserved.
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});

// 404 Error Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Oh dear! The page thou seekest is not to be found.' });
});

// Start the server
app.listen(PORT, () => {
    logger.info(
        `The server is now operational upon port ${PORT}. Brace thyself for the adventure ahead!`
    );
    postNewestToDiscord();
});
// 16/09/2024 - stable (hopefully) 