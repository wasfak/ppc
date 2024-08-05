import React, { useState } from "react";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploaded, setIsUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

      // Check for errors in the response data
      if (responseData.error) {
        console.error("Backend Error:", responseData.error);
        setError(responseData.error);
        setIsUploaded(false); // Reset uploaded state
      } else {
        setIsUploaded(responseData.message);
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
  return (
    <main
      className={`flex flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="border shadow-xl flex flex-col items-center border- rounded-xl p-6">
        <input
          type="file"
          accept=".xls, .xlsx"
          onChange={handleFileChange}
          className="my-6"
        />
        <button
          disabled={isLoading}
          onClick={handleUpload}
          className="py-4 px-4 rounded-xl mt-6 bg-black text-white flex items-center my-6"
        >
          {isLoading ? "Uploading..." : "Upload Excel File"}
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {uploaded && <h1 className="mt-6 font-bold text-3xl">{uploaded}</h1>}
      </div>
    </main>
  );
}
