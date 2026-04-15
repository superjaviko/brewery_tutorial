export type StageName = |"Milling" | "Mashing" | "Sparging" | "Boiling" | "Cooling" | "Fermenting" | "Bottling" | "Monitoring";

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const quizData: Record<StageName, {
  question: string;
  options: string[];
  correctAnswer: string;
}[]> = {
  Milling: [
    {
      question: "What is the optimal particle size range for milled malt to ensure efficient lautering?",
      options: ["0.2–0.5 mm", "0.8–1.0 mm", "1.2–1.8 mm", "2.0–2.5 mm"],
      correctAnswer: "0.8–1.0 mm"
    },
    {
      question: "What is the primary goal of the milling process in brewing?",
      options: ["To sterilize the grain", "To reduce moisture", "To expose starches for enzymatic conversion", "To ferment sugars"],
      correctAnswer: "To expose starches for enzymatic conversion"
    }
  ],
  
  Mashing: [
    {
      question: "What is the optimal pH range for the mash to activate enzymes effectively?",
      options: ["4.0–4.5", "5.2–5.6", "6.0–6.5", "7.0–7.5"],
      correctAnswer: "5.2–5.6"
    },
    {
      question: "Which additive is commonly used to adjust mash pH to the ideal range?",
      options: ["Calcium sulfate", "Lactic acid", "Table salt", "Sucrose"],
      correctAnswer: "Lactic acid"
    }
  ],
  
  Sparging: [
    {
      question: "What is the main objective of sparging in the brewing process?",
      options: ["Extract remaining sugars from grain bed", "Add bitterness to the wort", "Remove proteins", "Pasteurize the wort"],
      correctAnswer: "Extract remaining sugars from grain bed"
    },
    {
      question: "At what temperature should sparging water ideally be maintained?",
      options: ["40–50°C", "65–70°C", "75–78°C", "90–95°C"],
      correctAnswer: "75–78°C"
    }
  ],
  
  Boiling: [
    {
      question: "What is the primary function of the wort boiling step?",
      options: ["Enhance sweetness", "Kill unwanted microbes", "Reduce wort pH", "Improve water hardness"],
      correctAnswer: "Kill unwanted microbes"
    },
    {
      question: "Which compound isomerizes during boiling to contribute bitterness to beer?",
      options: ["Alpha acids", "Proteins", "Starches", "Sugars"],
      correctAnswer: "Alpha acids"
    }
  ],
  
  Cooling: [
    {
      question: "Why is it important to rapidly cool the wort after boiling?",
      options: ["To concentrate the sugars", "To prevent off-flavors and contamination", "To reduce hop bitterness", "To extract more aroma"],
      correctAnswer: "To prevent off-flavors and contamination"
    },
    {
      question: "Which equipment is most efficient for rapid wort chilling?",
      options: ["Cooling fan", "Freezer", "Immersion chiller or counterflow chiller", "Ice bucket"],
      correctAnswer: "Immersion chiller or counterflow chiller"
    }
  ],
  
  Fermenting: [
    {
      question: "What is the optimal temperature range for ale yeast fermentation?",
      options: ["8–12°C", "13–15°C", "18–22°C", "28–32°C"],
      correctAnswer: "18–22°C"
    },
    {
      question: "What is the main byproduct of yeast fermentation besides alcohol?",
      options: ["Oxygen", "CO₂", "Lactic acid", "Acetaldehyde"],
      correctAnswer: "CO₂"
    }
  ],
  
  Bottling: [
    {
      question: "What is the purpose of adding priming sugar during bottling?",
      options: ["Sweeten the beer", "Sterilize the bottle", "Carbonate the beer", "Adjust pH"],
      correctAnswer: "Carbonate the beer"
    },
    {
      question: "Why is it important to avoid oxygen during the bottling process?",
      options: ["It promotes carbonation", "It helps aging", "It causes oxidation and off-flavors", "It improves color"],
      correctAnswer: "It causes oxidation and off-flavors"
    }
  ],
  
  Monitoring: [
    {
      question: "Which instrument is typically used to measure fermentation progress?",
      options: ["Thermometer", "pH meter", "Hydrometer or refractometer", "Timer"],
      correctAnswer: "Hydrometer or refractometer"
    },
    {
      question: "What does a decrease in specific gravity during fermentation indicate?",
      options: ["Increased bitterness", "Increased pH", "Alcohol production", "Water loss"],
      correctAnswer: "Alcohol production"
    }
  ],
  
};
