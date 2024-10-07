## [2.0.0] - 2024-10-07

### Added
- **Stable Release Declaration**:
  - This version is officially declared stable, having undergone extensive testing and debugging for production readiness.

- **Comprehensive Server Metrics**:
  - Introduced dynamic server metrics in the root (`/`) endpoint, including uptime, current server date, and live UK time. The server time updates every second using a custom front-end script.

- **Random Cat Facts via CatFact Ninja API**:
  - Integrated `https://catfact.ninja` to serve random cat facts on the `/testing` endpoint. Each request returns a unique cat fact alongside randomly generated bot names and cat images.

- **Improved Discord Webhook Integration for Reddit Feeds**:
  - Enhanced the functionality for fetching top 5 posts from Reddit RSS feeds (`/r/all` and `/r/discordapp`) and posting them to different Discord channels using webhooks. Each post is formatted correctly with titles, content, and images (if available).

### Changed
- **Root Endpoint Improvements**:
  - The root (`/`) endpoint now serves detailed information, including:
    - API structure guide
    - Latest updates from `updates.json`
    - Server metrics and uptime with an automatic updating UK time.
  
- **Refined Webhook Formatting**:
  - Adjusted the formatting of Discord webhooks for Reddit posts. Posts are embedded with proper titles, content, author names, and post links. Improved handling of posts with no images or content.

### Fixed
- **Webhook Stability**:
  - Resolved issues where webhooks failed to post multiple posts or posted incomplete data. Now all posts are sent sequentially with proper error handling.

- **Testing Endpoint Stability**:
  - Fixed any inconsistencies with the `/testing` endpoint, ensuring correct output of random bot names, cat images, and facts.

- **Removed Unnecessary Dependencies**:
  - Removed unused packages and streamlined the codebase, ensuring that no unnecessary dependencies are included.

### Documentation
- **Updated Changelog**:
  - Comprehensive changelog detailing all changes, including new features, fixes, and updates, ensuring full transparency and guidance for future developers.
  
- **Code Structure Explanation**:
  - Updated the inline documentation within the code to clearly explain all new functionality, particularly around Discord webhooks, Reddit RSS feeds, and CatFact Ninja integration.

