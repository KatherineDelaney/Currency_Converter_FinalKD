// Get references to HTML elements
const amountInput = document.getElementById("amount");
const fromCurrencySelect = document.getElementById("fromCurrency");
const toCurrencySelect = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const resultEl = document.getElementById("result");
const chartCanvas = document.getElementById("conversionChart");
const historyList = document.getElementById("historyList"); // Added for action.html

// Variables to store the chart and conversion history
let chart;
let history = [];

/**
 * Fetch conversion history from the backend
 */
async function fetchHistory() {
  try {
    // Request conversion history from the server -- port 3001 is correct I checked 
    const res = await fetch("http://localhost:3001/api/history");
    
    if (!res.ok) throw new Error("Failed to fetch history");

    // Convert response to JSON and store it
    history = await res.json();
    
    // Update the UI components
    updateChart();
    renderHistoryList();
  } catch (err) {
    console.error("History Fetch Error:", err);
  }
}

/**
 * Save a new conversion to the backend
 */
async function saveConversion(from, to, amount) {
  try {
    resultEl.textContent = "Converting...";

    // Send conversion data to the server
    const res = await fetch("http://localhost:3001/api/save-conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, amount })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Server error");
    }

    // Display the conversion result on the page
    resultEl.textContent = `${amount} ${from} = ${data.result.toFixed(2)} ${to}`;

    // Refresh the conversion history and chart
    await fetchHistory();
  } catch (err) {
    console.error("Conversion Error:", err);
    resultEl.textContent = `Error: ${err.message}`;
  }
}

/**
 * Updates the text-based history list on action.html
 */
function renderHistoryList() {
  if (!historyList) return;

  historyList.innerHTML = history.map(item => `
    <div class="history-item" style="padding: 10px; border-bottom: 1px solid #eee;">
      <strong>${new Date(item.created_at).toLocaleString()}</strong>: 
      ${item.amount} ${item.from_currency} ⮕ ${item.result} ${item.to_currency}
    </div>
  `).join('');
}

/**
 * Update the Chart.js graph
 */
function updateChart() {
  if (!chartCanvas || history.length === 0) return;

  const labels = history.slice(0, 10).reverse().map(item => 
    new Date(item.created_at).toLocaleTimeString()
  );

  const values = history.slice(0, 10).reverse().map(item => item.result);

  if (chart) chart.destroy();

  chart = new Chart(chartCanvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Recent Conversion Trends",
        data: values,
        borderColor: "#2c7be5",
        backgroundColor: "rgba(44,123,229,0.2)",
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: false } }
    }
  });
}

/**
 * Event listener for the Convert button
 */
if (convertBtn) {
  convertBtn.addEventListener("click", () => {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrencySelect.value;
    const to = toCurrencySelect.value;

    // Validation: Check for valid number
    if (isNaN(amount) || amount <= 0) {
      resultEl.textContent = "Please enter a valid amount.";
      return;
    }

    // Validation: Prevent same-currency conversion (Frankfurter API requirement)
    if (from === to) {
      resultEl.textContent = "Please select two different currencies.";
      return;
    }

    saveConversion(from, to, amount);
  });
}

// Run when the page finishes loading
document.addEventListener("DOMContentLoaded", () => {
  fetchHistory();
});
