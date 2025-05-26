import React, { Suspense } from "react";
import { LoadingState } from "../common/LoadingSpinner";

// Utility functions to simulate API calls with different delays
async function fetchFirstDataWithDelay() {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    items: [
      { id: 1, name: "Data item 1" },
      { id: 2, name: "Data item 2" },
      { id: 3, name: "Data item 3" },
    ],
  };
}

async function fetchSecondDataWithDelay() {
  await new Promise((resolve) => setTimeout(resolve, 2500));
  return {
    stats: [
      { id: 1, label: "Total Users", value: "5,240" },
      { id: 2, label: "Conversion", value: "12%" },
      { id: 3, label: "Growth", value: "+24%" },
      { id: 4, label: "Bounce Rate", value: "20%" },
    ],
  };
}

// Server component for fetching first data source
async function FirstDataSection() {
  const data = await fetchFirstDataWithDelay();

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold">First Data Source</h3>
      <ul className="space-y-2">
        {data.items.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <span className="bg-primary h-2 w-2 rounded-full"></span>
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Server component for fetching second data source
async function SecondDataSection() {
  const data = await fetchSecondDataWithDelay();

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold">Second Data Source</h3>
      <div className="grid grid-cols-2 gap-3">
        {data.stats.map((stat) => (
          <div
            key={stat.id}
            className="rounded bg-gray-50 p-3 text-center dark:bg-gray-700"
          >
            <p className="text-primary text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Parent component that uses parallel data fetching
export default function ParallelDataFetchingDemo() {
  return (
    <div className="mx-auto max-w-4xl py-12">
      <h2 className="mb-8 text-center text-2xl font-bold">
        Parallel Data Fetching Demo
      </h2>
      <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
        This component demonstrates parallel data fetching with Suspense
        boundaries in Next.js 15. Each section loads independently without
        blocking the others.
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* First data section with Suspense */}
        <Suspense
          fallback={<LoadingState label="Loading first data source..." />}
        >
          <FirstDataSection />
        </Suspense>

        {/* Second data section with Suspense */}
        <Suspense
          fallback={<LoadingState label="Loading second data source..." />}
        >
          <SecondDataSection />
        </Suspense>
      </div>
    </div>
  );
}
