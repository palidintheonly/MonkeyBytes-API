# Changelog

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

## Previous Versions

### [1.2.0] - 2024-09-18
#### Added
- Updated endpoints to match `/testing` endpoint.
- Enhanced bot name generation by expanding adjectives and nouns, and adding numerical suffixes.

#### Fixed
- Verified that all cloud images are sourced from Unsplash and comply with Discord's image formatting rules.
