import uploadMiddleware from "../util/multerMiddleware";
import xlsx from "xlsx";
import { startOfWeek, parse, isValid } from "date-fns";

export const config = {
  api: {
    bodyParser: false,
  },
};

const readAndProcessFile = (fileBuffer, sheetName) => {
  const workbook = xlsx.read(fileBuffer, { type: "buffer" });
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { raw: false });

  // Convert 'Date' to JavaScript Date object and ensure the date is valid
  data.forEach((row) => {
    // Custom parse the date. Adjust format if needed.
    const parsedDate = parse(row["Date"], "MMM dd, yyyy", new Date());

    if (isValid(parsedDate)) {
      row["Date"] = parsedDate;
    } else {
      row["Date"] = null; // Handle invalid dates appropriately
    }
  });

  // Filter out rows with invalid dates
  const filteredData = data.filter((row) => row["Date"] !== null);

  // Group by week and sum '7 Day Total Orders (#)'
  const weeklySales = filteredData.reduce((acc, row) => {
    const weekStart = startOfWeek(row["Date"], { weekStartsOn: 1 });
    const weekKey = weekStart.toISOString();

    if (!acc[weekKey]) {
      acc[weekKey] = {
        Date: weekStart,
        "Weekly Total Orders": 0,
      };
    }

    acc[weekKey]["Weekly Total Orders"] += parseFloat(
      row["7 Day Total Orders (#)"]
    );
    return acc;
  }, {});

  // Convert the result to an array
  return Object.values(weeklySales).sort((a, b) => a["Date"] - b["Date"]);
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await uploadMiddleware(req, res, async function (err) {
      if (err) {
        console.error("File upload failed:", err);
        return res.status(500).json({ error: "File upload failed" });
      }

      const fileBuffer = req.file.buffer;
      const workbook = xlsx.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames.find(
        (name) => name.includes("Sponsored Product Advertised Pr") // Adjust according to your sheet name
      );

      if (!sheetName) {
        return res.status(400).json({ error: "Sheet not found" });
      }

      const weeklySales = readAndProcessFile(fileBuffer, sheetName);

      res.status(200).json({ weeklySales });
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
