"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { DailyStat } from "@/lib/analytics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

export default function StatChart({ data }: { data: DailyStat[] }) {
  const labels = data.map((d) => {
    // "2026-06-21" -> "21 Jun"
    const parts = d.date.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]}`;
  });

  return (
    <div className="h-72">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Total Kunjungan",
              data: data.map((d) => d.total),
              borderColor: "rgb(37, 99, 235)",
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              tension: 0.3,
              fill: true,
            },
            {
              label: "Pengunjung Unik",
              data: data.map((d) => d.unique),
              borderColor: "rgb(14, 165, 233)",
              backgroundColor: "rgba(14, 165, 233, 0.1)",
              tension: 0.3,
              fill: true,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 12 } } },
            tooltip: { backgroundColor: "rgba(17, 24, 39, 0.95)" },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
              grid: { color: "rgba(0,0,0,0.05)" },
            },
            x: {
              grid: { display: false },
              ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
            },
          },
        }}
      />
    </div>
  );
}
