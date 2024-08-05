import multer from "multer";
import xlsx from "xlsx";

const upload = multer({ storage: multer.memoryStorage() });
export const config = {
  api: {
    bodyParser: false,
  },
};

const readAndProcessFile = (fileBuffer, sheetName) => {
  const workbook = xlsx.read(fileBuffer, { type: "buffer" });
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { raw: false });

  const filteredData = data.filter(
    (row) =>
      row["Entity"] === "Keyword" || row["Entity"] === "Product Targeting"
  );

  const processedData = filteredData.filter(
    (row) => parseFloat(row["Units"]) >= 2
  );

  return processedData.sort(
    (a, b) => parseFloat(b["Units"]) - parseFloat(a["Units"])
  );
};

const calculateMetrics = (data) => {
  const totalSales = data.reduce(
    (sum, row) => sum + parseFloat(row["Sales"]),
    0
  );
  const totalImpressions = data.reduce(
    (sum, row) => sum + parseFloat(row["Impressions"]),
    0
  );
  const totalClicks = data.reduce(
    (sum, row) => sum + parseFloat(row["Clicks"]),
    0
  );

  // Calculate Average CTR as total clicks divided by total impressions
  const averageCTR = totalClicks / totalImpressions || 0;

  // Calculate Average Conversion Rate as total orders divided by total clicks
  const averageConversionRate =
    totalClicks > 0
      ? data.reduce((sum, row) => sum + parseFloat(row["Orders"]), 0) /
        totalClicks
      : 0;

  const totalSpend = data.reduce(
    (sum, row) => sum + parseFloat(row["Spend"]),
    0
  );
  const averageCPC =
    data.reduce((sum, row) => sum + parseFloat(row["CPC"]), 0) / data.length;
  const averageACOS =
    data.reduce((sum, row) => sum + parseFloat(row["ACOS"]), 0) / data.length;

  return {
    totalSales,
    totalImpressions,
    totalClicks,
    averageCTR,
    averageConversionRate,
    totalSpend,
    averageCPC,
    averageACOS,
  };
};

const compareMetrics = (metrics1, metrics2) => {
  const comparison = {};
  for (const key in metrics1) {
    const change = metrics2[key] - metrics1[key];
    const percentageChange = (change / (metrics1[key] || 1)) * 100;
    comparison[key] = {
      previous: metrics1[key],
      latest: metrics2[key],
      change,
      percentageChange,
    };
  }
  return comparison;
};

const handler = async (req, res) => {
  if (req.method === "POST") {
    upload.fields([{ name: "prevWeek" }, { name: "currWeek" }])(
      req,
      res,
      (err) => {
        if (err) {
          return res.status(500).json({ error: "Error uploading files" });
        }

        try {
          const prevWeekFile = req.files.prevWeek[0];
          const currWeekFile = req.files.currWeek[0];
          const sheetName = "Sponsored Products Campaigns";

          const prevWeekData = readAndProcessFile(
            prevWeekFile.buffer,
            sheetName
          );
          const currWeekData = readAndProcessFile(
            currWeekFile.buffer,
            sheetName
          );

          const prevWeekMetrics = calculateMetrics(prevWeekData);
          const currWeekMetrics = calculateMetrics(currWeekData);

          const comparison = compareMetrics(prevWeekMetrics, currWeekMetrics);

          res.status(200).json({ comparison });
        } catch (error) {
          console.error("Error processing files:", error);
          res.status(500).json({ error: "Error processing files" });
        }
      }
    );
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default handler;
