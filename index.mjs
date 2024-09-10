import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import winston from 'winston';
import helmet from 'helmet';

const app = express();
const PORT = 21560;

// Utilise helmet for enhanced security
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

// Path to updates.json file
const updatesFilePath = path.join(process.cwd(), 'updates.json');

// Logger configuration (Winston)
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [new winston.transports.Console()]
});

// Function to load updates from file
async function loadUpdates() {
    try {
        const fileData = await fs.readFile(updatesFilePath, 'utf-8');
        return JSON.parse(fileData);
    } catch (error) {
        logger.error(`Alas! An error hath occurred whilst attempting to load updates: ${error.message}`);
        return [];
    }
}

// Function to add a new update and save to file
async function addUpdate(updateText, description) {
    try {
        const updates = await loadUpdates();
        updates.push({ updateText, description });
        await fs.writeFile(updatesFilePath, JSON.stringify(updates, null, 2));
        logger.info('Splendid! A new update hath been added and saved. Rejoice in the knowledge!');
    } catch (error) {
        logger.error(`Oh dear! An error hath arisen whilst saving updates: ${error.message}`);
    }
}

// Root route
app.get('/', async (req, res) => {
    // Load updates from file
    const updates = await loadUpdates();

    // Obtain current time in GMT/BST
    const currentDateTime = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' });

    // Calculate server uptime
    const uptime = formatUptime(Date.now() - serverStartTime);

    res.send(`
        <div style="border: 1px solid #000; padding: 20px; opacity: 0.8;">
            <h1 style="font-size: 2.5em; font-weight: bold;">Welcome to Monkey Bytes API - Part of Monkey Network (MN)</h1>
            <p>Congratulations! Thou hast discovered Monkey Bytes API, the ultimate instrument for thy API management. Our server doth herald the commencement of thy next grand venture.</p>
            
            <p style="text-align:right; font-size:small; color:gray;"><strong>Uptime:</strong> ${uptime}</p>
            
            <h2>Server Status</h2>
            <ul>
                <li><strong>Current Date and Time (GMT/BST):</strong> ${currentDateTime}</li>
            </ul>

            <h2>Available Endpoints</h2>
            <ul>
                <li><strong>/testing</strong> - Prithee, regard this endpoint as thy personal magic box. It provideth a random ID, a morsel of test text, a robot visage, and the time in those curious Unix numbers. Engage with it, for who could resist such exploration?</li>
            </ul>

            <h2>Recent Updates</h2>
            <ul>
                ${updates.map(update => `
                    <li>
                        <strong>${update.updateText}</strong>
                        <p>${update.description}</p>
                    </li>
                `).join('')}
            </ul>

            <h2>Upcoming Enhancements</h2>
            <p>Prepare thyself for marvels to come. We are concocting:</p>
            <ul>
                <li>Advanced analytics and logging so astute, they may indeed bring a smile to thy face.</li>
                <li>User management features so elegant, thou might begin to believe in miracles.</li>
                <li>Innovations that will prompt thee to ponder how thou hast ever managed without them.</li>
            </ul>
            <p>Steel thyself—this is but the dawn of a new epoch in API management!</p>

            <h2>How to Use the /testing Endpoint</h2>
            <p>Imagine thou hast a magical contrivance with several tricks. Herein lies how to employ it:</p>
            <ol>
                <li><strong>What It Doth:</strong> The <code>/testing</code> contrivance bestoweth upon thee a random ID, some whimsical text, a robot likeness, and the time in Unix numbers. Forsooth, why not?</li>
                <li><strong>How to Utilize It:</strong> To procure these wonders, merely append <code>/testing</code> to the web address. For example, if thy server be located at <code>http://localhost:21560</code>, thou shouldst visit <code>http://localhost:21560/testing</code> in thine web browser.</li>
                <li><strong>What Thou Shalt Observe:</strong> Thou shalt receive a magical ID, some delightful text, a robot image, and a Unix timestamp. 'Tis akin to opening a box of marvels.</li>
            </ol>
            <p>Enjoy thy new enchantment!</p>
        </div>
    `);
});

// /testing route with 10 unique facts about the first computer chip
app.get('/testing', (req, res) => {
    // List of facts about the first computer chip with .png image URLs
    const facts = [
        { id: 'fact1', testText: "Behold the wondrous tale of the silicon marvel known as the first computer chip!", testImg: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Intel_4004_Processor.png', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact2', testText: "In the year of our Lord 1958, a man named Jack Kilby did fashion this wondrous device.", testImg: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Jack_Kilby.png', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact3', testText: "Lo and behold, the first chip did indeed bear but a modest handful of transistors.", testImg: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Intel_4004_Die.png', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact4', testText: "The very first chip was but a mere 10 millimeters square in size.", testImg: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Intel_4004_Circuit.png', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact5', testText: "Upon this tiny silicon platform, the circuitry was etched with great precision.", testImg: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Intel_4004_Chip.png', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact6', testText: "The advent of this chip marked the dawn of an age where vast calculations could be performed with great speed.", testImg: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Intel_4004_Chip_1.png', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact7', testText: "Before this momentous invention, computing devices were vast contraptions of metal and wire.", testImg: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/First_computer_chip.png', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact8', testText: "Each chip was crafted with care by means of intricate processes.", testImg: 'https://upload.wikimedia.org/wikipedia/commons/4/41/First_Integrated_Circuit.png', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact9', testText: "In the days prior, computing was a realm reserved for the grandest of machines.", testImg: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Intel_4004.png', dateUnixUK: Math.floor(Date.now() / 1000) },
        { id: 'fact10', testText: "Yet with this breakthrough, the march of progress did hasten forward with unparalleled fervor.", testImg: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Intel_4004_Processor.png', dateUnixUK: Math.floor(Date.now() / 1000) }
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
