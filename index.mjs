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

// Enable JSON and URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Record the commencement time of the server
const serverStartTime = Date.now();

// Function to format uptime
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

// Function to load updates from updates.json
async function getUpdates() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'updates.json'), 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        logger.error(`Error reading updates.json: ${error.message}`);
        return [];
    }
}

// Updated list of 10 pigeon image URLs
const pigeonImageList = [
    'https://i.ibb.co/NTp1phP/1.jpg',
    'https://i.ibb.co/DKMWRTD/2.jpg',
    'https://i.ibb.co/kJqqc31/3.jpg',
    'https://i.ibb.co/SfBF8cq/4.jpg',
    'https://i.ibb.co/0Q7M5BT/5.jpg',
    'https://i.ibb.co/3Bf2JVg/6.jpg',
    'https://i.ibb.co/XtfjB7b/7.jpg',
    'https://i.ibb.co/VtdgpmT/8.jpg',
    'https://i.ibb.co/5jqhFvh/9.jpg',
    'https://i.ibb.co/CHrX2mG/10.jpg',
];

// Function to get a random pigeon image URL
function getRandomPigeonImage() {
    const randomIndex = Math.floor(Math.random() * pigeonImageList.length);
    return pigeonImageList[randomIndex];
}

// Updated function to get a random profile picture using RoboHash API
function getRandomProfilePicture() {
    const randomUsername = crypto.randomBytes(4).toString('hex');
    return `https://robohash.org/${randomUsername}.png`;
}

