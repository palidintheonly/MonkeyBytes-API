import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import helmet from 'helmet';
import axios from 'axios'; // Ensure axios is installed using: npm install axios

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
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Logger configuration (Winston)
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [new winston.transports.Console()]
});

// Function to load updates dynamically from the updates.json file
async function getUpdates() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'updates.json'), 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        logger.error(`Error reading updates.json: ${error.message}`);
        return [];
    }
}

// Function to get a random fox image URL from randomfox.ca
async function getRandomFoxImage() {
    try {
        const response = await axios.get('https://randomfox.ca/floof/');
        return response.data.image;
    } catch (error) {
        logger.error(`Error fetching random fox image: ${error.message}`);
        return 'https://via.placeholder.com/300x200?text=Error+fetching+image'; // Placeholder if there's an issue fetching the fox image
    }
}

// Function to get a random robohash profile picture
async function getRandomProfilePicture() {
    try {
        const randomSeed = Math.floor(Math.random() * 1000); // Generate a random seed for RoboHash
        return `https://robohash.org/${randomSeed}.png`; // Return the RoboHash image URL
    } catch (error) {
        logger.error(`Error fetching random profile picture: ${error.message}`);
        return 'https://via.placeholder.com/300x200?text=Error+fetching+profile+picture'; // Placeholder in case of error
    }
}

