import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from 'url';
import supabase from "./supabaseClient.js";

const app = express();

// Helper to find current folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

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
const pages = ["index", "about", "help", "action"];
pages.forEach(page => {
  app.get(`/${page}`, (req, res) =>
    res.sendFile(path.join(__dirname, "public", `${page}.html`))
  );
});

// Export app for Vercel
export default app;

// Local server for testing
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
