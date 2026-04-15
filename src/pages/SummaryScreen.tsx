import React from "react";

interface SummaryScreenProps {
  completedStages: string[];
  score: number;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ completedStages, score }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5dc] p-6">
      <h2 className="text-4xl font-bold text-green-700 mb-6">🎉 Brewing Completed!</h2>
      <p className="text-2xl font-semibold mb-4">Final Score: {score} / 100</p>

      <ul className="bg-white rounded-lg shadow-md p-6 w-full max-w-md space-y-3">
        {completedStages.map((stage, index) => (
          <li
            key={index}
            className="flex items-center text-lg text-gray-700 border-b pb-2 last:border-b-0"
          >
            ✅ {stage}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SummaryScreen;