import fetch from "node-fetch";
import supabase from "./supabaseClient.js";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Parse the incoming request body (Crucial for Vercel POST requests)
  let body = req.body;
  if (req.method === 'POST' && (!body || Object.keys(body).length === 0)) {
    body = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          console.error("Body parse error:", e);
          resolve({});
        }
      });
    });
  }

  // 2. Route: Save Conversion (POST /api/save-conversion)
  // We use .includes to ensure the route is caught correctly by Vercel
  if (req.url.includes("/api/save-conversion") && req.method === "POST") {
    const { from, to, amount } = body || {};

    if (!from || !to || !amount) {
      return res.status(400).json({ error: "Missing required fields: from, to, or amount" });
    }

    // Validate amount is a number
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount provided" });
    }

    try {
      // Fetch rate from Frankfurter API
      const apiUrl = `https://api.frankfurter.app/latest?amount=${numAmount}&from=${from}&to=${to}`;
      console.log("Fetching from:", apiUrl);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      console.log("API Response:", JSON.stringify(data));
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch exchange rate");
      }
      
      if (!data.rates || !data.rates[to]) {
        throw new Error("Invalid response from exchange rate API");
      }

      const result = data.rates[to];

      // Try to save to Supabase (but don't fail the conversion if it doesn't work)
      let dbMessage = "Saved to database";
      try {
        const { error } = await supabase
          .from("conversion_history")
          .insert([{ 
            from_currency: from, 
            to_currency: to, 
            amount: parseFloat(amount), 
            result: parseFloat(result) 
          }]);

        if (error) {
          console.error("Supabase insert error:", error.message);
          dbMessage = "Conversion successful (database save skipped)";
        }
      } catch (dbErr) {
        console.error("Database error:", dbErr.message);
        dbMessage = "Conversion successful (database unavailable)";
      }

      return res.status(200).json({ result, message: dbMessage });
    } catch (err) {
      console.error("Save Conversion Error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // 3. Route: Fetch History (GET /api/history)
  if (req.url.includes("/api/history") && req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("conversion_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      console.error("Fetch History Error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // 4. Default 404 for any other request
  return res.status(404).json({ error: "API Route Not Found" });
}
