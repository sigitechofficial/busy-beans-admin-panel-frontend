import { Doughnut } from "react-chartjs-2";
import Chart from "chart.js/auto";

export default function DoughnutChart({ dashboardDoughnutChartData }) {
  const updatedData = {
    labels: dashboardDoughnutChartData?.labels,
    datasets: [
      {
        data: dashboardDoughnutChartData?.datasets[0]?.data,
        backgroundColor: ["#4A3AFF", "#962DFF", "#BBA3FE"],
      }, 
    ],
  }; 

  const totalSubscriptions = dashboardDoughnutChartData?.datasets[0]?.data?.reduce(
      (total, num) => total + Math.round(num)
    );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: true,
      position: "right",
    },
    plugins: {
      annotation: {
        annotations: [
          {
            type: "text",
            text: `£{totalSubscriptions} Subscriptions`,
            fontColor: "rgba(0, 0, 0, 0.7)",
            fontSize: 16,
            position: "center",
          },
        ],
      },
    },
  };

  return (
    <div className="py-3 md:h-40 lg:h-60 xl:h-72 md:w-44 lg:w-52 flex items-center justify-center">
      <Doughnut data={updatedData} options={options} />
    </div>
  );
}
