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
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Ensure that the Discord Webhook URL is provided
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
if (!DISCORD_WEBHOOK_URL) {
    console.error('Error: DISCORD_WEBHOOK_URL is not defined in environment variables.');
    process.exit(1);
}

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 21560;

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

// Logger configuration (Winston) with colorized output
const logger = winston.createLogger({
    level: 'debug', // Set to 'debug' to capture debug logs
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

// Cloud image URLs (direct links from Unsplash)
const cloudImageList = [
    'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1495373964874-395097ac815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1486810732202-ac78e7675d61?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1517683058896-5a13a84c4c89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
];

// Grass image URLs (direct links from Unsplash)
const grassImageList = [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1506765515384-028b60a970df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1496483648148-47c686dc86a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1520911691954-7e45a47c3d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
];

// Function to get a random image from a given list
function getRandomImage(imageList) {
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
        'Wispy', 'Fluffy', 'Stormy', 'Ethereal', 'Cumulus',
        'Nimbus', 'Cirrus', 'Altocumulus', 'Stratus'
    ];

    const nouns = [
        'Cloud', 'Mist', 'Sky', 'Vapor', 'Fog',
        'Nebula', 'Drift', 'Aura', 'Zephyr'
    ];

    const number = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

    const botName = `${randomAdjective}${randomNoun}${number}`;
    logger.debug('Generated random bot name.', { botName, source: 'generateRandomBotName' });
    return botName;
}

// Predefined facts array with 5 new facts about clouds, in a royal medieval style
const facts = [
    { id: 'fact1', testText: "Lo, the cumulus clouds doth resemble the billowing sails of mighty ships traversing the heavens." },
    { id: 'fact2', testText: "Behold the cirrus formations, delicate as the finest lace adorning a noble lady's gown." },
    { id: 'fact3', testText: "Verily, thunderheads gather with portentous grace, heralding the tempest's mighty arrival." },
    { id: 'fact4', testText: "Stratus clouds blanket the sky, akin to a monarch's cloak shielding the realm from the sun's glare." },
    { id: 'fact5', testText: "Nimbus clouds, laden with rain, bestow life upon the earth, much like benevolent lords nurturing their lands." },
];

// /testing route with random cloud images, grass images, RoboHash avatars, and random bot name
app.get('/testing', (req, res) => {
    logger.info('A request hath been made to the /testing route.', { route: '/testing', source: 'route' });
    try {
        const cloudImageUrl = getRandomImage(cloudImageList);
        const grassImageUrl = getRandomImage(grassImageList);
        const profilePictureUrl = getRandomProfilePicture();
        const botName = generateRandomBotName();
        const randomFact = { ...facts[Math.floor(Math.random() * facts.length)] };

        randomFact.dateUnixUK = Math.floor(Date.now() / 1000);
        randomFact.testimage1 = cloudImageUrl;
        randomFact.testimage2 = grassImageUrl;
        randomFact.testingProfilePicture = profilePictureUrl;
        randomFact.testingBotName = botName;

        logger.info('Response for /testing route hath been prepared and sent.', { response: 'Sent to client', source: '/testing' });
        res.json(randomFact);
    } catch (error) {
        logger.error('An error hath occurred within the /testing route.', { error: error.message, source: '/testing' });
        res.status(500).json({
            error: 'Alas! An error hath occurred while fetching data. Please try again later.',
        });
    }
});

// Reddit RSS and Discord webhook URLs are now handled via environment variables
const REDDIT_RSS_URL = 'https://www.reddit.com/r/all/new/.rss';

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

// Helper function to clean HTML tags and decode HTML entities from the post content
function cleanHtmlContent(htmlContent) {
    if (typeof htmlContent !== 'string') {
        htmlContent = '';
    }
    let textContent = htmlContent.replace(/<\/?[^>]+(>|$)/g, '').trim();
    textContent = decode(textContent);
    logger.debug('HTML content hath been cleansed.', { original: htmlContent, cleaned: textContent, source: 'cleanHtmlContent' });
    return textContent;
}

// Function to post the 5 newest posts from the Reddit RSS feed to Discord using JSON format
async function postNewestToDiscord() {
    logger.info('Initiating the process to post newest Reddit posts to Discord.', { source: 'postNewestToDiscord' });
    const redditData = await fetchRedditRSS();

    if (!redditData || !redditData.feed || !redditData.feed.entry) {
        logger.error('Invalid Reddit RSS feed data received.', { data: redditData, source: 'postNewestToDiscord' });
        return;
    }

    const entries = Array.isArray(redditData.feed.entry) ? redditData.feed.entry : [redditData.feed.entry];
    const newestPosts = entries.slice(0, 5);
    logger.info('Extracted the 5 newest posts from Reddit.', { count: newestPosts.length, source: 'postNewestToDiscord' });

    const embeds = newestPosts.map((post) => {
        const postTitle = typeof post.title === 'string' ? decode(post.title) : decode(post.title._);
        const postLink = post.link.href;
        const postAuthor = typeof post.author.name === 'string' ? post.author.name : post.author.name._;
        const postContentRaw = post.content ? (typeof post.content === 'string' ? post.content : post.content._) : 'No content provided';
        const postContent = cleanHtmlContent(postContentRaw);

        const title = postTitle.length > 256 ? postTitle.slice(0, 253) + '...' : postTitle;
        const description = postContent.length > 4096 ? postContent.slice(0, 4093) + '...' : postContent;
        const authorName = postAuthor.length > 256 ? postAuthor.slice(0, 253) + '...' : postAuthor;

        const postImage = post['media:thumbnail'] ? post['media:thumbnail'].$.url : null;

        const embed = {
            title: title,
            url: postLink,
            description: description,
        };

        if (authorName) {
            embed.author = { name: `Posted by ${authorName}` };
        }

        if (postImage) {
            embed.image = { url: postImage };
        }

        logger.debug('Created embed for a Reddit post.', { embed, source: 'postNewestToDiscord' });
        return embed;
    });

    const ukTime = new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Europe/London',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const payload = {
        content: `📜 **Hear ye! The 5 newest proclamations from the realm of Reddit have arrived!**\n🕰️ Fetched at the hour of ${ukTime} UK time`,
        embeds: embeds,
    };

    try {
        await axios.post(DISCORD_WEBHOOK_URL, payload);
        logger.info('Message hath been posted to Discord successfully.', { payloadSent: true, source: 'postNewestToDiscord' });
    } catch (error) {
        logger.error('Error whilst posting message to Discord.', { error: error.message, source: 'postNewestToDiscord' });
        if (error.response && error.response.data) {
            logger.error('Discord API Response:', { response: error.response.data, source: 'postNewestToDiscord' });
        }
    }
}

