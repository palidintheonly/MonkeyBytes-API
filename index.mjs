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

// Predefined list of 10 open-source pigeon image URLs from Pixabay (direct links)
const pigeonImageList = [
    'https://cdn.pixabay.com/photo/2016/11/29/04/54/pigeon-1867291_1280.jpg',
    'https://cdn.pixabay.com/photo/2013/11/15/13/53/pigeon-210272_1280.jpg',
    'https://cdn.pixabay.com/photo/2015/01/26/14/13/pigeon-612400_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/03/31/19/35/pigeon-1295674_1280.png',
    'https://cdn.pixabay.com/photo/2016/11/29/10/07/pigeon-1867429_1280.jpg',
    'https://cdn.pixabay.com/photo/2014/04/03/10/00/pigeon-311523_1280.png',
    'https://cdn.pixabay.com/photo/2017/07/18/23/44/dove-2516641_1280.png',
    'https://cdn.pixabay.com/photo/2017/10/25/19/17/pigeon-2884536_1280.png',
    'https://cdn.pixabay.com/photo/2020/05/11/09/19/pigeon-5156094_1280.png',
    'https://cdn.pixabay.com/photo/2016/05/07/22/03/animal-1376713_1280.png',
];

// Function to get a random pigeon image URL
function getRandomPigeonImage() {
    const randomIndex = Math.floor(Math.random() * pigeonImageList.length);
    return pigeonImageList[randomIndex];
}

// Function to get a random profile picture using DiceBear Avatars API
function getRandomProfilePicture() {
    const randomUsername = crypto.randomBytes(4).toString('hex');
    return `https://avatars.dicebear.com/api/avataaars/${randomUsername}.png`;
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

// /testing route with random pigeon images, DiceBear avatars, and random bot name
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
const DISCORD_WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL'; // Replace with your actual webhook URL

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
            <title>MonkeyBytes-API</title>
            <!-- (Styles and HTML content omitted for brevity) -->
        </head>
        <body>
            <!-- (HTML content omitted for brevity) -->
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
