import fetch from "node-fetch";
import supabase from "./supabaseClient.js";

export default async function handler(req, res) {
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

      res.status(200).json({ result, message: "Saved to database" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.url === "/api/history" && req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("conversion_history")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(404).json({ error: "Not Found" });
}
