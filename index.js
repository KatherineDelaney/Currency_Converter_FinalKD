const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const path = require('path'); // Add this for reliable paths
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(bodyParser.json());

// FORCE Express to look in the public folder for static files first
app.use(express.static(path.join(__dirname, 'public')));

// HTML Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/help', (req, res) => res.sendFile(path.join(__dirname, 'public', 'help.html')));
app.get('/action', (req, res) => res.sendFile(path.join(__dirname, 'public', 'action.html')));

// API Routes
app.get('/api/history', async (req, res) => {
  try {
    const { data, error } = await supabase.from('conversion_history').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/save-conversion', async (req, res) => {
  const { from, to, amount } = req.body;
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
    const data = await response.json();
    const result = data.rates[to];
    const { error } = await supabase.from('conversion_history').insert([{ from_currency: from, to_currency: to, amount, result }]);
    if (error) throw error;
    res.json({ result, message: "Saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
module.exports = app;
