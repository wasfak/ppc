"use client";
import React, { useState } from "react";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

const columnsToShow = [
  "Entity",
  "Bid",
  "CPC",
  "Adjusted Bid",
  "Adjusted CPC",
  "Keyword Text",
  "Match Type",
  "Impressions",
  "Clicks",
  "Click-through Rate",
  "Spend",
  "Sales",
  "Operation", // Include Operation in columnsToShow
];

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploaded, setIsUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseData, setResponseData] = useState([]); // New state to store response data

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear previous errors

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploadExcel", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(responseData);

      // Check for errors in the response data
      if (responseData.error) {
        console.error("Backend Error:", responseData.error);
        setError(responseData.error);
        setIsUploaded(false); // Reset uploaded state
      } else {
        // Add "Operation" column to each row
        const updatedData = responseData.map((row) => ({
          ...row,
          Operation: "Update",
        }));

        setResponseData(updatedData); // Store updated response data
        setIsUploaded("File uploaded successfully!"); // Updated message
        setError(null); // Reset error state
      }
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
    <div className="flex flex-col items-center justify-between p-24 container mx-auto">
      <div className="border shadow-xl flex flex-col items-center gap-y-6 rounded-xl p-6 bg-red-600">
        <div className="flex items-center flex-col gap-y-6 ">
          {" "}
          <input
            type="file"
            accept=".xls, .xlsx"
            onChange={handleFileChange}
            className="my-6"
          />
          <Button disabled={isLoading} onClick={handleUpload} className="mt-12">
            {isLoading ? "Working..." : "Upload Bulk File"}
          </Button>
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {responseData.length > 0 && (
          <>
            <div className="mt-6 overflow-x-auto">
              <table className=" bg-white border border-gray-300">
                <thead>
                  <tr>
                    {columnsToShow.map((key) => (
                      <th
                        key={key}
                        className="py-2 px-4 border-b border-gray-300 bg-gray-200"
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
                          className="py-2 px-4 border-b border-gray-300"
                        >
                          {row[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {responseData.length > 0 && (
        <Button onClick={handleDownload} className="mt-12 mb-6 ">
          Download Excel File
        </Button>
      )}
    </div>
  );
}
