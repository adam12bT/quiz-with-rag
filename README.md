# React Quiz Game

A quiz game built with **React** that uses a Retrieval-Augmented Generation (RAG) pipeline to produce quiz questions and a Node backend that leverages **TCP** and **UDP** protocols for networking (multiplayer/score reporting/real-time events). This project demonstrates a full-stack flow: user interface in React, a backend that handles networking and RAG-based question generation, and a simple persistence/indexing layer for retrieval.

---

## Table of contents

* [Features](#features)
* [Architecture](#architecture)
* [Tech stack](#tech-stack)
* [Requirements](#requirements)
* [Environment variables](#environment-variables)
* [Install & run (local)](#install--run-local)
* [How RAG generates quizzes](#how-rag-generates-quizzes)
* [Networking: TCP & UDP roles](#networking-tcp--udp-roles)
* [Testing](#testing)
* [Deployment notes](#deployment-notes)
* [Project structure](#project-structure)
* [Contributing](#contributing)
* [License](#license)

---

## Features

* Single-player quiz mode (questions generated on demand via RAG)
* Multiplayer / real-time features supported through backend TCP/UDP endpoints (e.g., player discovery, score broadcasting)
* Adjustable difficulty and topics
* Persistent score storage (file / DB)
* Admin utilities to rebuild or re-index the retrieval store

---

## Architecture

1. **Frontend (React)**

   * Presents UI, retrieves questions and submits answers via HTTP/WebSocket to backend.
   * Handles UX: timers, score, leaderboards, multiplayer lobby UI.

2. **Backend (Node.js / Express)**

   * HTTP API for frontend operations (fetch question, submit answer, leaderboard).
   * RAG pipeline orchestrator: handles retrieval, sends context to the LLM, returns generated questions.
   * TCP/UDP modules:

     * **UDP** for lightweight broadcast/discovery or broadcasting real-time game events.
     * **TCP** for reliable transmissions (match setup, sending persistent scores, or connecting to other services).
   * Vector store (local or embedded like FAISS/Annoy) for retrieval.

3. **RAG (Retrieval-Augmented Generation)**

   * A retriever (vector index) + generator (LLM).
   * When the frontend requests a question, the backend:

     1. Retrieves relevant docs/snippets from the index using a query (topic/difficulty).
     2. Builds a prompt combining retrieved context + instructions.
     3. Sends prompt to the LLM (e.g., OpenAI or other) and returns a formatted question with options/answer/explanation.

---

## Tech stack

* Frontend: React (Create React App / Vite)
* Backend: Node.js + Express (or Fastify)
* LLM: OpenAI (or another LLM) for generation
* Embeddings/Index: local vector store (FAISS / simple vector JSON store)
* Networking: Node `dgram` for UDP, Node `net` for TCP
* Optional DB: SQLite / PostgreSQL / JSON files

---

## Requirements

* Node.js >= 16
* npm or yarn
* (Optional) Python and FAISS if you use FAISS-based indexing scripts
* API key for chosen LLM provider (if using a hosted LLM)

---

## Environment variables (example)

Create a `.env` file in the backend root:

```
# Backend server
BACKEND_PORT=4000
BACKEND_HOST=0.0.0.0

# Networking ports (example)
TCP_PORT=5000
UDP_PORT=5001

# RAG/LLM
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...        # if using OpenAI
EMBEDDING_MODEL=text-embedding-3-small
GENERATION_MODEL=gpt-4o-mini

# Vector store / index path
RAG_INDEX_PATH=./data/index

# Persistence
DB_PATH=./data/leaderboard.sqlite
```

Adjust names and values to match your implementation.

---

## Install & run (local)

### Backend

```bash
cd backend
npm install
# build or transpile if needed
npm run start           # or `node server.js`
# or for development:
npm run dev             # (nodemon)
```

### Frontend

```bash
cd frontend
npm install
npm run start           # starts dev server, e.g. http://localhost:3000
```

By default, the frontend expects the backend at `http://localhost:4000`. Change the `REACT_APP_API_URL` env variable in the frontend if your backend runs on a different host/port.

---

## How RAG generates quizzes (high-level)

1. **Document corpus**: collect reference material (facts, explanations, curated question banks). Store them as short passages/documents.
2. **Embeddings**: compute embeddings of documents and store them in a vector index.
3. **Retrieval**: given a topic/difficulty, compute a query embedding and retrieve top-k relevant passages from the index.
4. **Prompting**: build a prompt template that instructs the LLM to create a multiple-choice question (or other formats) using the retrieved passages for factual accuracy.
5. **Generation**: send prompt to the LLM; parse and validate the response (ensure there is one correct option and optionally a justification).
6. **Cache**: optionally cache generated questions so you can re-use them and reduce LLM calls.

Example of a backend endpoint used by frontend:

```
GET /api/question?topic=science&difficulty=easy
Response:
{
  "id": "q_123",
  "question": "What is the chemical symbol for water?",
  "choices": ["H2O", "O2", "CO2", "HO"],
  "answerIndex": 0,
  "explanation": "Water is composed of two hydrogen atoms and one oxygen atom..."
}
```

---

## Networking: TCP & UDP roles (why both)

* **UDP** (User Datagram Protocol)

  * Use-cases: broadcasting presence in LAN (game discovery), fast ephemeral events (position updates in real-time casual games), low-latency non-critical notifications.
  * Characteristics: connectionless, low overhead, no guaranteed delivery — good for quick broadcasts.

* **TCP** (Transmission Control Protocol)

  * Use-cases: reliable operations like player authentication, match setup, score submission, syncing persistent data.
  * Characteristics: connection-oriented, guaranteed ordering and delivery.

**Important**: Browsers cannot directly open raw TCP or UDP sockets — the frontend communicates with your backend via HTTP/WebSocket. The backend then uses TCP/UDP sockets to talk to other services or peers. If you implemented a peer-to-peer mode, consider WebRTC for browser-to-browser real-time transport (it uses UDP under the hood).

---

## Example scripts (backend)

**Start UDP listener (Node)**

```js
// udpServer.js (example)
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const PORT = process.env.UDP_PORT || 5001;

server.on('message', (msg, rinfo) => {
  console.log(`UDP message from ${rinfo.address}:${rinfo.port} - ${msg}`);
  // handle discovery or event
});

server.bind(PORT, () => console.log(`UDP server listening on ${PORT}`));
```

**Start TCP server (Node)**

```js
// tcpServer.js (example)
const net = require('net');
const PORT = process.env.TCP_PORT || 5000;

const server = net.createServer(socket => {
  socket.on('data', data => {
    console.log('TCP data:', data.toString());
    // parse and handle commands (JSON framed, for example)
  });
  socket.on('end', () => console.log('TCP client disconnected'));
});

server.listen(PORT, () => console.log(`TCP server listening on ${PORT}`));
```

---

## Testing

* Unit tests for your React components (Jest + React Testing Library)
* Integration tests for backend endpoints (supertest + mocha/jest)
* Simulated UDP/TCP tests: write small Node scripts that act as clients to send/receive test packets.

---

## Deployment notes

* Host frontend on Vercel/Netlify or serve static build from your backend.
* Host backend on a server that allows UDP/TCP sockets (e.g., a VPS, AWS EC2, DigitalOcean droplet). Serverless functions generally do not allow raw sockets.
* Secure your LLM API key; never expose it to the browser.
* If using a managed vector DB (Pinecone, Weaviate), update the backend config to use that instead of local index.

---

## Project structure (suggested)

```
/frontend           # React app
/backend            # Node API + RAG orchestrator + networking code
/backend/data       # index files, DB, cached questions
/scripts            # indexing, embedding generation scripts
/docs               # design docs, prompt templates
```

---

## Security & privacy

* Never send user data or API keys from the browser directly to the LLM provider.
* Rate-limit question generation to avoid runaway LLM costs.
* Validate and sanitize any inputs used in prompts.
* Consider adding an admin interface to review generated questions for bias or hallucination.

---

## Troubleshooting / Tips

* If questions seem inaccurate, increase retrieval `k` or improve document corpus quality.
* Cache frequently generated questions to reduce LLM calls.
* For LAN discovery, test UDP broadcasting with tools like `netcat` before wiring into the app.
* Use logging and telemetry to monitor TCP/UDP errors (timeouts, packet loss).

---

## Contributing

Contributions are welcome. Please:

1. Fork the repo
2. Create a feature branch
3. Open a PR with key changes and rationale

---

## Acknowledgements

* RAG approach inspired by modern LLM best practices (retriever + generator).
* Thanks to community libraries for vector indexing and embeddings.

---

## License

MIT License — see `LICENSE` for details.

---

If you want, I can:

* generate a sample `.env` and `docker-compose.yml`,
* create the `prompt_template.md` used by the RAG generator,
* or create a ready-to-run demo script that indexes a small corpus and spins up the backend. Tell me which one you want and I’ll add it to the repo.
