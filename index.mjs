import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import helmet from 'helmet';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 21560;

// Utilize helmet for enhanced security
app.use(helmet());

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

    res.send(`
        <h1>Welcome to the MonkeyBytes-API</h1>
        <p>The MonkeyBytes-API is a robust and dynamic service designed to deliver both insightful information and reliable performance. Below, we provide an overview of the available endpoints and a detailed explanation of the server’s functionality.</p>

        <h2>Available Endpoints</h2>
        <p>The MonkeyBytes-API offers the following endpoints for users to interact with:</p>
        <ul>
            <li><strong>/</strong> - The root endpoint provides an overview of the server’s status, including its uptime and the most recent updates, which are dynamically fetched from the <em>updates.json</em> file.</li>
            <li><strong>/testing</strong> - This endpoint delivers random facts about the first computer chip, each accompanied by an image. The facts are selected randomly from a predefined list, ensuring a new insight with every request.</li>
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
        <p>When the <strong>/testing</strong> endpoint is accessed, a random fact about the first computer chip is provided. Each response includes a historical fact along with an associated image, creating an engaging and informative experience for the user. The facts are pre-defined within the code, ensuring consistency across requests.</p>

        <h2>Error Handling</h2>
        <p>If a user attempts to access a non-existent route, the API returns a custom 404 error message: <em>"Oh dear! The page thou seekest is not to be found."</em> This ensures that users are promptly informed when they encounter an unavailable resource, helping maintain a seamless user experience.</p>

        <h2>Server Startup</h2>
        <p>Upon server startup, Winston logs a message indicating that the server is operational and ready to handle requests. This message reads: <em>"The server is now operational upon port ${PORT}. Brace thyself for the adventure ahead!"</em></p>

        <p>In conclusion, the MonkeyBytes-API is designed with both functionality and security in mind, offering users a reliable and engaging interface. With its dynamic content, robust logging, and secure architecture, the API is well-equipped to handle a variety of use cases.</p>
    `);
});

// /testing route with random images from Lorem Picsum
app.get('/testing', (req, res) => {
    // List of facts about the first computer chip with Lorem Picsum URLs
    const facts = [
        { id: 'fact1', testText: "Behold the wondrous tale of the silicon marvel known as the first computer chip!", testImg: 'https://picsum.photos/300/200?random=1', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact2', testText: "In the year of our Lord 1958, a man named Jack Kilby did fashion this wondrous device.", testImg: 'https://picsum.photos/300/200?random=2', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact3', testText: "Lo and behold, the first chip did indeed bear but a modest handful of transistors.", testImg: 'https://picsum.photos/300/200?random=3', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact4', testText: "The very first chip was but a mere 10 millimeters square in size.", testImg: 'https://picsum.photos/300/200?random=4', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact5', testText: "Upon this tiny silicon platform, the circuitry was etched with great precision.", testImg: 'https://picsum.photos/300/200?random=5', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact6', testText: "The advent of this chip marked the dawn of an age where vast calculations could be performed with great speed.", testImg: 'https://picsum.photos/300/200?random=6', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact7', testText: "Before this momentous invention, computing devices were vast contraptions of metal and wire.", testImg: 'https://picsum.photos/300/200?random=7', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact8', testText: "Each chip was crafted with care by means of intricate processes.", testImg: 'https://picsum.photos/300/200?random=8', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact9', testText: "In the days prior, computing was a realm reserved for the grandest of machines.", testImg: 'https://picsum.photos/300/200?random=9', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact10', testText: "Yet with this breakthrough, the march of progress did hasten forward with unparalleled fervor.", testImg: 'https://picsum.photos/300/200?random=10', dateUnixUK: Math.floor(Date.now() / 1000) }
    ];

    // Choose a random fact
    const randomFact = facts[Math.floor(Math.random() * facts.length)];

    res.json(randomFact);
});

// 404 Error Handler
app.use((req, res) => {
    res.status(404).send("Oh dear! The page thou seekest is not to be found.");
});

// Start the server
app.listen(PORT, () => {
    logger.info(`The server is now operational upon port ${PORT}. Brace thyself for the adventure ahead!`);
});
