# 📜 MonkeyBytes-API

![MonkeyBytes-API Banner](https://cdn.discordapp.com/banners/1051503632677359686/0d039ec11c1709a1c1987bfbcaad6e7c.png?size=1024&format=webp&quality=lossless&width=0&height=256)

Welcome, noble traveler, to the realm of MonkeyBytes-API. Herein lies your gateway to the latest decrees and features. Our server stands as a bastion of knowledge, ensuring a steadfast and secure experience for all who seek its counsel.

## ⚔️ Available Routes

- **`/`** - The grand gateway to the kingdom, where noble lords and ladies may learn of the API’s purpose and its latest proclamations.
- **`/testing`** - A pathway of great intrigue, bestowing upon thee random tales of hounds from distant lands, along with images of these loyal creatures.

## ⏳ Server Status

Our server hath remained steadfast for **X days, Y hours, Z minutes, and A seconds**. May it continue to serve without falter!

## 📰 Latest Updates

Stay informed with the most recent decrees:

- **Comprehensive API Overhaul and Medieval Theming** - *The API hath been fully transformed with responses, logs, and texts in the style of 1066 UK nobility, enriching the user experience.*
- **Enhanced `/testing` Route** - *Venture forth to the `/testing` endpoint to receive randomized images of loyal hounds, bot names of medieval flair, and tales of days of yore.*
- **Integration of Redis Caching** - *Implemented Redis as an in-memory store to cache frequently accessed data, ensuring swifter responses and reduced server strain.*
- **Refinement of Discord Notifications** - *Discord messages are now dispatched with improved formatting and structured embeds, enhancing clarity and readability.*
- **Randomized Profile Picture Generation** - *Employed Robohash to generate random avatars, adding variety to the visual identity of each bot.*

## 🔍 Behind the Scenes

Discover the noble technologies and tools that empower MonkeyBytes-API:

- **Helmet** - Like a trusty helm, Helmet guards our API with headers that ward off common threats.
- **Winston** - Our herald, Winston, records all notable events and errors, ensuring transparency and accountability.
- **Axios** - Our swift messenger, Axios, fetches tales and images from distant lands.
- **xml2js** - The translator that converts the mystical RSS feed into a language our server can comprehend.
- **crypto** - Provides secure randomization for various functionalities.
- **Redis Caching** - Employed to store and quickly retrieve frequently accessed data, ensuring the server’s efficiency.

## 📖 The `/testing` Route

Upon traversing the **`/testing`** route, thou shalt receive a random tale of loyal hounds, narrated in the words of a noble from days of yore, accompanied by a depiction of these faithful creatures. Each response is inscribed with care, ensuring a unique experience with every request.

## 📡 Reddit Feed

Our server doth fetch the latest missives from Reddit's realm every 30 seconds, sharing the five newest proclamations with our Discord community.

## 🚫 Error Handling

Shouldst thou wander astray and seek a path unknown, our server shall gently remind thee: *"Oh dear! The page thou seekest is not to be found."*

## 🛡️ Security and Logging

We employ various safeguards and loggers to ensure the smooth operation of our server and the safety of our users:

- **Helmet**: Secures HTTP headers to protect against well-known web vulnerabilities.
- **Winston**: Provides comprehensive logging for monitoring server activity and diagnosing issues.

## 🚀 Getting Started

### Prerequisites

Ensure thou hast the following installed upon thy machine:

- [Node.js](https://nodejs.org/en/) v14 or higher
- [npm](https://www.npmjs.com/) v6 or higher

### Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/yourusername/MonkeyBytes-API.git
    cd MonkeyBytes-API
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Configure Environment Variables**

    Create a `.env` file in the root directory and add thy Discord webhook URL:

    ```env
    DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
    ```

4. **Run the Server**

    ```bash
    npm start
    ```

    The server shall commence upon port `21560`. Access it by navigating to `http://localhost:21560/` in thy web browser.

### Usage

- **Root Route (`/`)**: Visit `http://localhost:21560/` to behold the server overview, including uptime and the latest updates.
- **Testing Route (`/testing`)**: Venture to `http://localhost:21560/testing` to receive a random tale accompanied by images of loyal hounds.

### Contributing

We welcome contributions from the esteemed community! To contribute:

1. **Fork the Repository**

2. **Create a Feature Branch**

    ```bash
    git checkout -b feature/YourFeatureName
    ```

3. **Commit Thy Changes**

    ```bash
    git commit -m "Add your commit message here"
    ```

4. **Push to the Branch**

    ```bash
    git push origin feature/YourFeatureName
    ```

5. **Open a Pull Request**

    Navigate to the repository on GitHub and click the "Compare & pull request" button to submit thy changes for review.

### Reporting Issues

If thou dost encounter any issues or possess suggestions for enhancements, kindly create an issue upon our GitHub repository. Follow these steps to forge an issue:

1. **Navigate to the Issues Tab**

    Venture to the [Issues](https://github.com/yourusername/MonkeyBytes-API/issues) section of the repository.

2. **Click on "New Issue"**

    Press the "New issue" button to commence.

3. **Provide a Descriptive Title and Detailed Description**

    - **Title**: Briefly summarize the issue or feature request.
    - **Description**: Provide detailed information, including steps to reproduce the issue, expected behavior, and any relevant screenshots or logs.

4. **Submit the Issue**

    After inscribing the necessary details, click "Submit new issue" to create the issue. Our team shall review and address it promptly.

## License

This project is licensed under the [MIT License](LICENSE).

---

&copy; 2024 MonkeyBytes-API. All rights reserved.
