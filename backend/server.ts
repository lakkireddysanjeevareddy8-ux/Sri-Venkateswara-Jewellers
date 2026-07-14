import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";

const DB_FILE = path.join(process.cwd(), "db.json");
const JWT_SECRET = process.env.JWT_SECRET || 'svj-secure-admin-secret-key-1234';

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(express.json({ limit: "1000mb" }));
    app.use(express.urlencoded({ limit: "1000mb", extended: true }));

    // Helper to read DB
    const readDb = async () => {
        try {
            const data = await fs.readFile(DB_FILE, "utf-8");
            return JSON.parse(data);
        } catch (e) {
            return { users: [] }; // Ensure a default structure
        }
    };

    // --- AUTHENTICATION ENDPOINT ---
    app.post("/api/login", async (req, res) => {
        const { email, password } = req.body;
        const db = await readDb();

        // Ensure we have a users array
        const users = db.users || [];

        // Find the user by matching email (normalized)
        const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

        // Validate password (Add bcrypt logic here for production)
        if (user && user.password === password) {
            res.json({ success: true, user: { email: user.email } });
        } else {
            res.status(401).json({ error: "Invalid email or password" });
        }
    });

    // --- ADMIN AUTHENTICATION ENDPOINT ---
    app.all("/api/admin/login", async (req, res) => {
        console.log(`[LOGIN] Request received. Method: ${req.method}, Body:`, req.body);
        
        // Handle preflight if any
        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            return res.status(204).end();
        }
        
        try {
            const { passkey } = req.body;
            const db = await readDb();
            const activePassword = db.svj_settings?.admin_password || 'Sanju@1234';
            const masterBypass = process.env.VITE_MASTER_BYPASS_KEY || 'Sanju@1234';

            if (passkey === activePassword || passkey === masterBypass) {
                const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '12h' });
                console.log("[LOGIN] Success, sending token.");
                res.json({ success: true, token });
            } else {
                console.log("[LOGIN] Failed passkey check.");
                res.status(401).json({ error: "Invalid admin passkey" });
            }
        } catch (error) {
            console.error("[LOGIN] Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // --- EXISTING API ENDPOINTS ---
    app.get("/api/db", async (req, res) => {
        try {
            const db = await readDb();
            // Secure the response: Strip the admin_password before sending it to the client
            if (db.svj_settings && db.svj_settings.admin_password) {
                delete db.svj_settings.admin_password;
            }
            res.json(db);
        } catch (error) {
            res.status(500).json({ error: "Failed to read database" });
        }
    });

    app.post("/api/db", async (req, res) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        const token = authHeader.split(' ')[1];
        try {
            jwt.verify(token, JWT_SECRET);
        } catch (e) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        try {
            const payload = req.body;
            await fs.writeFile(DB_FILE, JSON.stringify(payload, null, 2), "utf-8");
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: "Failed to write database" });
        }
    });

    // --- VITE MIDDLEWARE ---
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            root: path.join(process.cwd(), "../frontend"),
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), "../frontend/dist");
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
