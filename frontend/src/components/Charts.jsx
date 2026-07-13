import { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale, PointElement, LineElement, Filler);

const chartDefaults = {
  plugins: {
    legend: {
      labels: { color: '#8899aa', font: { family: 'Inter', size: 12 }, padding: 16 }
    },
    tooltip: {
      backgroundColor: 'rgba(6,20,36,0.95)',
      borderColor: 'rgba(0,212,255,0.3)',
      borderWidth: 1,
      titleColor: '#f0f6ff',
      bodyColor: '#8899aa',
      padding: 12,
      cornerRadius: 8
    }
  }
};

export function RiskDonutChart({ overallRiskScore, riskBreakdown }) {
  const total = (riskBreakdown?.high || 0) + (riskBreakdown?.medium || 0) + (riskBreakdown?.low || 0);
  const safe = Math.max(0, 100 - overallRiskScore);

  const data = {
    labels: ['Risk Score', 'Safe Range'],
    datasets: [{
      data: [overallRiskScore, safe],
      backgroundColor: [
        overallRiskScore >= 70 ? 'rgba(255,68,68,0.85)' : overallRiskScore >= 45 ? 'rgba(255,152,0,0.85)' : 'rgba(0,230,118,0.85)',
        'rgba(255,255,255,0.05)'
      ],
      borderColor: [
        overallRiskScore >= 70 ? '#ff4444' : overallRiskScore >= 45 ? '#ff9800' : '#00e676',
        'rgba(255,255,255,0.08)'
      ],
      borderWidth: 2,
      hoverOffset: 6
    }]
  };

  const options = {
    ...chartDefaults,
    cutout: '75%',
    responsive: true,
    plugins: {
      ...chartDefaults.plugins,
      legend: { display: false }
    }
  };

  const scoreColor = overallRiskScore >= 70 ? '#ff6b6b' : overallRiskScore >= 45 ? '#ffb74d' : '#69f0ae';
  const label = overallRiskScore >= 70 ? 'High Risk' : overallRiskScore >= 45 ? 'Moderate' : 'Low Risk';

  return (
    <div style={{ position: 'relative', width: '220px', margin: '0 auto' }}>
      <Doughnut data={data} options={options} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', pointerEvents: 'none'
      }}>
        <div style={{ fontSize: '2.2rem', fontWeight: 900, color: scoreColor, fontFamily: 'Space Grotesk' }}>
          {overallRiskScore}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export function DiseaseRiskBarChart({ diseaseRisks }) {
  if (!diseaseRisks || diseaseRisks.length === 0) return null;

  const top = diseaseRisks.slice(0, 10);

  const getColor = (score) => {
    if (score >= 70) return 'rgba(255,68,68,0.8)';
    if (score >= 45) return 'rgba(255,152,0,0.8)';
    return 'rgba(0,230,118,0.8)';
  };

  const data = {
    labels: top.map(d => d.disease.length > 20 ? d.disease.substring(0, 18) + '…' : d.disease),
    datasets: [{
      label: 'Risk Score',
      data: top.map(d => d.score),
      backgroundColor: top.map(d => getColor(d.score)),
      borderColor: top.map(d => getColor(d.score).replace('0.8)', '1)')),
      borderWidth: 1.5,
      borderRadius: 6,
      borderSkipped: false
    }]
  };

  const options = {
    ...chartDefaults,
    indexAxis: 'y',
    responsive: true,
    scales: {
      x: {
        min: 0, max: 100,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#4a5568', font: { size: 11 } },
        border: { color: 'rgba(255,255,255,0.06)' }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#8899aa', font: { size: 11 } },
        border: { display: false }
      }
    },
    plugins: {
      ...chartDefaults.plugins,
      legend: { display: false },
      tooltip: {
        ...chartDefaults.plugins.tooltip,
        callbacks: {
          label: (ctx) => ` Risk Score: ${ctx.raw}/100`
        }
      }
    }
  };

  return <Bar data={data} options={options} />;
}

export function RiskBreakdownChart({ riskBreakdown }) {
  const { high = 0, medium = 0, low = 0 } = riskBreakdown || {};
  const total = high + medium + low;
  if (total === 0) return null;

  const data = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [{
      data: [high, medium, low],
      backgroundColor: ['rgba(255,68,68,0.75)', 'rgba(255,152,0,0.75)', 'rgba(0,230,118,0.75)'],
      borderColor: ['#ff4444', '#ff9800', '#00e676'],
      borderWidth: 2,
      hoverOffset: 8
    }]
  };

  const options = {
    ...chartDefaults,
    responsive: true,
    cutout: '60%',
    plugins: {
      ...chartDefaults.plugins,
      legend: {
        position: 'bottom',
        labels: { color: '#8899aa', font: { family: 'Inter', size: 11 }, padding: 12 }
      }
    }
  };

  return <Doughnut data={data} options={options} />;
}
