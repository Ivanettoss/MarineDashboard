
let chartInstance = null;

export function updateChart(canvasId, data) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  const labels = data.map(r => r.timestamp);
  const temperatures = data.map(r => r.temp);
  const salinities = data.map(r => r.salinity);
  const depths = data.map(r => r.depth);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temperatures,
          borderColor: "dodgerblue",
          tension: 0.2,
        },
        {
          label: "Salinity (PSU)",
          data: salinities,
          borderColor: "skyblue",
          tension: 0.2,
        },
        {
          label: "Depth (m)",
          data: depths,
          borderColor: "steelblue",
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}
