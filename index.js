
const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
require('dotenv').config(); // Simplifies loading variables

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase ONLY if variables exist
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERROR: Supabase Environment Variables are missing!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// HTML Routes
app.get('/', (req, res) => res.sendFile('public/index.html', { root: __dirname }));
app.get('/about', (req, res) => res.sendFile('public/about.html', { root: __dirname }));
app.get('/help', (req, res) => res.sendFile('public/help.html', { root: __dirname }));
app.get('/action', (req, res) => res.sendFile('public/action.html', { root: __dirname }));

// API: Save Conversion
app.post('/api/save-conversion', async (req, res) => {
  const { from, to, amount } = req.body;
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
    const data = await response.json();
    const result = data.rates[to];

    const { error } = await supabase
      .from('conversion_history')
      .insert([{ from_currency: from, to_currency: to, amount: parseFloat(amount), result: parseFloat(result) }]);

    if (error) throw error;
    res.json({ result, message: "Saved to database" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Fetch History
app.get('/api/history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('conversion_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
