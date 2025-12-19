// Load environment variables from the .env file
// import dotenv from "dotenv";
// dotenv.config();

// Import required packages
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import supabase from "./supabaseClient.js";

// Create the Express app
const app = express();

// Enable CORS so the frontend can talk to the backend
app.use(cors());

// Allow the server to accept JSON request bodies
app.use(express.json());


// Define the port number 
const PORT = process.env.PORT || 3001;

// Route to convert currency and save it to the database
app.post("/api/save-conversion", async (req, res) => {
  // Get conversion details from the request body
  const { from, to, amount } = req.body;

  try {
    // Call the external currency conversion API
    const response = await fetch(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`
    );

    // Parse the API response
    const data = await response.json();
    const result = data.rates[to];

    // Save the conversion data to the Supabase database
    const { error } = await supabase
      .from("conversion_history")
      .insert([
        {
          from_currency: from,
          to_currency: to,
          amount,
          result
        }
      ]);

    // Throw an error if the database insert fails
    if (error) throw error;

    // Send the conversion result back to the frontend
    res.json({ result, message: "Saved to database" });
  } catch (err) {
    // Handle errors from the API or database
    res.status(500).json({ error: err.message });
  }
});

// Route to fetch all past conversion history
app.get("/api/history", async (req, res) => {
  // Query the database for conversion history
  const { data, error } = await supabase
    .from("conversion_history")
    .select("*")
    .order("created_at", { ascending: false });

  // Handle database errors
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Send history data back to the frontend
  res.json(data);
});

// Start the server and listen for requests
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. SERVE STATIC FILES 
// This tells Express to look in the root folder for style.css, main.js 
app.use(express.static(__dirname));

// 2. DEFINE PAGE ROUTES 
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/help', (req, res) => {
  res.sendFile(path.join(__dirname, 'help.html'));
});

app.get('/action', (req, res) => {
  res.sendFile(path.join(__dirname, 'action.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
