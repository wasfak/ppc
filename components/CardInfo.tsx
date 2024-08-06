import { ArrowUpRight } from "lucide-react";

interface TitleProps {
  title: string;
  p: string;
}

export default function CardInfo({ title, p }: TitleProps) {
  return (
    <div className="border-2 border-[#a8ada9] p-4 m-2 w-90 h-64 flex flex-col items-center justify-between rounded-xl shadow-lg shadow-black">
      <h3 className="mb-4 text-xl font-bold">{title}</h3>
      <p className="flex-grow">{p}</p>
      <div className="flex items-center justify-between">
        <button className="group bg-mainColor text-black px-4 py-2 rounded-md flex items-center justify-between ">
          More Info
          <ArrowUpRight className="w-6 h-6 transform group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}
