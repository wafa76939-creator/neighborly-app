const charts = [];

export const destroyCharts = () => {
  charts.splice(0).forEach((chart) => chart.destroy());
};

const baseOptions = {
  plugins: { legend: { display: false } },
  maintainAspectRatio: false,
};

export const lineChart = (canvas, labels, values, threshold = 5) => {
  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Reports',
          data: values,
          borderColor: '#0f6e67',
          backgroundColor: 'rgba(15,110,103,.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
        {
          label: 'Hotspot threshold',
          data: labels.map(() => threshold),
          borderColor: '#b42318',
          borderDash: [6, 6],
          pointRadius: 0,
        },
      ],
    },
    options: {
      ...baseOptions,
      plugins: { legend: { display: true, labels: { boxWidth: 10 } } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });
  charts.push(chart);
  return chart;
};

export const doughnutChart = (canvas, breakdown) => {
  const chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: breakdown.map((i) => i.category),
      datasets: [{
        data: breakdown.map((i) => i.count),
        backgroundColor: ['#7c3aed', '#d97706', '#0284c7', '#b42318', '#0f6e67', '#57534e'],
      }],
    },
    options: { plugins: { legend: { position: 'bottom' } }, cutout: '62%' },
  });
  charts.push(chart);
  return chart;
};
