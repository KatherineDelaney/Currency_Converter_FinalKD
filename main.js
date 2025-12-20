const amountInput = document.getElementById("amount");
const fromCurrencySelect = document.getElementById("fromCurrency");
const toCurrencySelect = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const resultEl = document.getElementById("result");
const chartCanvas = document.getElementById("conversionChart");
const historyList = document.getElementById("historyList");
const ratesContainer = document.getElementById("ratesContainer");

let chart;
let history = [];

// Fetch conversion history
async function fetchHistory() {
  try {
    const res = await fetch("/api/history");
    if (!res.ok) throw new Error("Failed to fetch history");
    history = await res.json();
    updateChart();
    renderHistoryList();
  } catch (err) {
    console.error("History Fetch Error:", err);
  }
}

// Save conversion
async function saveConversion(from, to, amount) {
  try {
    resultEl.textContent = "Converting...";

    const res = await fetch("/api/save-conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, amount })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Server error");

    resultEl.textContent = `${amount} ${from} = ${data.result.toFixed(2)} ${to}`;

    await fetchHistory();
    fetchExchangeRates(from); // Update rates table after conversion
  } catch (err) {
    console.error("Conversion Error:", err);
    resultEl.textContent = `Error: ${err.message}`;
  }
}

// Render history list
function renderHistoryList() {
  if (!historyList) return;
  historyList.innerHTML = history.map(item => `
    <div class="history-item" style="padding: 10px; border-bottom: 1px solid #eee;">
      <strong>${new Date(item.created_at).toLocaleString()}</strong>: 
      ${item.amount} ${item.from_currency} ⮕ ${item.result} ${item.to_currency}
    </div>
  `).join('');
}

// Update Chart.js chart
function updateChart() {
  if (!chartCanvas || history.length === 0) return;

  const labels = history.slice(0, 10).reverse().map(item => new Date(item.created_at).toLocaleTimeString());
  const values = history.slice(0, 10).reverse().map(item => item.result);

  if (chart) chart.destroy();

  chart = new Chart(chartCanvas.getContext("2d"), {
    type: "line",
    data: { labels, datasets: [{ label: "Recent Conversion Trends", data: values, borderColor: "#2c7be5", backgroundColor: "rgba(44,123,229,0.2)", fill: true, tension: 0.4 }] },
    options: { responsive: true, scales: { y: { beginAtZero: false } } }
  });
}

// Fetch multiple exchange rates (3rd fetch)
async function fetchExchangeRates(base = "USD") {
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
    if (!res.ok) throw new Error("Failed to fetch exchange rates");
    const data = await res.json();

    if (!ratesContainer) return;
    let html = `<h3>Current Rates (Base: ${base})</h3><table><tr><th>Currency</th><th>Rate</th></tr>`;
    for (const [currency, rate] of Object.entries(data.rates)) {
      html += `<tr><td>${currency}</td><td>${rate.toFixed(4)}</td></tr>`;
    }
    html += `</table>`;
    ratesContainer.innerHTML = html;
    ratesContainer.classList.add("animate__animated", "animate__fadeIn");
  } catch (err) {
    console.error("Exchange Rates Fetch Error:", err);
  }
}

// Convert button event
if (convertBtn) {
  convertBtn.addEventListener("click", () => {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrencySelect.value;
    const to = toCurrencySelect.value;

    if (isNaN(amount) || amount <= 0) { resultEl.textContent = "Please enter a valid amount."; return; }
    if (from === to) { resultEl.textContent = "Please select two different currencies."; return; }

    saveConversion(from, to, amount);
  });
}

// Load on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchHistory();
  fetchExchangeRates();
});
