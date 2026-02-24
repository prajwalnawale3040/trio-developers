import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("whatsapp_messenger.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'admin',
    whatsapp_api_key TEXT,
    phone_number_id TEXT,
    subscription_plan TEXT DEFAULT 'free',
    subscription_expiry DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    batch_id INTEGER,
    tags TEXT,
    category TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    batch_id INTEGER,
    content TEXT,
    status TEXT DEFAULT 'pending', -- pending, sent, failed
    scheduled_at DATETIME,
    sent_at DATETIME,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    content TEXT,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    plan_name TEXT,
    amount REAL,
    transaction_id TEXT,
    status TEXT DEFAULT 'pending', -- pending, verified, rejected
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // --- API Routes ---

  // Auth (Mock for now)
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    // Simple mock auth
    if (username === "admin" && password === "admin") {
      res.json({ success: true, token: "mock-jwt-token", user: { username: "admin", role: "admin" } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // Contacts
  app.get("/api/contacts", (req, res) => {
    const contacts = db.prepare("SELECT * FROM contacts ORDER BY created_at DESC").all();
    res.json(contacts);
  });

  app.post("/api/contacts", (req, res) => {
    const { name, phone, batch_id, tags, category, notes } = req.body;
    const info = db.prepare("INSERT INTO contacts (name, phone, batch_id, tags, category, notes) VALUES (?, ?, ?, ?, ?, ?)").run(name, phone, batch_id, tags, category, notes);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/contacts/bulk", (req, res) => {
    const { contacts } = req.body;
    const insert = db.prepare("INSERT INTO contacts (name, phone, batch_id, tags, category, notes) VALUES (?, ?, ?, ?, ?, ?)");
    const insertMany = db.transaction((contacts) => {
      for (const contact of contacts) {
        insert.run(contact.name, contact.phone, contact.batch_id, contact.tags, contact.category, contact.notes);
      }
    });
    insertMany(contacts);
    res.json({ success: true, count: contacts.length });
  });

  // Batches
  app.get("/api/batches", (req, res) => {
    const batches = db.prepare("SELECT * FROM batches").all();
    res.json(batches);
  });

  app.post("/api/batches", (req, res) => {
    const { name, description } = req.body;
    try {
      const info = db.prepare("INSERT INTO batches (name, description) VALUES (?, ?)").run(name, description);
      res.json({ id: info.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Batch name already exists" });
    }
  });

  // Messages & Campaigns
  app.get("/api/messages/history", (req, res) => {
    const history = db.prepare(`
      SELECT m.*, c.name as contact_name, c.phone as contact_phone, b.name as batch_name 
      FROM messages m
      LEFT JOIN contacts c ON m.contact_id = c.id
      LEFT JOIN batches b ON m.batch_id = b.id
      ORDER BY m.created_at DESC
      LIMIT 100
    `).all();
    res.json(history);
  });

  app.post("/api/messages/send", async (req, res) => {
    const { contact_ids, batch_id, content, scheduled_at } = req.body;
    
    // In a real app, we'd queue these. For now, we'll just insert them as pending.
    const insert = db.prepare("INSERT INTO messages (contact_id, batch_id, content, scheduled_at, status) VALUES (?, ?, ?, ?, ?)");
    
    if (contact_ids) {
      const insertMany = db.transaction((ids) => {
        for (const id of ids) {
          insert.run(id, null, content, scheduled_at || null, 'pending');
        }
      });
      insertMany(contact_ids);
    } else if (batch_id) {
      const contacts = db.prepare("SELECT id FROM contacts WHERE batch_id = ?").all(batch_id);
      const insertMany = db.transaction((contacts) => {
        for (const contact of contacts) {
          insert.run(contact.id, batch_id, content, scheduled_at || null, 'pending');
        }
      });
      insertMany(contacts);
    }

    res.json({ success: true, message: "Messages queued successfully" });
  });

  // AI Features
  app.post("/api/ai/enhance", async (req, res) => {
    const { text, tone } = req.body;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Rewrite this WhatsApp message to be more ${tone || 'professional'} and engaging. Add relevant emojis. Keep it concise. Original message: "${text}"`,
      });
      res.json({ enhancedText: response.text });
    } catch (error) {
      res.status(500).json({ error: "AI Enhancement failed" });
    }
  });

  app.post("/api/ai/generate-image", async (req, res) => {
    const { prompt } = req.body;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts: [{ text: `A professional marketing poster for: ${prompt}. Premium luxury style, Trio Developers branding.` }] },
      });
      
      let base64Image = "";
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
      res.json({ imageUrl: base64Image });
    } catch (error) {
      res.status(500).json({ error: "AI Image Generation failed" });
    }
  });

  // Payments
  app.post("/api/payments/verify", (req, res) => {
    const { transaction_id, amount, plan_name } = req.body;
    const info = db.prepare("INSERT INTO payments (user_id, plan_name, amount, transaction_id, status) VALUES (?, ?, ?, ?, ?)").run(1, plan_name, amount, transaction_id, 'pending');
    res.json({ success: true, id: info.lastInsertRowid });
  });

  // Stats
  app.get("/api/stats", (req, res) => {
    const totalMessages = db.prepare("SELECT COUNT(*) as count FROM messages").get().count;
    const sentMessages = db.prepare("SELECT COUNT(*) as count FROM messages WHERE status = 'sent'").get().count;
    const failedMessages = db.prepare("SELECT COUNT(*) as count FROM messages WHERE status = 'failed'").get().count;
    const totalContacts = db.prepare("SELECT COUNT(*) as count FROM contacts").get().count;
    const totalBatches = db.prepare("SELECT COUNT(*) as count FROM batches").get().count;

    res.json({
      totalMessages,
      sentMessages,
      failedMessages,
      totalContacts,
      totalBatches,
      activeCampaigns: 0 // Mock
    });
  });

  // --- Vite Integration ---
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
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Simple Mock Message Processor (Cron-like)
  setInterval(() => {
    const pendingMessages = db.prepare("SELECT * FROM messages WHERE status = 'pending' AND (scheduled_at IS NULL OR scheduled_at <= CURRENT_TIMESTAMP) LIMIT 10").all();
    for (const msg of pendingMessages) {
      // Mock sending logic
      console.log(`Sending message to contact ${msg.contact_id}: ${msg.content}`);
      db.prepare("UPDATE messages SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE id = ?").run(msg.id);
    }
  }, 10000);
}

startServer();
