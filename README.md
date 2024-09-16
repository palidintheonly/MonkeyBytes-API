### 🛡️ Code Scanning Badges

- **CodeQL Badge**:
  [![CodeQL](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/github-code-scanning/codeql)

- **CodeQL Advanced Badge**:
  [![CodeQL Advanced](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/codeql.yml/badge.svg)](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/codeql.yml)

- **njsscan Badge**:
  [![njsscan sarif](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/njsscan.yml/badge.svg)](https://github.com/palidintheonly/MonkeyBytes-API/actions/workflows/njsscan.yml)

# MonkeyBytes-API 🐵💻

**Hear ye, noble lords and ladies! Welcome to the esteemed MonkeyBytes-API!** A most splendid API forged for the future, mastering the art of APIs with robustness, security, and efficiency befitting any grand endeavor. The MonkeyBytes-API is a proud member of the venerable **Monkey Network (MN)**, and verily, it may become **thine own API** as well.

## 🎯 Overview

The MonkeyBytes-API is a secure, high-performing, and exceedingly extendable API, meticulously crafted using the finest tools of **Node.js** and **Express**. It employeth the sagacious protection of **Helmet**, provideth structured chronicles through **Winston**, and handlest dynamic missives with the grace of **FS Promises**.

### Features:

- **Customizable to Thine Desires** – Adapt the API to suit your particular needs, noble sir or madam.
- **Secure by Royal Decree** – Employeth [Helmet.js](https://helmetjs.github.io/) for the finest in security, as any wise sovereign would.
- **Structured Chronicles** – Via [Winston](https://github.com/winstonjs/winston), all events are logged for posterity and convenience.
- **Dynamic Missives** – Load updates in a manner most dynamic from sacred JSON scrolls.
- **The Clock of Uptime** – Gaze upon the uptime of thine server and see the time in the lands of GMT and BST.
- **Tales from the Mechanical Knight** – The `/testing` endpoint offers random tales about the **first mechanical knight**, complete with imagery and the Unix timestamp, of course.
- **Error Handling for the Confused** – Custom handling of errors, making clear that which is obscure to the common folk.

---

## 🛠️ Technologies

The MonkeyBytes-API is constructed from the finest technologies of our age:

- **Node.js** – The runtime of JavaScript, powered by the mighty V8 engine.
- **Express.js** – A web framework most minimalist, suited for the creation of APIs with the elegance of a royal scribe.
- **Winston** – A versatile and noble library for logging.
- **Helmet** – The armor that shields our Express from harm.
- **FS Promises** – A module most asynchronous, for tasks involving the realm of files.
- **Path** – A utility most necessary for the manipulation of file and directory paths.
- **Axios** – A herald that fetches data from distant realms.
- **xml2js** – A sorcerer that transforms XML into JavaScript objects.
- **Crypto** – For secure random numbers, guarding our secrets well.

---

## 📂 API Endpoints

And now, dear reader, let me present to you the esteemed routes of this grand API:

### The Root Route `/`

Upon the root pathway, ye shall find:

- **The State of the Server**: Witness the uptime and current time, shown in the venerable format of GMT/BST.
- **Available Pathways**: A list of accessible routes, displayed for your perusal.
- **Latest Decrees**: Behold updates, dynamically loaded from the sacred `updates.json` scroll.

### The Testing Route `/testing`

The `/testing` endpoint offers knowledge most curious, providing thee with:

- A **random tale** about the **first mechanical knight**, a marvel of ancient ingenuity.
- A **royalty-free image** of a noble hound, accompanying the aforementioned tale.
- A **random profile picture** generated by the mystical **RoboHash**.
- The **current Unix timestamp**, for accuracy and posterity.
- A **random bot name**, generated to amuse and delight.

#### Example Response from `/testing`:


### 📜 How to Begin Thy Journey
1. Clone the Repository:
```git clone https://github.com/palidintheonly/MonkeyBytes-API.git```

2. Install Dependencies:
cd MonkeyBytes-API
```bash
npm install```

3. Run the Server:
```bash
{
node index.mjs
} 
```
```json
{
  "id": "fact7",
  "testText": "Know ye that men of wisdom did conceive a device, an automaton, to emulate human motion.",
  "dateUnixUK": 1693939200,
  "testImg": "https://random.dog/abc123.jpg",
  "testingProfilePicture": "https://robohash.org/def456.png",
  "testingBotName": "GallantSquire789"
}
```
