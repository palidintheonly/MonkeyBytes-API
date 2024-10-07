## [1.5.0] - 2024-10-01

### Added
- **Medieval-Themed API Responses**:
  - Transformed all API responses and log messages to be styled after 1066 UK nobility, creating a thematic and immersive user experience across all endpoints.
  
- **The Cat API Integration**:
  - Replaced the Dog CEO API with The Cat API for fetching randomized cat images in the `/testing` endpoint. Cat images now return with details including the image ID, width, and height.
  
- **Random Bot Name Generation with Cat Theme**:
  - Updated the bot name generation to reflect cat-related adjectives and nouns, replacing previous dog-themed names, ensuring the new bot names fit with the feline-focused update.
  
- **Multiple Reddit Feeds with Discord Webhook Support**:
  - Added the ability to fetch from two Reddit RSS feeds, `/r/all` and `/r/discordapp`.
  - Integrated separate Discord webhooks for each feed, posting top 5 new posts to different Discord channels every 5 minutes. This feature includes posting at server startup and ensuring the same posts aren't reposted unless new content is available.

- **UK Unix Timestamps**:
  - Implemented Unix timestamps in the `/testing` endpoint response to provide UK-based timestamps in both short and relative Unix formats.

### Changed
- **Root Endpoint Improvements**:
  - Expanded the HTML served at the root (`/`) endpoint to include a medieval-style guide for dummies and additional sections outlining the API structure, providing clear instructions for users.
  - Refined the display of updates pulled from the `updates.json` file, ensuring each section aligns with the medieval theme.

- **Webhook Embed Improvements**:
  - Ensured that all embeds sent to Discord are posted sequentially under a unified proclamation, with each post displayed clearly after the title. Fixed issues with missing or inconsistent embeds.

### Fixed
- **Structured Codebase**:
  - Reviewed and corrected the codebase for consistency, fixing previously missing functions and ensuring all utility functions, such as for generating bot names, cat images, and profile pictures, are properly integrated.
  
- **Webhook Stability**:
  - Fixed the issue where multiple webhooks were not functioning properly. Now, each webhook posts 5 Reddit posts in the proper format (title followed by each post), ensuring stability and reliability.
  
- **Missing Sections in Routes**:
  - Restored missing parts of the root endpoint, including the Guide for Dummies and the structured updates section. Now the route presents comprehensive and fully formatted content.

### Documentation
- **Expanded API Documentation**:
  - Updated documentation for all new features, including the switch to cat-themed content, Reddit webhook functionality, and timestamp integration.
  - Added changelog entries to capture the extensive updates made during this session, ensuring future developers have clear insights into the changes made.

- **Changelog Entry**:
  - Documented this release comprehensively, noting the thematic overhaul, new integrations, and structural fixes across the entire API.
