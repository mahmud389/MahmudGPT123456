import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import session from "express-session";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(process.env.DATABASE_URL || "sqlite.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS threads (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    mode TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    thread_id TEXT,
    role TEXT,
    content TEXT,
    thinking TEXT,
    attachments TEXT, -- JSON string
    timestamp INTEGER,
    FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE
  );
`);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
  }
}));

// Guest User
const GUEST_USER = {
  id: 'guest_user',
  name: 'Mahmud Guest',
  email: 'guest@mahmudgpt.plus',
  avatar: 'https://picsum.photos/seed/mahmud/200/200',
  plan: 'pro'
};

app.get("/api/me", (req, res) => {
  res.json(GUEST_USER);
});

app.post("/api/logout", (req, res) => {
  res.json({ success: true });
});

// Threads & Messages
app.get("/api/threads", (req, res) => {
  const threads = db.prepare("SELECT * FROM threads WHERE user_id = ? ORDER BY created_at DESC").all(GUEST_USER.id);
  res.json(threads);
});

app.post("/api/threads", (req, res) => {
  const { id, title, mode } = req.body;
  db.prepare("INSERT INTO threads (id, user_id, title, mode) VALUES (?, ?, ?, ?)").run(id, GUEST_USER.id, title, mode);
  res.json({ success: true });
});

app.delete("/api/threads/:id", (req, res) => {
  db.prepare("DELETE FROM threads WHERE id = ? AND user_id = ?").run(req.params.id, GUEST_USER.id);
  res.json({ success: true });
});

app.get("/api/threads/:id/messages", (req, res) => {
  const messages = db.prepare("SELECT * FROM messages WHERE thread_id = ? ORDER BY timestamp ASC").all(req.params.id);
  res.json(messages.map((m: any) => ({
    ...m,
    attachments: m.attachments ? JSON.parse(m.attachments) : []
  })));
});

app.post("/api/messages", (req, res) => {
  const { id, thread_id, role, content, thinking, attachments, timestamp } = req.body;
  db.prepare(`
    INSERT INTO messages (id, thread_id, role, content, thinking, attachments, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, thread_id, role, content, thinking, JSON.stringify(attachments || []), timestamp);
  res.json({ success: true });
});

// Interpreter (Simplified Sandbox)
app.post("/api/interpreter", async (req, res) => {
  const { code, language } = req.body;
  if (language === 'javascript') {
    try {
      const result = eval(code);
      res.json({ output: String(result) });
    } catch (e: any) {
      res.json({ error: e.message });
    }
  } else {
    res.json({ output: `Executed ${language} code (simulated)` });
  }
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MahmudGPT PROMIX+ Server running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
