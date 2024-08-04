import CardInfo from "@/components/CardInfo";
const services = [
  {
    title: "Weekly Comparison",
    p: "Get insights into your account's progress with our weekly comparison reports. Track key metrics and performance changes from week to week to make informed decisions.",
  },
  {
    title: "Cutting Bleeders",
    p: "Optimize your ad spend by cutting bleeders. Identify and control ads with high ACOS that are draining your budget without delivering results.",
  },
  {
    title: "Month Analysis",
    p: "Analyze your total sales on a monthly basis with detailed week-to-week breakdowns. Understand trends and performance to enhance your overall strategy.",
  },
];
export default function Home() {
  return (
    <div className="container font-bold mx-auto flex items-center justify-center flex-col p-10 capitalize gap-y-4">
      <div className="flex items-center justify-center flex-col gap-y-6">
        <h1 className="text-6xl">
          welcome to the interesting world of <br />
          <span className="text-[#66fcf1] flex items-center my-6 justify-center">
            Amazon PPC
          </span>
        </h1>
      </div>

      <h2 className="text-2xl">
        we help you to <span className="text-[#66fcf1]">optimize</span> every
        aspect of your Amazon PPC campaigns
      </h2>
      <div className="flex justify-center items-center ">
        {services.map((service, index) => (
          <CardInfo key={index} title={service.title} p={service.p} />
        ))}
      </div>
    </div>
  );
}
