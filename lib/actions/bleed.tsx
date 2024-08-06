"use server";
import * as xlsx from "xlsx";

// Define the type for the row data
interface RowData {
  Entity: string;
  Clicks: number;
  Sales: number;
  CPC: number;
  Bid: number;
  "Click-through Rate": number;
  [key: string]: any; // Allow for additional properties
}

interface AdjustedRowData extends RowData {
  "Adjusted CPC": string;
  "Adjusted Bid": string;
  "Formatted Click-through Rate": string;
}

function adjustBidAndCPC(data: RowData[]): AdjustedRowData[] {
  return data.map((row) => {
    const adjustedCPC =
      row.CPC > row.Bid ? (row.CPC * 0.75).toFixed(2) : row.CPC.toString();
    const adjustedBid =
      row.Bid > row.CPC ? (row.Bid * 0.75).toFixed(2) : row.Bid.toString();
    const formattedClickThroughRate = `${(
      row["Click-through Rate"] * 100
    ).toFixed(2)}%`;

    const adjustedRow: AdjustedRowData = {
      ...row,
      "Adjusted CPC": adjustedCPC,
      "Adjusted Bid": adjustedBid,
      "Formatted Click-through Rate": formattedClickThroughRate,
    };
    return adjustedRow;
  });
}

export async function userTable(
  formData: FormData
): Promise<AdjustedRowData[]> {
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file uploaded");
  }

  // Convert the file to an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Create a Uint8Array from the ArrayBuffer
  const uint8Array = new Uint8Array(arrayBuffer);

  // Use xlsx to read the file
  const workbook = xlsx.read(uint8Array, { type: "array" });

  // Assuming you want to read the first sheet
  const sheetName = "Sponsored Products Campaigns";
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Sheet with name "${sheetName}" not found`);
  }

  // Convert the sheet to JSON (or process it as needed)
  const data = xlsx.utils.sheet_to_json<RowData>(worksheet);

  // Filter and adjust the data
  const filteredData = data.filter(
    (row) =>
      (row.Entity === "Keyword" || row.Entity === "Product Targeting") &&
      row.Clicks >= 8 &&
      row.Sales === 0
  );

  // Ensure that the filtered data has the necessary fields
  const dataWithRequiredFields = filteredData.map((row) => ({
    ...row,
    Clicks: Number(row.Clicks),
    Sales: Number(row.Sales),
    CPC: Number(row.CPC),
    Bid: Number(row.Bid),
    "Click-through Rate": parseFloat(row["Click-through Rate"].toString()),
  }));

  const adjustedData = adjustBidAndCPC(dataWithRequiredFields);

  return adjustedData;
}