// Function to generate a random bot name
function generateRandomBotName() {
    const adjectives = ['Valiant', 'Noble', 'Mighty', 'Regal', 'Gallant'];
    const nouns = ['Knight', 'Baron', 'Lord', 'Squire', 'Monarch'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
        nouns[Math.floor(Math.random() * nouns.length)]
    }${Math.floor(Math.random() * 1000)}`;
}

// Predefined facts array with 10 new facts about pigeons, spoken like a royal in 1066
const facts = [
    {
        id: 'fact1',
        testText:
            "Verily, the humble pigeon doth find its way home o'er great distances, guided by the Lord's own hand.",
    },
    {
        id: 'fact2',
        testText:
            "Tis known that pigeons, with feathers of grey and eyes of keen sight, art messengers of import across our lands.",
    },
    {
        id: 'fact3',
        testText:
            "In the annals of history, the pigeon hath served kings and nobles, bearing missives swift and sure.",
    },
    {
        id: 'fact4',
        testText:
            "These birds, though common in visage, possess a loyalty unmatched, returning ever to their roosts.",
    },
    {
        id: 'fact5',
        testText:
            "I have witnessed pigeons trained to carry tidings between castles, a marvel of God's creation.",
    },
    {
        id: 'fact6',
        testText:
            "The pigeon, gentle of nature, doth thrive in our towns and keeps, living alongside man.",
    },
    {
        id: 'fact7',
        testText:
            "Some say the pigeon can discern the north star, guiding itself through night and storm.",
    },
    {
        id: 'fact8',
        testText:
            "Tis a wonder that pigeons feed their young with milk of their crop, a trait rare amongst birds.",
    },
    {
        id: 'fact9',
        testText:
            "Their cooing songs echo in the morn, heralding the dawn as roosters do in the countryside.",
    },
    {
        id: 'fact10',
        testText:
            "I declare, the pigeon's endurance is famed, for it flies many leagues without rest.",
    },
];

// /testing route with random pigeon images, RoboHash avatars, and random bot name
app.get('/testing', (req, res) => {
    try {
        const pigeonImageUrl = getRandomPigeonImage();
        const profilePictureUrl = getRandomProfilePicture();
        const botName = generateRandomBotName();
        const randomFact = { ...facts[Math.floor(Math.random() * facts.length)] };

        // Add dynamic properties
        randomFact.dateUnixUK = Math.floor(Date.now() / 1000);
        randomFact.testImg = pigeonImageUrl;
        randomFact.testingProfilePicture = profilePictureUrl;
        randomFact.testingBotName = botName;

        res.json(randomFact);
    } catch (error) {
        logger.error(`Error in /testing route: ${error.message}`);
        res.status(500).json({
            error: 'Alas! An error hath occurred while fetching data. Please try again later.',
        });
    }
});

// Reddit RSS and Discord webhook URLs
const REDDIT_RSS_URL = 'https://www.reddit.com/r/all/new/.rss';
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1283861457007673506/w4zSpCb8m-hO5tf5IP4tcq-QiNgHmLz4mTUztPusDlZOhC0ULRhC64SMMZF2ZFTmM6eT'; // Replace with your actual webhook URL

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
    if (typeof htmlContent !== 'string') {
        htmlContent = '';
    }
    let textContent = htmlContent.replace(/<\/?[^>]+(>|$)/g, '').trim();
    textContent = decode(textContent);
    return textContent;
}

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

    // Construct the embeds
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
        const postContent = cleanHtmlContent(postContentRaw);

        // Limit fields to Discord's character limits
        const title = postTitle.length > 256 ? postTitle.slice(0, 253) + '...' : postTitle;
        const description =
            postContent.length > 4096 ? postContent.slice(0, 4093) + '...' : postContent;
        const authorName =
            postAuthor.length > 256 ? postAuthor.slice(0, 253) + '...' : postAuthor;

        // Optional image
        const postImage = post['media:thumbnail'] ? post['media:thumbnail'].$.url : null;

        const embed = {
            title: title,
            url: postLink,
            description: description,
        };

        if (authorName) {
            embed.author = {
                name: `Posted by ${authorName}`,
            };
        }

        if (postImage) {
            embed.image = { url: postImage };
        }

        return embed;
    });

    // Get the current time in GB UK time zone with 12-hour format
    const ukTime = new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Europe/London',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    // Send message with content and embeds
    const payload = {
        content: `📜 **Hear ye! The 5 newest proclamations from the realm of Reddit have arrived!**\n🕰️ Fetched at the hour of ${ukTime} UK time`,
        embeds: embeds,
    };

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
            <title>MonkeyBytes-API Portal</title>
            <style>
                body {
                    background-color: #121212;
                    color: #e0e0e0;
                    font-family: 'Garamond', serif;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .section {
                    background-color: #2c2c2c;
                    padding: 20px;
                    margin-bottom: 20px;
                    border-radius: 8px;
                }
                h1, h2 {
                    color: #ffffff;
                }
                p, li {
                    color: #dcdcdc;
                    line-height: 1.6;
                }
                a {
                    color: #1e90ff;
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
                ul, ol {
                    margin-left: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="section">
                    <h1>📜 Greetings, Noble Visitor, to the MonkeyBytes-API!</h1>
                    <p>Welcome to the grand halls of our kingdom's digital realm. Herein lies the gateway to our esteemed API, a marvel of modern sorcery and craftsmanship. Let us embark on a journey to unveil the secrets and functionalities that await thee.</p>
                </div>

                <div class="section">
                    <h2>⏳ The Kingdom's Endurance</h2>
                    <p>Our mighty server hath stood resolute for <strong>${uptime}</strong>. This steadfastness ensures that all who seek our services are met with unwavering reliability and grace.</p>
                </div>

                <div class="section">
                    <h2>⚔️ The Noble Nodes</h2>
                    <p>Behold the intricate network of nodes that comprise our kingdom's infrastructure. Each node serves a distinct purpose, working in harmonious unison to maintain the stability and efficiency of our realm:</p>
                    <ul>
                        <li><strong>Express:</strong> The swift messenger that handles incoming requests with agility.</li>
                        <li><strong>Winston Logger:</strong> The vigilant chronicler that records the annals of our server's deeds and errors.</li>
                        <li><strong>Helmet:</strong> The steadfast guardian that shields our kingdom from nefarious threats.</li>
                        <li><strong>Axios and XML2JS:</strong> The diligent scholars that fetch and parse data from distant lands.</li>
                        <li><strong>Crypto:</strong> The master of secrets, ensuring that our communications remain secure.</li>
                        <li><strong>HTML Entities Decoder:</strong> The linguist that deciphers encoded messages to present them in readable form.</li>
                        <li><strong>Path and URL Modules:</strong> The cartographers that navigate file systems and URLs with precision.</li>
                    </ul>
                </div>

                <div class="section">
                    <h2>🛡️ A Walkthrough for the Uninitiated</h2>
                    <p>Fear not, for this guide shall illuminate the path to utilizing our API's noble endpoints:</p>
                    <ol>
                        <li>
                            <strong>/</strong> - <em>The Grand Overview</em><br>
                            Venture to this path to behold the server's current state, including its illustrious uptime and the latest decrees from our scrolls.
                        </li>
                        <li>
                            <strong>/testing</strong> - <em>The Pigeon Pavilion</em><br>
                            Visit this endpoint to receive randomized tales of our feathered friends, each accompanied by a noble pigeon image and a regal bot name crafted just for thee.
                        </li>
                    </ol>
                    <p>To engage with these endpoints, simply dispatch a request to the desired path and await the kingdom's gracious response. Whether thou art a seasoned knight or a humble scribe, our API stands ready to serve thy needs.</p>
                </div>

                <div class="section">
                    <h2>📰 Latest Decrees</h2>
                    <ul>${updatesHtml}</ul>
                </div>

                <div class="section">
                    <h2>🌙 Embracing the Shadows</h2>
                    <p>Our portal dons the cloak of darkness, ensuring that thine eyes are spared the harsh glare of daylight. Navigate these hallowed pages with ease, whether under the sun's watchful eye or the moon's gentle glow.</p>
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
