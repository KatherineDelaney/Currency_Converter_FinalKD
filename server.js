import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from 'url';
import supabase from "./supabaseClient.js";

const app = express();

// Helper to find the current folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// 1. SERVE STATIC FILES FIRST
// This ensures that when index.html asks for style.css, Express finds it.
app.use(express.static(__dirname));

// --- API ROUTES ---

app.post("/api/save-conversion", async (req, res) => {
  const { from, to, amount } = req.body;
  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`
    );
    const data = await response.json();
    const result = data.rates[to];

    const { error } = await supabase
      .from("conversion_history")
      .insert([{ from_currency: from, to_currency: to, amount, result }]);

    if (error) throw error;
    res.json({ result, message: "Saved to database" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/history", async (req, res) => {
  const { data, error } = await supabase
    .from("conversion_history")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// --- PAGE ROUTES ---
// This tells Vercel which HTML file to show for each link
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'about.html')));
app.get('/help', (req, res) => res.sendFile(path.join(__dirname, 'help.html')));
app.get('/action', (req, res) => res.sendFile(path.join(__dirname, 'action.html')));

// 2. CRITICAL FOR VERCEL
// We export the app so Vercel can run it as a serverless function
export default app;

// Keep this for local testing
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
