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

// Hardcoded Discord webhook URL
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1283861457007673506/w4zSpCb8m-hO5tf5IP4tcq-QiNgHmLz4mTUztPusDlZOhC0ULRhC64SMMZF2ZFTmM6eT';

// Hardcoded Port and Reddit RSS URL
const PORT = 21560; // Hardcoded port for HTTP
const REDDIT_RSS_URL = 'https://www.reddit.com/r/all/new/.rss';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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

// Updated Test Image URLs
const testImage1List = [
    'https://i.ibb.co/smG7rNR/1.jpg',
    'https://i.ibb.co/cYwWSgf/2.jpg',
    'https://i.ibb.co/vwrfhFM/3.jpg',
    'https://i.ibb.co/Gxt5NH1/4.jpg',
    'https://i.ibb.co/KbmfddX/5.jpg',
];

const testImage2List = [
    'https://i.ibb.co/BfB7sZ4/6.jpg',
    'https://i.ibb.co/BT6TH04/7.jpg',
    'https://i.ibb.co/BNdGcDX/8.jpg',
    'https://i.ibb.co/XLJCBzJ/9.jpg',
    'https://i.ibb.co/RYpx47G/10.jpg',
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

// Updated Facts Array
const facts = [
    { id: 'fact1', testText: "The unknown doth veil itself in shadows, elusive as the whispers of the night wind." },
    { id: 'fact2', testText: "In the realm of the unseen, mysteries abound, cloaked in the essence of twilight's embrace." },
    { id: 'fact3', testText: "Lo, the unknown is as a silent sentinel, guarding secrets that lie beyond mortal ken." },
    { id: 'fact4', testText: "Verily, the enigmatic unknown dances on the horizon, a perpetual enigma to behold." },
    { id: 'fact5', testText: "Behold the unknown, a tapestry woven with threads of uncertainty and the promise of discovery." },
];

// /testing route with random test images, RoboHash avatars, and random bot name
app.get('/testing', (req, res) => {
    logger.info('Endpoint accessed.', { endpoint: '/testing' });

    try {
        const testImage1Url = getRandomImage(testImage1List);
        const testImage2Url = getRandomImage(testImage2List);
        const profilePictureUrl = getRandomProfilePicture();
        const botName = generateRandomBotName();
        const randomFact = { ...facts[Math.floor(Math.random() * facts.length)] };

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

    const entries = Array.isArray(redditData.feed.entry) ? redditData.feed.entry : [redditData.feed.entry];
    const newestPosts = entries.slice(0, 5);
    logger.info('Extracted the 5 newest posts from Reddit.', { count: newestPosts.length, source: 'postNewestToDiscord' });

    const embeds = newestPosts.map((post) => {
        // Decode the title
        const postTitle = typeof post.title === 'string' ? decode(post.title) : decode(post.title._ || '');

        // Handle the content: strip HTML tags and decode HTML entities
        const postContentRaw = post.content ? (typeof post.content === 'string' ? post.content : post.content._ || '') : 'No content provided';
        const postContentStripped = postContentRaw.replace(/<\/?[^>]+(>|$)/g, '').trim();
        const postContent = decode(postContentStripped);

        const postLink = post.link && post.link.href ? post.link.href : '#';
        const postAuthor = post.author && post.author.name ? (typeof post.author.name === 'string' ? post.author.name : post.author.name._ || '') : 'Unknown';

        const title = postTitle.length > 256 ? postTitle.slice(0, 253) + '...' : postTitle;
        const description = postContent.length > 2048 ? postContent.slice(0, 2045) + '...' : postContent; // Discord embed description limit is 2048
        const authorName = postAuthor.length > 256 ? postAuthor.slice(0, 253) + '...' : postAuthor;

        const postImage = post['media:thumbnail'] && post['media:thumbnail'].$ && post['media:thumbnail'].$.url ? post['media:thumbnail'].$.url : null;

        const embed = {
            title: title,
            url: postLink,
            description: description,
            color: 0x1e90ff, // DodgerBlue color
            timestamp: new Date().toISOString(),
        };

        if (authorName) {
            embed.author = { name: `Posted by ${authorName}` };
        }

        if (postImage) {
            embed.image = { url: postImage };
        }

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
    logger.info('Root endpoint accessed.');

    const uptime = formatUptime(Date.now() - serverStartTime);

    let updatesHtml = '';
    try {
        const updates = await getUpdates();
        logger.info('Loaded updates successfully.', { updates, source: 'root' });

        updatesHtml = updates.length
            ? updates.map((update) => `<li><strong>${decode(update.updateText)}</strong> - ${decode(update.description)}</li>`).join('')
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
    logger.warn('Unknown endpoint accessed.', { path: req.path, source: '404Handler' });
    res.status(404).json({ error: 'Oh dear! The page thou seekest is not to be found.' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running at http://us2.bot-hosting.net:${PORT}`);
});
