// Get references to HTML elements
const amountInput = document.getElementById("amount");
const fromCurrencySelect = document.getElementById("fromCurrency");
const toCurrencySelect = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const resultEl = document.getElementById("result");
const chartCanvas = document.getElementById("conversionChart");

// Variables to store the chart and conversion history
let chart;
let history = [];

// Fetch conversion history from the backend
async function fetchHistory() {
  try {
    // Request conversion history from the server
    const res = await fetch("http://localhost:3001/api/history");
    
    // Convert response to JSON and store it
    history = await res.json();
    
    // Update the chart with the new history data
    updateChart();
  } catch (err) {
    // Log any errors if the request fails
    console.error(err);
  }
}

// Save a new conversion to the backend
async function saveConversion(from, to, amount) {
  try {
    // Send conversion data to the server
    const res = await fetch("http://localhost:3001/api/save-conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, amount })
    });

    // Parse the server response
    const data = await res.json();

    // Display the conversion result on the page
    resultEl.textContent = `${amount} ${from} to ${to} = ${data.result} ${to}`;

    // Refresh the conversion history and chart
    await fetchHistory();
  } catch (err) {
    // Handle errors during conversion
    console.error(err);
    resultEl.textContent = "Error performing conversion.";
  }
}

// Update the Chart.js graph with conversion history data
function updateChart() {
  // Exit if the chart canvas does not exist on the page
  if (!chartCanvas) return;

  // Create labels using the date and time of each conversion
  const labels = history.map(item =>
    new Date(item.created_at).toLocaleString()
  );

  // Get the conversion result values
  const values = history.map(item => item.result);

  // Remove the old chart before creating a new one
  if (chart) chart.destroy();

  // Create a new line chart
  chart = new Chart(chartCanvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Conversion Results",
        data: values,
        borderColor: "#2c7be5",
        backgroundColor: "rgba(44,123,229,0.2)",
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      // Make the chart responsive
      responsive: true,

      // Start the y-axis at zero
      scales: {
        y: { beginAtZero: true }
      },

      // Add a smooth animation when the chart loads
      animation: { duration: 1000 }
    }
  });
}

// Event listener for the Convert button
convertBtn.addEventListener("click", () => {
  // Get user input values
  const amount = parseFloat(amountInput.value);
  const from = fromCurrencySelect.value;
  const to = toCurrencySelect.value;

  // Validate the amount before converting
  if (!amount || amount <= 0) {
    resultEl.textContent = "Please enter a valid amount.";
    return;
  }

  // Save and convert the currency
  saveConversion(from, to, amount);
});

// Run when the page finishes loading
document.addEventListener("DOMContentLoaded", () => {
  // Load conversion history on page load
  fetchHistory();
});
