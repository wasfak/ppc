import uploadMiddleware from "../util/multerMiddleware";
import xlsx from "xlsx";

export const config = {
  api: {
    bodyParser: false,
  },
};

function adjustBidAndCPC(data) {
  return data.map((row) => {
    if (row["CPC"] > row["Bid"]) {
      row["Adjusted CPC"] = (row["CPC"] * 0.75).toFixed(2);
      row["Adjusted Bid"] = (row["Bid"] * 0.75).toFixed(2);
    } else {
      row["Adjusted CPC"] = row["CPC"];
      row["Adjusted Bid"] = row["Bid"];
    }
    row["Click-through Rate"] = `${(row["Click-through Rate"] * 100).toFixed(
      2
    )}%`;
    return row;
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    uploadMiddleware(req, res, async function (err) {
      if (err) {
        console.error("File upload failed:", err);
        return res.status(500).json({ error: "File upload failed" });
      }

      const fileBuffer = req.file.buffer;
      const workbook = xlsx.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames.find((name) =>
        name.includes("Sponsored Products Campaigns")
      );
      const sheet = workbook.Sheets[sheetName];

      const data = xlsx.utils.sheet_to_json(sheet).map((row) => ({
        ...row,
        Clicks: Number(row.Clicks),
        Sales: Number(row.Sales),
        CPC: Number(row.CPC),
        Bid: Number(row.Bid),
        "Click-through Rate": parseFloat(row["Click-through Rate"]),
      }));

      const filteredData = data.filter(
        (row) =>
          (row.Entity === "Keyword" || row.Entity === "Product Targeting") &&
          row.Clicks >= 8 &&
          row.Sales === 0
      );

      const adjustedData = adjustBidAndCPC(filteredData);

      res.status(200).json(adjustedData);
    });
  } catch (error) {
    console.error("Error handling file upload:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