// Function to generate a random bot name
function generateRandomBotName() {
    const adjectives = ['Epic', 'Unknown', 'Incogneto', 'Honour', 'Monkey'];
    const nouns = ['Coder', 'Royal', 'Hawk', 'God', 'Palidin'];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${randomAdjective}${randomNoun}${Math.floor(Math.random() * 1000)}`; // Generate a random bot name
}

// Root route '/'
app.get('/', async (req, res) => {
    const uptime = formatUptime(Date.now() - serverStartTime);

    let updatesHtml = '';
    try {
        // Fetch the updates from the updates.json file
        const updates = await getUpdates();

        // Create HTML for recent updates
        updatesHtml = updates.map(update => 
            `<li><strong>${update.updateText}</strong> - ${update.description}</li>`
        ).join('');
    } catch (error) {
        updatesHtml = '<li>Error loading updates. Please check the server logs for details.</li>';
    }

    // Ensure response is served with UTF-8 encoding
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`
        <h1>Welcome to the MonkeyBytes-API</h1>
        <p>The MonkeyBytes-API is a robust and dynamic service designed to deliver both insightful information and reliable performance. Below, we provide an overview of the available endpoints and a detailed explanation of the server’s functionality.</p>

        <h2>Available Endpoints</h2>
        <p>The MonkeyBytes-API offers the following endpoints for users to interact with:</p>
        <ul>
            <li><strong>/</strong> - The root endpoint provides an overview of the server’s status, including its uptime and the most recent updates, which are dynamically fetched from the <em>updates.json</em> file.</li>
            <li><strong>/testing</strong> - This endpoint delivers random facts about coding, each accompanied by an image from randomfox.ca.</li>
        </ul>

        <h2>Server Status</h2>
        <p>The server’s uptime is dynamically calculated in a human-readable format (days, hours, minutes, and seconds). This information is displayed on the root page, allowing users to understand how long the server has been running without interruption.</p>

        <h2>Recent Updates</h2>
        <ul>
            ${updatesHtml}
        </ul>

        <h2>Technical Overview</h2>
        <p>The MonkeyBytes-API employs several key technologies to ensure security and performance:</p>
        <ul>
            <li><strong>Helmet</strong> - Helmet is used to enhance the API's security by setting appropriate HTTP headers, protecting the server from common vulnerabilities.</li>
            <li><strong>Winston</strong> - Winston is integrated as the logging system. It captures and logs all significant server events, such as server startup, requests, and error messages, in a structured and readable format.</li>
        </ul>

        <h2>The /testing Endpoint</h2>
        <p>When the <strong>/testing</strong> endpoint is accessed, a random fact about coding is provided. Each response includes a historical fact along with an associated image from randomfox.ca, creating an engaging and informative experience for the user. The facts are pre-defined within the code, ensuring consistency across requests.</p>

        <h2>Error Handling</h2>
        <p>If a user attempts to access a non-existent route, the API returns a custom 404 error message: <em>"Oh dear! The page thou seekest is not to be found."</em> This ensures that users are promptly informed when they encounter an unavailable resource, helping maintain a seamless user experience.</p>

        <h2>Server Startup</h2>
        <p>Upon server startup, Winston logs a message indicating that the server is operational and ready to handle requests. This message reads: <em>"The server is now operational upon port ${PORT}. Brace thyself for the adventure ahead!"</em></p>

        <p>In conclusion, the MonkeyBytes-API is designed with both functionality and security in mind, offering users a reliable and engaging interface. With its dynamic content, robust logging, and secure architecture, the API is well-equipped to handle a variety of use cases.</p>
    `);
});

// /testing route with random images from randomfox.ca, random RoboHash profile picture, and random bot name
app.get('/testing', async (req, res) => {
    // List of facts about coding
    const facts = [
        { id: 'fact1', testText: "Lo, in the early days of computing, the first line of code was but a humble command to display 'Hello, World!'.", dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact2', testText: "Verily, the art of debugging was born when Grace Hopper did discover a moth within the bowels of a machine, causing malfunctions.", dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact3', testText: "Know ye this—coding languages, like Latin and Greek of old, are structured and precise, yet oft misunderstood by mere mortals.", dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact4', testText: "Tarry not, for the first computer virus, known as the 'Creeper', did spread its mischief in the year 1971.", dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact5', testText: "In days long past, the COBOL language was crafted with great care to manage the ledgers of vast kingdoms, and it remains in use even unto this day.", dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact6', testText: "Lo! The code repository, a storehouse of wisdom, wherein the wise of old did place their scrolls of logic and function.", dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact7', testText: "The revered Alan Turing, father of modern computing, devised algorithms which did unlock the secrets of the Enigma machine in the war of yore.", dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact8', testText: "Hark! In the ancient land of Bell Labs, a language known as 'C' was crafted, the foundation of many tongues spoken by computers to this day.", dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact9', testText: "Before the birth of Git, the wise did manage their changes by hand, a perilous task fraught with error and woe.", dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact10', testText: "Let it be known that the coding of yore was done upon vast tapes and punch cards, which did make a most satisfying 'clack' as they were written upon.", dateUnixUK: Math.floor(Date.now() / 1000) }
    ];

    try {
        // Fetch a random fox image
        const foxImageResponse = await axios.get('https://randomfox.ca/floof/');
        const foxImageUrl = foxImageResponse.data.image;

        // Fetch a random profile picture from RoboHash
        const profilePictureUrl = await getRandomProfilePicture();

        // Generate a random bot name
        const botName = generateRandomBotName();

        // Choose a random fact from the list
        const randomFact = facts[Math.floor(Math.random() * facts.length)];

        // Add the random fox image, random profile picture, and random bot name to the chosen fact
        randomFact.testImg = foxImageUrl;
        randomFact.testingProfilePicture = profilePictureUrl;
        randomFact.testingBotName = botName;

        // Send the selected fact, image, profile picture, and bot name back as JSON
        res.json(randomFact);
    } catch (error) {
        // In case of an error (e.g., fetching the fox image fails), return a 500 response
        res.status(500).json({ error: "Error fetching data, please try again later." });
    }
});

// 404 Error Handler
app.use((req, res) => {
    res.status(404).json({ error: "Oh dear! The page thou seekest is not to be found." });
});

// Start the server
app.listen(PORT, () => {
    logger.info(`The server is now operational upon port ${PORT}. Brace thyself for the adventure ahead!`);
});
