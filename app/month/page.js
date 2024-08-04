"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function MonthAnalysis() {
  const [file, setFile] = useState(null);
  const [uploaded, setIsUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseData, setResponseData] = useState([]); // New state to store response data

  const columnsToShow = ["Date", "Weekly Total Orders"]; // Define columns to show

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear previous errors

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/monthAnal", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      // Ensure responseData is an array and properly access the nested 'weeklySales'
      if (!Array.isArray(data.weeklySales)) {
        throw new Error("Invalid response format");
      }

      setResponseData(data.weeklySales); // Store updated response data
      setIsUploaded("File uploaded successfully!"); // Updated message
      setError(null); // Reset error state
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("An error occurred while uploading the file.");
      setIsUploaded(false); // Reset uploaded state
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(responseData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "updated_data.xlsx");
  };

  return (
    <div className="flex flex-col items-center justify-center p-14 container mx-auto">
      <h1 className="text-2xl font-extrabold mb-6 text-center">
        Please upload the Advertise 30 days report and make sure you click on
        Daily
      </h1>
      <div className="border shadow-xl flex flex-col items-center gap-y-6 rounded-xl p-8 w-full max-w-4xl">
        <div className="flex flex-col items-center gap-y-4 w-full">
          <input
            type="file"
            accept=".xls, .xlsx"
            onChange={handleFileChange}
            className="my-6"
          />
          {file && (
            <Button
              disabled={isLoading}
              onClick={handleUpload}
              className="mt-4"
            >
              {isLoading ? "Working..." : "Upload Bulk File"}
            </Button>
          )}
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {Array.isArray(responseData) && responseData.length > 0 && (
          <div className="mt-6 overflow-x-auto w-full">
            <table className="bg-white border border-gray-300 w-full">
              <thead>
                <tr>
                  {columnsToShow.map((key) => (
                    <th
                      key={key}
                      className="py-2 px-4 border-b border-gray-300 bg-gray-200 text-left"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responseData.map((row, index) => (
                  <tr key={index}>
                    {columnsToShow.map((key) => (
                      <td
                        key={key}
                        className={`py-2 px-4 border-b border-gray-300 ${
                          key === "Weekly Total Orders"
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {key === "Date"
                          ? new Date(row[key]).toLocaleDateString()
                          : row[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {responseData.length > 0 && (
        <Button onClick={handleDownload} className="mt-12 mb-6">
          Download Excel File
        </Button>
      )}
    </div>
  );
}
