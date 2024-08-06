"use server";
import * as xlsx from "xlsx";

const readAndFilterData = (fileBuffer, sheetName) => {
  const workbook = xlsx.read(fileBuffer, { type: "buffer" });
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json < RowData > (sheet, { raw: false });

  // Filter the data
  const filteredData = data.filter(
    (row) =>
      row["Entity"] === "Keyword" || row["Entity"] === "Product Targeting"
  );

  return filteredData;
};

const calculateMetrics = (data) => {
  const totalSpend = data.reduce(
    (acc, row) => acc + parseFloat(row["Spend"]),
    0
  );
  const totalSales = data.reduce(
    (acc, row) => acc + parseFloat(row["Sales"]),
    0
  );
  const totalImpressions = data.reduce(
    (acc, row) => acc + parseInt(row["Impressions"]),
    0
  );
  const totalClicks = data.reduce(
    (acc, row) => acc + parseInt(row["Clicks"]),
    0
  );
  const averageCPC = totalClicks ? totalSpend / totalClicks : 0;
  const averageCTR = totalImpressions ? totalClicks / totalImpressions : 0;
  const averageConversionRate = totalClicks
    ? data.reduce((acc, row) => acc + parseInt(row["Orders"]), 0) / totalClicks
    : 0;
  const acos = totalSales ? totalSpend / totalSales : 0;

  return {
    totalSales,
    totalImpressions,
    totalClicks,
    averageCTR,
    averageConversionRate,
    totalSpend,
    averageCPC,
    acos,
  };
};

const createComparisonData = (prevMetrics, latestMetrics) => {
  const metrics = [
    "totalSales",
    "totalImpressions",
    "totalClicks",
    "averageCTR",
    "averageConversionRate",
    "totalSpend",
    "averageCPC",
    "acos",
  ];

  const comparison = metrics.map((metric) => {
    const prevValue = prevMetrics[metric];
    const latestValue = latestMetrics[metric];
    const change = latestValue - prevValue;
    const percentageChange = prevValue ? (change / prevValue) * 100 : 0;

    return {
      metric,
      previous: prevValue,
      latest: latestValue,
      change,
      percentageChange,
    };
  });

  return comparison;
};

export async function uploadAndCompare(formData) {
  const prevWeekFile = formData.get("prevWeek");
  const currWeekFile = formData.get("currWeek");

  if (!prevWeekFile || !currWeekFile) {
    throw new Error("Both files must be uploaded");
  }

  // Convert files to buffers
  const prevWeekBuffer = await prevWeekFile.arrayBuffer();
  const currWeekBuffer = await currWeekFile.arrayBuffer();

  const sheetName = "Sponsored Products Campaigns";

  const prevWeekData = readAndFilterData(
    Buffer.from(prevWeekBuffer),
    sheetName
  );
  const currWeekData = readAndFilterData(
    Buffer.from(currWeekBuffer),
    sheetName
  );

  const prevMetrics = calculateMetrics(prevWeekData);
  const latestMetrics = calculateMetrics(currWeekData);

  const comparisonData = createComparisonData(prevMetrics, latestMetrics);

  // Enhance the comparison data with formatted values
  const formattedComparisonData = comparisonData.map((item) => {
    const formatChange = (value) => value.toFixed(2);
    const formatPercentage = (value) =>
      value > 0
        ? `↑ ${value.toFixed(2)}%`
        : value < 0
        ? `↓ ${value.toFixed(2)}%`
        : `${value.toFixed(2)}%`;

    const formatSalesImpressions = (value) => value.toLocaleString();
    const formatRate = (value) => (value * 100).toFixed(2) + "%";

    return {
      ...item,
      change: formatChange(item.change),
      percentageChange: formatPercentage(item.percentageChange),
      previous: ["averageCTR", "averageConversionRate", "acos"].includes(
        item.metric
      )
        ? formatRate(item.previous)
        : formatSalesImpressions(item.previous),
      latest: ["averageCTR", "averageConversionRate", "acos"].includes(
        item.metric
      )
        ? formatRate(item.latest)
        : formatSalesImpressions(item.latest),
    };
  });

  return { formattedComparisonData };
}
