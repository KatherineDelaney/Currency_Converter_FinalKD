const amountInput = document.getElementById("amount");
const fromCurrencySelect = document.getElementById("fromCurrency");
const toCurrencySelect = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const resultEl = document.getElementById("resultDisplay");
const chartCanvas = document.getElementById("conversionChart");
const historyList = document.getElementById("historyList");
const ratesContainer = document.getElementById("ratesContainer");

let chart;
let history = [];

async function fetchHistory() {
  try {
    const res = await fetch("/api/history");
    if (!res.ok) throw new Error("Failed to fetch history");
    history = await res.json();
    
    if (chartCanvas) updateChart();
    if (historyList) renderHistoryList();
  } catch (err) {
    console.error("History Fetch Error:", err);
  }
}

async function saveConversion(from, to, amount) {
  try {
    if (resultEl) resultEl.textContent = "Converting...";

    const res = await fetch("/api/save-conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, amount })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Server error");

    if (resultEl) {
      resultEl.textContent = `${amount} ${from} = ${data.result.toFixed(2)} ${to}`;
    }

    fetchHistory();
    if (ratesContainer) fetchExchangeRates(from); 
  } catch (err) {
    console.error("Conversion Error:", err);
    if (resultEl) resultEl.textContent = `Error: ${err.message}`;
  }
}

function renderHistoryList() {
  if (!historyList) return;
  historyList.innerHTML = history.map(item => `
    <div class="history-item" style="padding: 15px; border-bottom: 1px solid #edf2f7; display: flex; justify-content: space-between;">
      <span><strong>${new Date(item.created_at).toLocaleDateString()}</strong></span> 
      <span>${item.amount} ${item.from_currency} ⮕ ${item.result.toFixed(2)} ${item.to_currency}</span>
    </div>
  `).join('');
}

function updateChart() {
  if (!chartCanvas || history.length === 0) return;
  const lastTen = history.slice(0, 10).reverse();
  const labels = lastTen.map(item => new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
  const values = lastTen.map(item => item.result);

  if (chart) chart.destroy();
  chart = new Chart(chartCanvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Conversion Trends",
        data: values,
        borderColor: "#2c7be5",
        backgroundColor: "rgba(44,123,229,0.1)",
        fill: true,
        tension: 0.3
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

async function fetchExchangeRates(base = "USD") {
  if (!ratesContainer) return;
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
    const data = await res.json();
    let html = `<h3>Rates (Base: ${base})</h3><table><tr><th>Currency</th><th>Rate</th></tr>`;
    for (const [currency, rate] of Object.entries(data.rates).slice(0, 8)) {
      html += `<tr><td>${currency}</td><td>${rate.toFixed(4)}</td></tr>`;
    }
    html += `</table>`;
    ratesContainer.innerHTML = html;
  } catch (err) { console.error(err); }
}

if (convertBtn) {
  convertBtn.addEventListener("click", () => {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrencySelect.value;
    const to = toCurrencySelect.value;
    if (isNaN(amount) || amount <= 0) {
      if (resultEl) resultEl.textContent = "Please enter a valid amount.";
      return;
    }
    saveConversion(from, to, amount);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchHistory();
  if (ratesContainer) fetchExchangeRates();
});
