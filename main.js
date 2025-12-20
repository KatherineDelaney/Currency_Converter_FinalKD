// HTML elements
const amountInput = document.getElementById("amount");
const fromCurrencySelect = document.getElementById("fromCurrency");
const toCurrencySelect = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const resultEl = document.getElementById("result");
const chartCanvas = document.getElementById("conversionChart");
const historyList = document.getElementById("historyList");

let chart;
let history = [];

// --- Fetch conversion history ---
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

// --- Save conversion ---
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
  } catch (err) {
    console.error("Conversion Error:", err);
    resultEl.textContent = `Error: ${err.message}`;
  }
}

// --- Render history list ---
function renderHistoryList() {
  if (!historyList) return;
  historyList.innerHTML = history.map(item => `
    <div class="history-item" style="padding: 10px; border-bottom: 1px solid #eee;">
      <strong>${dayjs(item.created_at).format("MMM D, YYYY h:mm A")}</strong>: 
      ${item.amount} ${item.from_currency} ⮕ ${item.result} ${item.to_currency}
    </div>
  `).join('');
}

// --- Update chart ---
function updateChart() {
  if (!chartCanvas || history.length === 0) return;

  const labels = history.slice(0, 10).reverse().map(item => dayjs(item.created_at).format("h:mm:ss A"));
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

// --- Load currencies from Frankfurter API ---
async function loadCurrencies() {
  try {
    const res = await fetch("https://api.frankfurter.app/currencies");
    const currencies = await res.json();

    fromCurrencySelect.innerHTML = "";
    toCurrencySelect.innerHTML = "";

    for (const code in currencies) {
      const option1 = document.createElement("option");
      option1.value = code;
      option1.textContent = code;

      const option2 = option1.cloneNode(true);

      fromCurrencySelect.appendChild(option1);
      toCurrencySelect.appendChild(option2);
    }
  } catch (err) {
    console.error("Currency Load Error:", err);
  }
}

// --- Convert button ---
if (convertBtn) {
  convertBtn.addEventListener("click", () => {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrencySelect.value;
    const to = toCurrencySelect.value;

    if (isNaN(amount) || amount <= 0) {
      resultEl.textContent = "Please enter a valid amount.";
      return;
    }

    if (from === to) {
      resultEl.textContent = "Please select two different currencies.";
      return;
    }

    saveConversion(from, to, amount);
  });
}

// --- Initialize page ---
document.addEventListener("DOMContentLoaded", () => {
  loadCurrencies();   // ✅ Fetch #1
  fetchHistory();     // ✅ Fetch #2
});
