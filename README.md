# MonkeyBytes-API 🐵💻

**Welcome, noble traveler, to the MonkeyBytes-API!** – an API forged for the future of managing the art of APIs, offering robust, secure, and efficient solutions fit for any grand endeavor. The MonkeyBytes-API is a proud member of the esteemed **Monkey Network (MN)**, and verily, it may easily become **thine own API** as well.

## 🎯 Overview

The MonkeyBytes-API is a secure, high-performing, and most easily extendable API, meticulously crafted using the finest tools of **Node.js** and **Express**. It employs the sagacious protection of **Helmet**, provides structured records through **Winston**, and handles dynamic data with the grace of **FS Promises**.

### Features:
- **Customizable to Thine Desires** – Adapt the API to suit your particular needs, kind sir or madam.
- **Secure by Royal Decree** – Employeth [Helmet.js](https://helmetjs.github.io/) for the finest in security, as any wise lord or lady would.
- **Structured Chronicles** – Via [Winston](https://github.com/winstonjs/winston), all events are logged for posterity and convenience.
- **Dynamic Missives** – Load updates in a manner most dynamic from sacred JSON scrolls.
- **The Clock of Uptime** – Gaze upon the uptime of thine server and see the time in the lands of GMT and BST.
- **Facts from the Mystical Chip** – The `/testing` endpoint offers random tales about the **first computer chip**, complete with imagery and the Unix timestamp, of course.
- **Error Handling for the Confused** – A custom handling of errors, making clear that which is obscure to the common folk.

---

## 🛠️ Technologies

The MonkeyBytes-API is constructed from the following finest technologies of our age:

- **Node.js** – The runtime of JavaScript, powered by the mighty Chrome's V8 engine.
- **Express.js** – A web framework most minimalist, suited for the creation of APIs with the elegance of a royal scribe.
- **Winston** – A versatile and noble library of logging.
- **Helmet** – The armor that shields our Express from harm.
- **FS Promises** – A module most asynchronous, for tasks involving the realm of files.
- **Path** – A utility most necessary for the manipulation of file and directory paths.

---

## 📂 API Endpoints

And now, dear reader, let me present to you the esteemed routes of this grand API:

### The Root Route `/`
Upon the root route, ye shall find:
- **The Status of the Server**: Witness the uptime and current time, shown in the venerable format of GMT/BST.
- **Available Endpoints**: A list of accessible routes, displayed for your perusal.
- **Recent Updates**: Behold updates, dynamically loaded from the JSON scrolls.

###  Code Scanning Badges 🛡️
- CodeQL Badge:
[![CodeQL](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/github-code-scanning/codeql)

- CodeQL Advanced Badge:
[![CodeQL Advanced](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/codeql.yml/badge.svg)](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/codeql.yml)

- njsscan Badge:
[![njsscan sarif](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/njsscan.yml/badge.svg)](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/njsscan.yml)

### The Testing Route `/testing`
The `/testing` endpoint offers knowledge most curious, providing thee with:
- A **random fact** about the **first computer chip**, a marvel of modern technology.
- A **royalty-free image** that accompanies the aforementioned fact.
- The **current Unix timestamp**, for accuracy and posterity.

#### Example response from `/testing`:
```json
{
  "id": "fact1",
  "testText": "Behold the wondrous tale of the silicon marvel known as the first computer chip!",
  "testImg": "https://picsum.photos/300/200?random=1",
  "dateUnixUK": 1693939200
}
