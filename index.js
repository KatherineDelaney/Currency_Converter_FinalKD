const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

const app = express();
const port = process.env.PORT || 3000;
dotenv.config();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(bodyParser.json());
// Serve static files from the 'public' directory (style.css, main.js)
app.use(express.static(__dirname + '/public'));

// Routes to serve HTML pages from the public folder
app.get('/', (req, res) => res.sendFile('public/index.html', { root: __dirname }));
app.get('/about', (req, res) => res.sendFile('public/about.html', { root: __dirname }));
app.get('/help', (req, res) => res.sendFile('public/help.html', { root: __dirname }));
app.get('/action', (req, res) => res.sendFile('public/action.html', { root: __dirname }));

// API Route: Save Conversion
app.post('/api/save-conversion', async (req, res) => {
  const { from, to, amount } = req.body;
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
    const data = await response.json();
    const result = data.rates[to];

    const { error } = await supabase
      .from('conversion_history')
      .insert([{ from_currency: from, to_currency: to, amount, result }]);

    if (error) throw error;
    res.json({ result, message: "Saved to database" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Route: Fetch History
app.get('/api/history', async (req, res) => {
  const { data, error } = await supabase
    .from('conversion_history')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.listen(port, () => console.log('App is available on port:', port));
