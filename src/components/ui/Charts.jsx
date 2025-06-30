

// import GetAPI from "../../utilities/GetAPI";
// import Select from "react-select";
// import selectStyles from "../../utilities/SelectStyle";

import BarChart from "./BarChart";
import DoughnutChart from "./DoughnutChart";

// export default function Charts({ today }) {
export default function Charts() {
  //   const options = [];
  //   for (let index = 0; index < 20; index++) {
  //     options.push({
  //       value: `${+today?.$y - index}`,
  //       label: `${today?.$y - index}`,
  //     });
  //   }
  //   const [year, setYear] = useState({
  //     value: `${today?.$y}`,
  //     label: `${today?.$y}`,
  //   });

  //   const { data } = GetAPI(
  //     year?.value
  //     ? `admin/dashboard-charts?year=${year?.value}`
  //     : "admin/dashboard-charts",
  //     "dashboard"
  //   );

  //   const TotalRevenue =
  //     data?.data?.dashboardBarChartData?.datasets[0]?.data?.reduce(
  //       (total, num) => total + num
  //     );

  //   const handleChange = (year) => {
  //     setYear(year);
  //   };

  return (
    <main className="grid grid-cols-1 lg:grid-cols-5 lg:gap-10 max-lg:gap-4 pb-4 [&>div]:rounded-2xl [&>div]:shadow-lg [&>div]:ring-1 [&>div]:ring-gray-100">
      {/* Bar Chart Start */}
      <div className="lg:col-span-3 bg-white">
        <div className="font-bold border-b-[1px] px-3 h-16 flex justify-between items-center">
          <p className="text-2xl font-inter">Top Selling Items</p>

          {/* <div className="w-40">
            <Select
              styles={selectStyles}
              defaultValue={{ value: `${today?.$y}`, label: `${today?.$y}` }}
              placeholder="Select Year"
              value={year ? year : null}
              onChange={(val) => handleChange(val)}
              options={options ? options : null}
            />
          </div> */}
        </div>
        <p className="font-bold text-3xl px-3 py-2">
          112340
          {/* {data?.data?.currencyUnit}{TotalRevenue?.toFixed(2)} */}
        </p>
        <BarChart
          dashboardBarChartData={{
            labels: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            datasets: [
              {
                data: [
                  6928.25, 897.14, 360, 175, 878.4, 1079.31, 370.25, 9352.55,
                  6533.02, 750.63, 813.47, 791.01,
                ],
              },
            ],
          }}
        />
      </div>

      {/* Doughnut Chart Start */}
      <div className="lg:col-span-2 bg-white">
        <div className="border-b-[1px] h-16 px-3 flex flex-col justify-center">
          <p className="font-bold font-inter text-2xl">Payments</p>
          {/* <p className="text-sm text-gray-600">
            Customers that buy our Subscriptions
          </p> */}
        </div>
        <div className="max-h-[410px] h-full md:w-full flex items-start xl:items-center justify-center">
          {/* chart display start */}
          <DoughnutChart
            dashboardDoughnutChartData={{
              labels: ["Daily Registered", "Weekly new Registered"],
              datasets: [
                {
                  data: [113, 188],
                },
              ],
            }}
          />
          {/* chart display end */}
        </div>
      </div>

      {/* Double Bar Chart Start */}
      <div className="lg:col-span-3 bg-white">
        <div className="font-bold border-b-[1px] px-3 h-16 flex justify-between items-center">
          <p className="text-2xl font-inter">Countries and their Cities</p>
          {/* <div className="w-40">
            <Select
              styles={selectStyles}
              defaultValue={{ value: `${today?.$y}`, label: `${today?.$y}` }}
              placeholder="Select Year"
              value={year ? year : null}
              onChange={(val) => handleChange(val)}
              options={options ? options : null}
            />
          </div> */}
        </div>
        <p className="font-bold text-3xl px-3 py-2">
          Co 25 - Ci 180
          {/* {data?.data?.currencyUnit}{TotalRevenue?.toFixed(2)} */}
        </p>
        <BarChart
          dashboardBarChartData={{
            labels: ["Pakistan", "USA", "Canada", "Germany", "Italy", "France"],
            datasets: [
              {
                data: [
                  6928.25, 897.14, 360, 175, 878.4, 1079.31, 370.25, 9352.55,
                  6533.02, 750.63, 813.47, 791.01,
                ],
              },
              {
                data: [
                  6928.25, 897.14, 360, 175, 878.4, 1079.31, 370.25, 9352.55,
                  6533.02, 750.63, 813.47, 791.01,
                ],
              },
              {
                data: [
                  6928.25, 897.14, 360, 175, 878.4, 1079.31, 370.25, 9352.55,
                  6533.02, 750.63, 813.47, 791.01,
                ],
              },
            ],
          }}
        />
      </div>


      {/* Doughnut Chart Start */}
      <div className="lg:col-span-2 bg-white">
        <div className="border-b-[1px] h-16 px-3 flex flex-col justify-center">
          <p className="font-bold font-inter text-2xl">Bank Check</p>
          {/* <p className="text-sm text-gray-600">
            Customers that buy our Subscriptions
          </p> */}
        </div>
        <div className="max-h-[410px] h-full md:w-full flex items-start xl:items-center justify-center">
          {/* chart display start */}
          <DoughnutChart
            dashboardDoughnutChartData={{
              labels: ["Daily Registered", "Weekly new Registered"],
              datasets: [
                {
                  data: [113, 188],
                },
              ],
            }}
          />
          {/* chart display end */}
        </div>
      </div>
    </main>
  );
}
