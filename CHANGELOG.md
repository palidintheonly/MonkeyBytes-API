# Changelog

## [1.3.0] - 2024-10-01

### Added
- **Real-Time Chat Feature**:
  - Integrated **Socket.IO** to enable real-time communication between clients and the server.
  - Developed a `/chat` endpoint allowing users to engage in live conversations.
  - Implemented client-side scripts to handle sending and receiving messages seamlessly.
  
- **Asynchronous Task Management**:
  - Incorporated the `async` library to manage complex asynchronous operations more efficiently.
  - Utilized `async.parallel` to perform multiple tasks concurrently, improving performance and reducing response times.
  
- **Enhanced Error Handling**:
  - Implemented comprehensive error handling middleware to catch and respond to errors gracefully across all routes and functionalities.
  - Added detailed error logging to facilitate easier debugging and maintenance.
  
- **Improved Logging Mechanism**:
  - Updated Winston logger to include more contextual information, such as request metadata and user identifiers.
  - Configured log rotation using `winston-daily-rotate-file` to manage log file sizes and retention policies effectively.
  
- **Performance Optimizations**:
  - Optimized RSS feed fetching and parsing processes to handle larger datasets without compromising performance.
  - Implemented caching strategies for frequently accessed data to reduce redundant network requests and improve response times.

### Changed
- **Endpoint Enhancements**:
  - Updated the `/socket.io` endpoint to support namespaces and rooms, allowing for more organized and scalable real-time communications.
  - Refactored the `/testing` endpoint to include additional data points, such as server load metrics and response times.
  
- **Scheduled Tasks Adjustment**:
  - Modified the scheduling interval for the `postNewestToDiscord` function from every **30 seconds** to every **15 seconds** to provide more timely updates.
  
- **Dependency Upgrades**:
  - Upgraded all npm packages to their latest stable versions to leverage new features, security patches, and performance improvements.

### Fixed
- **/testing Endpoint Issues**:
  - Resolved issues with the `/testing` endpoint by moving the `DISCORD_WEBHOOK_URL` to environment variables and adding necessary validations.
  
- **Error Handling Enhancements**:
  - Improved error handling across routes and functions to provide clearer diagnostics and prevent server crashes due to malformed data.
  
- **Dependency Management**:
  - Ensured all dependencies, including `dotenv`, are correctly imported and utilized within the project.
  
- **Updates Handling**:
  - Verified and updated `updates.json` handling to prevent server crashes due to malformed or missing data.
  
- **Real-Time Communication Stability**:
  - Fixed intermittent disconnection issues with Socket.IO clients to ensure stable and persistent real-time connections.

### Security
- **Sensitive Information Protection**:
  - Moved sensitive URLs, such as the Discord webhook URL, to environment variables to enhance security and prevent accidental exposure in source code repositories.
  
- **Enhanced Helmet Configuration**:
  - Configured Helmet to include additional security headers, such as `Content-Security-Policy` and `Referrer-Policy`, to further safeguard the application against common web vulnerabilities.

### Documentation
- **Code Readability and Maintainability**:
  - Updated documentation and comments throughout the codebase for better readability and easier maintenance.
  
- **Changelog Update**:
  - Documented all recent changes comprehensively to keep track of project evolution and facilitate collaboration.
  
- **API Usage Guide**:
  - Expanded the API usage guide in the root route's HTML to include instructions for utilizing the new real-time chat feature and protected endpoints.

---

## [1.2.1] - 2024-09-19

### Added
- **Environment Variable Management**:
  - Integrated the `dotenv` package to securely manage environment variables.
  - Created a `.env` file to store sensitive information like `DISCORD_WEBHOOK_URL` and `PORT`.
  
### Changed
- **Endpoint Links**:
  - Corrected the "Discord Support Server" link in the root route to point to the actual Discord invite URL instead of the `/testing` endpoint.
  
- **Logging Configuration**:
  - Updated Winston logger to set the log level to `debug` for more detailed logging during development and troubleshooting.
  
- **Scheduled Tasks**:
  - Adjusted the scheduling interval for the `postNewestToDiscord` function to run every **30 seconds** for timely updates.

### Fixed
- **/testing Endpoint Issues**:
  - Resolved issues with the `/testing` endpoint by moving the `DISCORD_WEBHOOK_URL` to environment variables and adding necessary validations.
  
- **Error Handling Enhancements**:
  - Improved error handling across routes and functions to provide clearer diagnostics and prevent server crashes due to malformed data.
  
- **Dependency Management**:
  - Ensured all dependencies, including `dotenv`, are correctly imported and utilized within the project.
  
- **Updates Handling**:
  - Verified and updated `updates.json` handling to prevent server crashes due to malformed or missing data.

### Security
- **Sensitive Information Protection**:
  - Moved sensitive URLs, such as the Discord webhook URL, to environment variables to enhance security and prevent accidental exposure in source code repositories.

### Documentation
- **Code Readability and Maintainability**:
  - Updated documentation and comments throughout the codebase for better readability and easier maintenance.
  
- **Changelog Update**:
  - Documented all recent changes comprehensively to keep track of project evolution and facilitate collaboration.

---

## [1.2.0] - 2024-09-18

### Added
- **Updated Endpoints**:
  - Updated endpoints to match `/testing` endpoint.
  
- **Enhanced Bot Name Generation**:
  - Expanded adjectives and nouns, and added numerical suffixes to enhance bot name generation.

### Fixed
- **Cloud Images Verification**:
  - Verified that all cloud images are sourced from Unsplash and comply with Discord's image formatting rules.

### PLANS
#### POSSIBLE NPM PACKAGE SOON
- **Future Integrations**:
  - Planning to integrate additional npm packages to further enhance the application's functionality and performance.

---

## [1.1.0] - 2024-09-10

### Added
- **Initial Release**:
  - Launched the Monkey Bytes API with basic endpoints and functionalities.
  
- **Basic Endpoints**:
  - Implemented root `/` and `/testing` endpoints as foundational routes.
  
- **Logging Setup**:
  - Configured Winston logger for basic logging needs.
  
### Fixed
- **Initial Bugs**:
  - Addressed initial bugs related to endpoint responses and data handling.

---

## [1.0.0] - 2024-09-01

### Added
- **Project Setup**:
  - Established the initial project structure with Express.js.
  
- **Basic Server Functionality**:
  - Implemented core server functionalities and tested basic route responses.

### Security
- **Basic Security Measures**:
  - Applied Helmet middleware for basic security enhancements.

---
