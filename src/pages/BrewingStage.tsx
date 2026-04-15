import {
  Wheat,
  Beaker,
  Droplets,
  Flame,
  Snowflake,
  FlaskConical,
  Beer,
  Gauge,
} from "lucide-react";
import { JSX, useState } from "react";
import { motion } from "framer-motion";
import StageDetail from "./StageDetail";

type Stage = {
  id: number;
  name: string;
  icon: JSX.Element;
};

export default function BrewingStage() {
  const [activeView, setActiveView] = useState<"overview" | "stage" | "results">("overview");
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [unlockedStage, setUnlockedStage] = useState<number>(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [stageScores, setStageScores] = useState<Record<string, number>>({});

  const stages: Stage[] = [
    { id: 0, name: "Milling", icon: <Wheat className="w-20 h-20 text-yellow-700" /> },
    { id: 1, name: "Mashing", icon: <Beaker className="w-20 h-20 text-amber-600" /> },
    { id: 2, name: "Sparging", icon: <Droplets className="w-20 h-20 text-sky-600" /> },
    { id: 3, name: "Boiling", icon: <Flame className="w-20 h-20 text-red-600" /> },
    { id: 4, name: "Cooling", icon: <Snowflake className="w-20 h-20 text-blue-500" /> },
    { id: 5, name: "Fermenting", icon: <FlaskConical className="w-20 h-20 text-green-600" /> },
    { id: 6, name: "Bottling", icon: <Beer className="w-20 h-20 text-purple-600" /> },
    { id: 7, name: "Monitoring", icon: <Gauge className="w-20 h-20 text-orange-500" /> },
  ];

  const handleClick = (id: number) => {
    if (id <= unlockedStage) {
      setActiveStage(id);
      setActiveView("stage");
    }
  };

  const handleCompleteStage = (stageName: string, score: number) => {
    setStageScores((prevScores) => ({ ...prevScores, [stageName]: score }));

     const stageIndex = stages.findIndex((s) => s.name === stageName);

     if (stageIndex < stages.length - 1) {
      setUnlockedStage((prev) => Math.max(prev, stageIndex + 1));
    }

    setCompletedStages((prev) => [...prev, stageName]); // ✅ Aquí actualizas los completados

  
    setActiveView("overview");
  };

  if (activeView === "stage" && activeStage !== null) {
    return (
      <StageDetail
        stage={stages[activeStage]}
        onBack={() => setActiveView("overview")}
        onCompleteStage={handleCompleteStage}
      />
    );
  }

  if (activeView === "results") {
    const scores = Object.values(stageScores);
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;
  
    const getFeedback = (score: number) => {
      if (score < 60) return { emoji: "😢", message: "Too Bad", color: "text-red-600" };
      if (score < 70) return { emoji: "😟", message: "Bad", color: "text-orange-600" };
      if (score < 80) return { emoji: "😐", message: "Regular", color: "text-yellow-600" };
      if (score < 90) return { emoji: "🙂", message: "Good", color: "text-lime-600" };
      if (score < 95) return { emoji: "😃", message: "Great", color: "text-green-600" };
      if (score < 100) return { emoji: "🤩", message: "Excellent", color: "text-emerald-600" };
      return { emoji: "🏆", message: "Perfect!", color: "text-indigo-700" };
    };
  
    const feedback = getFeedback(averageScore);
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-xl">
          <h2 className={`text-4xl font-bold mb-4 ${feedback.color}`}>
            {feedback.emoji} {feedback.message}
          </h2>
          <p className="text-2xl mb-6">Average Score: <span className={feedback.color}>{averageScore}</span> / 100</p>
  
          <ul className="text-left space-y-2 text-lg">
            {stages.map((stage) => (
              <li key={stage.name}>
                ✅ {stage.name}: {stageScores[stage.name] ?? 0} / 100
              </li>
            ))}
          </ul>
  
          <button
            onClick={() => setActiveView("overview")}
            className="mt-6 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
          >
            🔙 Back
          </button>
        </div>
      </div>
    );
  }
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-[#c7ad35]">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <img
          src="/logo.png"
          alt="Logo Leonardo"
          className="h-20 md:h-28 object-contain"
        />
      </div>

      <div className="mt-20 text-center text-2xl sm:text-3xl md:text-4x1 font-extrabold bg-amber-200 px-8 py-4 rounded-full inline-block text-amber-800 mb-100 drop-shadow-lg">
        Complete All the Brewery Stages
      </div>

      <div className="flex flex-wrap justify-center gap-6 p-8 -mt-80">
        {stages.map((stage) => {
          const isUnlocked = stage.id <= unlockedStage;
          return (
            <motion.div
              key={stage.id}
              whileHover={isUnlocked ? { scale: 1.1 } : undefined}
              whileTap={isUnlocked ? { scale: 0.95 } : undefined}
              className={`cursor-pointer flex flex-col items-center p-4 rounded-xl shadow-lg transition 
                ${
                  isUnlocked
                    ? "bg-white hover:bg-amber-50"
                    : "bg-gray-200 opacity-50 cursor-not-allowed"
                }`}
              onClick={() => handleClick(stage.id)}
            >
              {stage.icon}
              <span className="mt-2 text-lg font-semibold">{stage.name}</span>
            </motion.div>
          );
        })}
      </div>

      {completedStages.length === stages.length && (
        <div className="absolute bottom-30 w-full text-center">
          <button
            onClick={() => setActiveView("results")}
            className="px-12 py-6 bg-orange-300 hover:bg-red-500 text-white rounded-lg text-3xl shadow-lg font-extrabold"
          >
            🎯 RESULTS
          </button>
        </div>
      )}
    </div>
  );
}
