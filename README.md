# MonkeyBytes-API 🐵💻

**Welcome to the MonkeyBytes-API!** – the API built for the future of managing APIs, providing robust, secure, and efficient solutions for any project. MonkeyBytes-API is part of the **Monkey Network (MN)**, and this can easily be **your API** as well.

> **_opensource_**

[![CodeQL Advanced](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/codeql.yml/badge.svg)](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/codeql.yml)
[![CodeQL](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/github-code-scanning/codeql)

---

## 🎯 Overview

MonkeyBytes-API is a secure, performant, and easily extendable API designed using Node.js and Express. It is equipped with a range of modern security practices using Helmet, efficient logging with Winston, and dynamic data handling with FS Promises.

### Features:
- **Customizable API** – Can be tailored for any API project.
- **Secure by Design** – Incorporates [Helmet.js](https://helmetjs.github.io/) for security best practices.
- **Structured Logging** – Built-in logging with [Winston](https://github.com/winstonjs/winston) for better monitoring.
- **Dynamic Data Loading** – Updates and data are dynamically fetched from JSON files.
- **Server Uptime** – Displays the server uptime in an intuitive format.
- **Fun Facts Endpoint** – `/testing` endpoint provides random facts about the **first computer chip** with images, timestamps, and more.
- **Error Handling** – Custom 404 error handling.

---

## 🛠️ Technologies

This API is built using the following technologies:

- **Node.js** – JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express.js** – Fast, unopinionated, minimalist web framework for Node.js.
- **Winston** – A versatile logging library.
- **Helmet** – Security for Express apps.
- **FS Promises** – File system module for asynchronous operations.
- **Path** – Module to handle file and directory paths.

---

## 📂 API Endpoints

Here are the current routes available in the API:

### Root Route `/`
The root endpoint returns a welcome message and displays the following:
- **Server Status**: Current uptime and time in GMT/BST.
- **Available Endpoints**: A guide to accessing different endpoints in the API.
- **Recent Updates**: Dynamic updates loaded from a JSON file.

### Testing Route `/testing`
This endpoint provides random **facts** about the **first computer chip**. Each response contains:
- A **random fact** about the chip's history.
- An associated **image** (royalty-free).
- The current **Unix timestamp**.

> Example response from `/testing`:
```json
{
  "id": "fact1",
  "testText": "Behold the wondrous tale of the silicon marvel known as the first computer chip!",
  "testImg": "https://picsum.photos/300/200?random=1",
  "dateUnixUK": 1693939200
}
