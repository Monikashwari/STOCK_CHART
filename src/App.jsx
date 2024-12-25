import React, { useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js'; // Register all required components
import Papa from 'papaparse';
import './App.css';

// Register all controllers, elements, scales, and plugins for Chart.js
Chart.register(...registerables);

const App = () => {
  const [companies, setCompanies] = useState([]);
  const [rows, setRows] = useState([]);
  const [chart, setChart] = useState(null);

  // Fetch and parse the CSV file
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/shaktids/stock_app_test/refs/heads/main/dump.csv')
      .then((response) => response.text())
      .then((data) => {
        Papa.parse(data, {
          header: true,
          complete: (result) => {
            const rows = result.data;
            setRows(rows);
            // Set a list of unique company names
            setCompanies([...new Set(rows.map((row) => row.index_name))]);
          },
        });
      });
  }, []);

  // Function to update the chart when a company is clicked
  const displayChart = (companyName) => {
    const filteredRows = rows.filter((row) => row.index_name === companyName);
    const labels = filteredRows.map((row) => row.index_date); // Dates as x-axis labels
    const turnoverData = filteredRows.map((row) => parseFloat(row.turnover_rs_cr)); // Turnover values as data

    // Ensure that data is not empty
    if (turnoverData.length === 0) {
      console.error('Turnover data is missing for the selected company.');
      return;
    }

    const chartData = {
      labels,
      datasets: [
        {
          label: `Turnover (in Rs Cr) for ${companyName}`,
          data: turnoverData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 1,
        },
      ],
    };

    // If a chart already exists, destroy it before creating a new one
    if (chart) {
      chart.destroy();
    }

    // Create a new chart
    const ctx = document.getElementById('chart').getContext('2d');
    const newChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
          },
        },
      },
    });

    // Store the chart instance for future destruction
    setChart(newChart);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <h2>Companies</h2>
        <div className="company-list">
          {companies.map((company, index) => (
            <div
              key={index}
              className="company"
              onClick={() => displayChart(company)}
            >
              {company}
            </div>
          ))}
        </div>
      </div>
      <div className="main">
        <h2>Company Turnover Chart</h2>
        <canvas id="chart" width="800" height="400"></canvas>
      </div>
    </div>
  );
};

export default App;