// Schedule to post every 30 seconds (30,000 ms)
setInterval(postNewestToDiscord, 30000);

// Root route '/'
app.get('/', async (req, res) => {
    logger.info('A request hath been made to the root route.', { route: '/', source: 'root' });
    const uptime = formatUptime(Date.now() - serverStartTime);

    let updatesHtml = '';
    try {
        const updates = await getUpdates();
        logger.info('Loaded updates successfully.', { updates, source: 'root' });

        updatesHtml = updates.length
            ? updates.map((update) => `<li><strong>${update.updateText}</strong> - ${update.description}</li>`).join('')
            : '<li>No updates available at this time.</li>';
        logger.debug('Updates HTML hath been prepared.', { updatesHtml, source: 'root' });
    } catch (error) {
        logger.error('Error whilst loading updates.', { error: error.message, source: 'root' });
        updatesHtml = '<li>Error loading updates. Please check the server logs for details.</li>';
    }

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Monkey Bytes API</title>
            <link rel="icon" href="https://i.ibb.co/wgfvKYb/2.jpg" type="image/jpg"> <!-- Favicon link -->
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
                    <h1>📜 Greetings, Noble Visitor, to the Monkey Bytes API!</h1>
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
                        <li><strong>/</strong> - <em>The Grand Overview</em><br>Venture to this path to behold the server's current state, including its illustrious uptime and the latest decrees from our scrolls.</li>
                        <li><strong>/testing</strong> - <em>The Cloud Pavilion</em><br>Visit this endpoint to receive randomized tales of our celestial formations, each accompanied by a majestic cloud image and a regal bot name crafted just for thee.</li>
                    </ol>
                    <p>To engage with these endpoints, simply dispatch a request to the desired path and await the kingdom's gracious response. Whether thou art a seasoned knight or a humble scribe, our API stands ready to serve thy needs.</p>
                </div>

                <div class="section">
                    <h2>📰 Latest Decrees</h2>
                    <ul>${updatesHtml}</ul>
                </div>

                <div class="section">
                    <h2>🔗 Useful Links</h2>
                    <p>Herein lies the links to important aspects of our realm:</p>
                    <ul>
                        <li>🧪 <a href="http://us2.bot-hosting.net:21560/testing">Testing Endpoint</a> - Test our system with randomized data.</li>
                        <li>💬 <a href="https://discord.gg/your-server-invite">Discord Support Server</a> - Join our noble Discord server for aid and discussion.</li>
                    </ul>
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
    logger.warn('A request hath been made to an unknown path.', { path: req.path, source: '404Handler' });
    res.status(404).json({ error: 'Oh dear! The page thou seekest is not to be found.' });
});

// Start the server
app.listen(PORT, () => {
    logger.info('The server hath commenced operation.', { port: PORT, source: 'server' });
    postNewestToDiscord();
});
