# MonkeyBytes-API 🐵💻

**Welcome to the MonkeyBytes-API!** – an API built for the future of managing APIs, providing robust, secure, and efficient solutions for any project. MonkeyBytes-API is part of the **Monkey Network (MN)**, and this can easily be **your API** as well.


## 🎯 Overview

MonkeyBytes-API is a secure, performant, and easily extendable API designed using **Node.js** and **Express**. It includes modern security practices with **Helmet**, structured logging using **Winston**, and dynamic data management via **FS Promises**.

### Features:
- **Customizable API** – Tailor it to your specific project needs.
- **Secure by Design** – Uses [Helmet.js](https://helmetjs.github.io/) for comprehensive security.
- **Structured Logging** – Built-in logging via [Winston](https://github.com/winstonjs/winston) for easy monitoring.
- **Dynamic Data Loading** – Load updates dynamically from JSON files.
- **Server Uptime** – Displays server uptime and current time.
- **Fun Facts Endpoint** – `/testing` provides random facts about the **first computer chip** with images and Unix timestamps.
- **Error Handling** – Custom 404 error handling ensures clarity for users.

---

## 🛠️ Technologies

MonkeyBytes-API is built using the following technologies:

- **Node.js** – JavaScript runtime built on Chrome's V8 engine.
- **Express.js** – Minimalist web framework for building APIs.
- **Winston** – Versatile logging library.
- **Helmet** – Security middleware for Express.
- **FS Promises** – Asynchronous file system module.
- **Path** – Utility to work with file and directory paths.

---

## 📂 API Endpoints

Here are the available API endpoints:

### Root Route `/`
The root route provides a welcome message and displays:
- **Server Status**: Shows uptime and current time (in GMT/BST).
- **Available Endpoints**: Lists accessible routes in the API.
- **Recent Updates**: Displays dynamic updates loaded from a JSON file.

### Testing Route `/testing`
This endpoint provides random **facts** about the **first computer chip**. Each response includes:
- A **random fact** about the history of the chip.
- A **royalty-free image** associated with the fact.
- The current **Unix timestamp**.

#### Example response from `/testing`:
```json
{
  "id": "fact1",
  "testText": "Behold the wondrous tale of the silicon marvel known as the first computer chip!",
  "testImg": "https://picsum.photos/300/200?random=1",
  "dateUnixUK": 1693939200
}
