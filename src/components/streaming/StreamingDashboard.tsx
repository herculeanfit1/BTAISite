import { Suspense } from "react";
import { LoadingState } from "../common/LoadingSpinner";

// DataBlockHeader component for displaying block headers
function DataBlockHeader({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}

// Slow data component that simulates a slow API call or complex computation
async function SlowMetricsData() {
  // This artificial delay simulates a slow API call or database query
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Data that would normally be fetched from an API
  const metrics = [
    { id: 1, name: "Total AI Models", value: "24", change: "+12%" },
    { id: 2, name: "Active Deployments", value: "18", change: "+5%" },
    { id: 3, name: "Monthly Predictions", value: "1.2M", change: "+27%" },
    { id: 4, name: "Avg. Response Time", value: "182ms", change: "-8%" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="rounded-lg bg-white p-5 shadow-md dark:bg-gray-800"
        >
          <h4 className="mb-1 text-sm text-gray-500 dark:text-gray-400">
            {metric.name}
          </h4>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold">{metric.value}</p>
            <span
              className={`text-sm ${metric.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}
            >
              {metric.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Medium speed data component
async function MediumSpeedActivityData() {
  // Simulate medium-speed data fetch
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Sample activity data
  const activities = [
    {
      id: 1,
      user: "Sarah Johnson",
      action: "deployed a new model",
      model: "Sentiment Analysis v2",
      time: "2 hours ago",
    },
    {
      id: 2,
      user: "Michael Chen",
      action: "updated parameters for",
      model: "Customer Churn Predictor",
      time: "5 hours ago",
    },
    {
      id: 3,
      user: "Alex Rivera",
      action: "created a new",
      model: "Product Recommendation Engine",
      time: "1 day ago",
    },
    {
      id: 4,
      user: "Priya Patel",
      action: "archived",
      model: "Legacy Text Classifier",
      time: "2 days ago",
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {activities.map((activity) => (
          <li
            key={activity.id}
            className="p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="flex items-center">
              <div className="mr-3 flex-shrink-0">
                <div className="bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-full font-medium">
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {activity.user}
                  </span>{" "}
                  {activity.action}{" "}
                  <span className="text-primary font-medium">
                    {activity.model}
                  </span>
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {activity.time}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Fast data component
async function FastPerformanceData() {
  // Simulate fast data fetch
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Sample performance data
  const performanceData = {
    points: [65, 72, 84, 78, 82, 89, 91, 87, 85, 92, 94, 90],
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
  };

  // Max value for scaling
  const maxValue = Math.max(...performanceData.points);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <h4 className="font-medium">AI Performance Trend</h4>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Last 12 months
        </span>
      </div>
      <div className="flex h-48 items-end justify-between">
        {performanceData.points.map((point, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="bg-primary w-5 rounded-t"
              style={{ height: `${(point / maxValue) * 100}%` }}
            ></div>
            <span className="mt-2 text-xs text-gray-500">
              {/* eslint-disable-next-line security/detect-object-injection -- index from .map() callback */}
              {performanceData.labels[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Instant data component (for comparison)
function InstantAlertsSummary() {
  const alerts = [
    { id: 1, level: "critical", count: 2 },
    { id: 2, level: "warning", count: 5 },
    { id: 3, level: "info", count: 12 },
  ];

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h4 className="mb-4 font-medium">System Alerts</h4>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <span
                className={`mr-2 h-3 w-3 rounded-full ${
                  alert.level === "critical"
                    ? "bg-red-500"
                    : alert.level === "warning"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                }`}
              ></span>
              <span className="capitalize">{alert.level}</span>
            </div>
            <span className="font-medium">{alert.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main StreamingDashboard component
export default function StreamingDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold">AI Systems Dashboard</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          This dashboard demonstrates streaming server rendering with
          progressive loading of components in order of complexity.
        </p>
      </div>

      {/* Top metrics - slowest, will appear last */}
      <div>
        <DataBlockHeader title="Key Metrics" />
        <Suspense fallback={<LoadingState label="Loading metrics..." />}>
          <SlowMetricsData />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent activity - medium speed, will appear second */}
        <div className="lg:col-span-2">
          <DataBlockHeader title="Recent Activity" />
          <Suspense fallback={<LoadingState label="Loading activity..." />}>
            <MediumSpeedActivityData />
          </Suspense>
        </div>

        <div className="space-y-8">
          {/* Performance chart - fast, will appear first */}
          <div>
            <DataBlockHeader title="Performance" />
            <Suspense
              fallback={<LoadingState label="Loading performance data..." />}
            >
              <FastPerformanceData />
            </Suspense>
          </div>

          {/* Alerts - instant, no suspense needed */}
          <div>
            <DataBlockHeader title="Alerts" />
            <InstantAlertsSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
