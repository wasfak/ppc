"use client";
import React, { useState } from "react";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

const formatChange = (value) => `${value.toFixed(2)}`;

const formatPercentage = (value) => {
  if (value > 0) {
    return `↑ ${value.toFixed(2)}%`;
  } else if (value < 0) {
    return `↓ ${value.toFixed(2)}%`;
  } else {
    return `${value.toFixed(2)}%`;
  }
};

const formatCTR = (value) => `${(value * 100).toFixed(2)}%`;

export default function UploadPage() {
  const [prevWeekFile, setPrevWeekFile] = useState(null);
  const [currWeekFile, setCurrWeekFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  const handlePrevWeekFileChange = (event) => {
    setPrevWeekFile(event.target.files[0]);
  };

  const handleCurrWeekFileChange = (event) => {
    setCurrWeekFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!prevWeekFile || !currWeekFile) {
      setError("Please upload both previous week and current week files.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null); // Clear previous errors

      const formData = new FormData();
      formData.append("prevWeek", prevWeekFile);
      formData.append("currWeek", currWeekFile);

      const response = await fetch("/api/uploadAndCompare", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      setComparisonData(responseData.comparison);
    } catch (error) {
      console.error("Error uploading files:", error);
      setError("An error occurred while uploading the files.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-between p-24 container mx-auto overflow-y-scroll">
      <div className="border shadow-xl flex flex-col items-center gap-y-6 rounded-xl p-6 w-full">
        <div className="flex w-full justify-between gap-6">
          <div className="flex flex-col items-center w-1/2">
            <label className="my-6 font-bold text-white">
              Previous Week File
            </label>
            <input
              type="file"
              accept=".xls, .xlsx"
              onChange={handlePrevWeekFileChange}
              className="my-6 text-white"
            />
          </div>
          <div className="flex flex-col items-center w-1/2">
            <label className="my-6 font-bold text-white">
              Current Week File
            </label>
            <input
              type="file"
              accept=".xls, .xlsx"
              onChange={handleCurrWeekFileChange}
              className="my-6 text-white"
            />
          </div>
        </div>

        {prevWeekFile && currWeekFile && (
          <Button
            disabled={isLoading}
            onClick={handleUpload}
            className="mt-6 bg-[#66fcf1] text-[#66fcf1] hover:bg-[#66fcf1]"
          >
            {isLoading ? "Working..." : "Upload Files"}
          </Button>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {comparisonData && (
          <div className="mt-6 overflow-x-auto w-full">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-300 bg-gray-200">
                    Metric
                  </th>
                  <th className="py-2 px-4 border-b border-gray-300 bg-gray-200">
                    Previous Week
                  </th>
                  <th className="py-2 px-4 border-b border-gray-300 bg-gray-200">
                    Current Week
                  </th>
                  <th className="py-2 px-4 border-b border-gray-300 bg-gray-200">
                    Change
                  </th>
                  <th className="py-2 px-4 border-b border-gray-300 bg-gray-200">
                    Percentage Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(comparisonData).map(
                  ([metric, values], index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 border-b border-gray-300">
                        {metric}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300">
                        {metric === "averageCTR" ||
                        metric === "averageConversionRate"
                          ? formatCTR(values.previous)
                          : formatChange(values.previous)}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300">
                        {metric === "averageCTR" ||
                        metric === "averageConversionRate"
                          ? formatCTR(values.latest)
                          : formatChange(values.latest)}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300">
                        {formatChange(values.change)}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300">
                        {formatPercentage(values.percentageChange)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
