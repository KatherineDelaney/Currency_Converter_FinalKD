import fetch from "node-fetch";
import supabase from "./supabaseClient.js";

export default async function handler(req, res) {
  // 1. Parse the incoming request body (Crucial for Vercel POST requests)
  if (req.method === 'POST' && !req.body) {
    req.body = await new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({});
        }
      });
    });
  }

  // 2. Route: Save Conversion (POST /api/save-conversion)
  // We use .includes to ensure the route is caught correctly by Vercel
  if (req.url.includes("/api/save-conversion") && req.method === "POST") {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({ error: "Missing required fields: from, to, or amount" });
    }

    try {
      // Fetch rate from Frankfurter API
      const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
      const data = await response.json();
      
      if (!data.rates || !data.rates[to]) {
        throw new Error("Invalid response from exchange rate API");
      }

      const result = data.rates[to];

      // Save to Supabase
      const { error } = await supabase
        .from("conversion_history")
        .insert([{ 
          from_currency: from, 
          to_currency: to, 
          amount: parseFloat(amount), 
          result: parseFloat(result) 
        }]);

      if (error) throw error;

      return res.status(200).json({ result, message: "Saved to database" });
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
