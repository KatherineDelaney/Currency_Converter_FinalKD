import fetch from "node-fetch";
import supabase from "./supabaseClient.js";

export default async function handler(req, res) {
  // 1. BODY PARSER: This allows the server to read the 'amount' and 'currency' you sent
  if (req.method === 'POST' && !req.body) {
    req.body = await new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({});
        }
      });
    });
  }

  // 2. ROUTE: Save Conversion
  if (req.url === "/api/save-conversion" && req.method === "POST") {
    const { from, to, amount } = req.body;
    try {
      const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
      const data = await response.json();
      const result = data.rates[to];

      const { error } = await supabase
        .from("conversion_history")
        .insert([{ from_currency: from, to_currency: to, amount, result }]);
      
      if (error) throw error;

      return res.status(200).json({ result, message: "Saved to database" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 3. ROUTE: Fetch History
  if (req.url === "/api/history" && req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("conversion_history")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 4. FALLBACK: 404 for any other request
  return res.status(404).json({ error: "Not Found" });
}
