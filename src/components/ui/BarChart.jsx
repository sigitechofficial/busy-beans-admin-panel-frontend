import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

export default function BarChart({ dashboardBarChartData }) {
  const UpdatedData = {
    labels: dashboardBarChartData?.labels, 
    datasets:
      dashboardBarChartData?.datasets.length < 3
        ? [
            {
              label: "Revenue(£)",
              backgroundColor: "#0000FF",
              borderColor: "rgba(0,0,0,1)",
              borderWidth: 0,
              data: dashboardBarChartData?.datasets[0]?.data,
              borderRadius: 5,
            },
          ]
        : [
            {
              label: "Revenue A (£)",
              backgroundColor: "#33C600",
              borderColor: "rgba(0,0,0,1)",
              borderWidth: 0,
              data: dashboardBarChartData?.datasets[0]?.data, // First dataset
              borderRadius: 5,
            },
            {
              label: "Revenue B (£)",
              backgroundColor: "#6C5DD3",
              borderColor: "rgba(0,0,0,1)",
              borderWidth: 0,
              data: dashboardBarChartData?.datasets[1]?.data, // Second dataset
              borderRadius: 5,
            },
            {
              label: "Revenue C (£)",
              backgroundColor: "#E9C607",
              borderColor: "rgba(0,0,0,1)",
              borderWidth: 0,
              data: dashboardBarChartData?.datasets[2]?.data, // Third dataset
              borderRadius: 5,
            },
            {
              label: "Revenue C (£)",
              backgroundColor: "#FF4CE2",
              borderColor: "rgba(0,0,0,1)",
              borderWidth: 0,
              data: dashboardBarChartData?.datasets[2]?.data, // Fourth dataset
              borderRadius: 5,
            },
          ],
  };
  return (
    <div className="px-3 py-3">
      <Bar
        data={UpdatedData}
        options={{
          scales: {
            x: {
              type: "category",
              title: {
                display: true,
                text: "Month",
              },
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Revenue(£)",
              },
              grid: {
                display: false,
              },
            },
          },
          // plugins: {
          //     legend: {
          //         display: true,
          //         position: 'right',
          //     },
          // },
          responsive: true,
        }}
      />
    </div>
  );
}
