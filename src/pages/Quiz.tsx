import React, { useState } from "react";
import { quizData , StageName} from "../data/quizData";
import { motion } from "framer-motion";

interface QuizProps {
  stage: StageName;
  onComplete: (score: number) => void;
}

const Quiz: React.FC<QuizProps> = ({ stage, onComplete }) => {
  const questions = quizData[stage] || [];
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (selected: string) => {
    const isCorrect = selected === questions[current].correctAnswer;
    if (isCorrect) {
      setCorrect((prev) => prev + 1);
    }

    const next = current + 1;
    if (next < questions.length) {
      setCurrent(next);
    } else {
      setShowResult(true);
      const finalScore = Math.round(
        ((isCorrect ? correct + 1 : correct) / questions.length) * 100
      );
      setTimeout(() => {
        onComplete(finalScore);
      }, 1500); // short delay before moving on
    }
  };

  if (!questions.length) return <p>No quiz available for this stage.</p>;

  const currentQuestion = questions[current];

  return (
    <div>
      {!showResult ? (
        <>
          <motion.h2
            className="text-2xl font-bold mb-4"
            key={`question-${current}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {currentQuestion.question}
          </motion.h2>
          <div className="space-y-3">
            {currentQuestion.options.map((opt) => (
              <motion.button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="w-full px-4 py-2 border rounded text-left bg-gray-100 hover:bg-blue-100"
                whileHover={{ scale: 1.02 }}
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mt-8"
        >
          <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Quiz Complete!</h2>
          <p className="text-xl">Calculating your score...</p>
        </motion.div>
      )}
    </div>
  );
};

export default Quiz;
