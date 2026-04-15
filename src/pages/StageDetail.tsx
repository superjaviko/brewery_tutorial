import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef, JSX } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Quiz from "../pages/Quiz";
import { StageName } from "../data/quizData";

type Stage = {
  id: number;
  name: string;
  icon: JSX.Element;
};

type StageDetailProps = {
  stage: Stage;
  onBack: () => void;
  onCompleteStage: (stageName: string, score: number) => void;
};

export default function StageDetail({ stage, onBack, onCompleteStage }: StageDetailProps) {
  const [isMilling, setIsMilling] = useState(false);
  const [grainDropped, setGrainDropped] = useState(false);
  const [progress, setProgress] = useState(0);
  const [boilingStarted, setBoilingStarted] = useState(false);
  const [temperature, setTemperature] = useState(20);
  const [boilingTemperature, setBoilingTemperature] = useState(20);
  const [CoolingTemperature, setCoolingTemperature] = useState(70);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hotWaterDropped, setHotWaterDropped] = useState(false);
  const [phIdealReached, setPhIdealReached] = useState(false);
  const [isMixing, setIsMixing] = useState(false);
  const [phLevel, setPhLevel] = useState(7);
  const [showDragMessage, setShowDragMessage] = useState(false);

  const getRandom = (min: number, max: number) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
  };

  const [ph, setPh] = useState(5.4);
  const [co2, setCo2] = useState(1.2);
  const [srm, setSrm] = useState(10);
  const [abv, setAbv] = useState(4.5);
  const [liters, setLiters] = useState(20);
  const beerColor = `hsl(${45 + srm * 3}, 80%, 40%)`;

  const [connections, setConnections] = useState([
    { from: "kettle-wort-out", to: "counterflow-wort-in", connected: false },
    { from: "counterflow-out", to: "fermentator", connected: false },
    { from: "water tap", to: "counterflow-wort-in", connected: false },
    { from: "counterflow-water-out", to: "waste-water-in", connected: false },
    { from: "fermentator", to: "chiller", connected: false },
  ]);

  const grainSizeMap: { [key: number]: number } = {
    1: 0.8,
    2: 0.9,
    3: 1.0,
  };
  const [grainSliderValue, setGrainSliderValue] = useState(2);
  const grainSize = grainSizeMap[grainSliderValue];

  const getGrainSizeScale = () => {
    if (grainSize === 0.8) return "w-16 h-16";
    if (grainSize === 0.9) return "w-20 h-20";
    return "w-24 h-24";
  };

  const [coolingStarted, setCoolingStarted] = useState(false);
  const [bottlingStarted, setBottlingStarted] = useState(false);
  const [spargingStarted, setSpargingStarted] = useState(false);
  const [spargingFlow, setSpargingFlow] = useState(false);
  const [spargingProgress, setSpargingProgress] = useState(0);
  const [flowProgress, setFlowProgress] = useState(0);
  const [spargingComplete, setSpargingComplete] = useState(false);
  const [isPouring, setIsPouring] = useState(false);
  const [showPourMessage, setShowPourMessage] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fermentatorRef = useRef<HTMLImageElement>(null);

  const handleStartBoiling = () => {
    setBoilingStarted(true);
    let temp = 20;
    let prog = 0;

    const interval = setInterval(() => {
      prog += 2;
      temp += 1;

      setProgress(prog);
      setTemperature(temp);
      setBoilingTemperature(temp);

      if (prog >= 100) {
        clearInterval(interval);
      }
    }, 100);
  };

  const [showQuiz, setShowQuiz] = useState(false);

  const handleStageComplete = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = (score: number) => {
    setShowQuiz(false);
    onCompleteStage(stage.name, score);
  };

  const [data, setData] = useState<{ time: string; temp: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const lastTemp = prevData.length > 0 ? prevData[prevData.length - 1].temp : 23;
        const variation = Math.random() * 0.8 - 0.4;
        const newTemp = Math.max(20, Math.min(30, lastTemp + variation));

        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          temp: parseFloat(newTemp.toFixed(1)),
        };

        const updated = [...prevData, newPoint];
        return updated.length > 20 ? updated.slice(-20) : updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setGrainDropped(false);
    setHotWaterDropped(false);
    setIsMilling(false);
    setProgress(0);
  }, [stage.name]);

  useEffect(() => {
    if (phLevel <= 5.6 && phLevel >= 5.2) {
      setPhIdealReached(true);
      const timeout = setTimeout(() => setPhIdealReached(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [phLevel]);

  useEffect(() => {
    if (isMixing) {
      setProgress(0);
      const duration = 5000;
      const intervalTime = 100;
      const increment = 100 / (duration / intervalTime);

      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + increment;
          if (next >= 100) {
            clearInterval(interval);
            setIsMixing(false);
            return 100;
          }
          return next;
        });
      }, intervalTime);

      return () => clearInterval(interval);
    }
  }, [isMixing]);

  useEffect(() => {
    const allConnected = connections.every((c) => c.connected);

    if (allConnected && !coolingStarted) {
      setCoolingStarted(true);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });

        setCoolingTemperature((prev) => {
          if (prev <= 18) return 18;
          return prev - (70 - 18) / 100;
        });
      }, 100);
    }
  }, [connections, coolingStarted]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature(getRandom(18, 23.8));
      setPh(getRandom(4.8, 5.4));
      setCo2(getRandom(0.5, 2.5));
      setSrm(Math.floor(getRandom(5, 30)));
      setAbv(getRandom(4.5, 5.2));
      setLiters(Math.floor(getRandom(19, 21)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (spargingProgress >= 100) {
      setShowPourMessage(true);
    }
  }, [spargingProgress]);

  const handleMillingDrop = () => {
    setGrainDropped(true);
    setIsMilling(true);
    setProgress(0);

    audioRef.current?.play();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsMilling(false);
          audioRef.current?.pause();
          audioRef.current!.currentTime = 0;
        }
        return Math.min(prev + 2, 100);
      });
    }, 100);
  };

  const handleMashingDrop = (ingredient: string) => {
    if (ingredient === "grain") setGrainDropped(true);
    if (ingredient === "water") setHotWaterDropped(true);
    if (ingredient === "acid lactic") {
      setPhLevel((prev) => Math.max(4.2, +(prev - 0.2).toFixed(1)));
    }
  };

  const toggleConnection = (index: number) => {
    setConnections((prev) =>
      prev.map((conn, idx) =>
        idx === index ? { ...conn, connected: !conn.connected } : conn
      )
    );
  };

  const [yeastPitched, setYeastPitched] = useState(false);
  const [fermentationStarted, setFermentationStarted] = useState(false);
  const [day, setDay] = useState(1);

  function startFermentation() {
    if (!yeastPitched) return;

    setFermentationStarted(true);
    let counter = 0;

    const interval = setInterval(() => {
      counter += 1;
      setDay(counter);

      if (counter >= 7) {
        clearInterval(interval);
      }
    }, 1000);
  }

  function checkDrop(point: { x: number; y: number }) {
    const dropRect = dropZoneRef.current?.getBoundingClientRect();
    if (
      dropRect &&
      point.x >= dropRect.left &&
      point.x <= dropRect.right &&
      point.y >= dropRect.top &&
      point.y <= dropRect.bottom
    ) {
      console.log("✅ Dropped into fermentator!");
      setYeastPitched(true);
    }
  }

  return (
    <div className="p-16 max-w-xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-blue-600 hover:underline"
      >
        <ArrowLeft className="w-6 h-6" /> Back
      </button>
      <div className="flex items-center gap-4 mb-6">
        {stage.icon}
        <h2 className="text-2xl font-bold">{stage.name}</h2>
      </div>

      <audio ref={audioRef} src="/mill-sound.mp3" />

      <div>
        {showQuiz ? (
          <Quiz stage={stage.name as StageName} onComplete={handleQuizComplete} />
        ) : (
          <>
            {/* Milling Stage */}
            {stage.name === "Milling" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-40">
                {!grainDropped && (
                  <motion.img
                    src="/grain-milled-3.png"
                    alt="Grain malt"
                    className={getGrainSizeScale()}
                    drag
                    dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
                    onDragEnd={(_event, info) => {
                      if (info.point.y > 200) handleMillingDrop();
                    }}
                  />
                )}
                <div className="w-full max-w-xs sm:max-w-sm mx-auto mt-6 px-4">
                  <label className="block text-base font-medium text-gray-700 text-center mb-2">
                    Grain Size: {grainSize} mm
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={grainSliderValue}
                    onChange={(e) => setGrainSliderValue(parseInt(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Thinner</span>
                    <span>Thicker</span>
                  </div>
                </div>

                <div className="relative w-60 h-60 bg-orange-300 rounded-xl items-center flex flex-col justify-center border-2 border-dashed border-black -mt-10 ml-20 z-0">
                  <img src="/mill.png" alt="Mill" className="w-40 h-40" />
                  <AnimatePresence>
                    {isMilling ? (
                      <>
                        <motion.img
                          src="/mill.png"
                          alt="Mill"
                          className="w-20 animate-pulse z-0"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.05, opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            repeat: Infinity,
                            repeatType: "mirror",
                            duration: 0.5,
                          }}
                        />
                        <div className="w-full mt-4 px-4">
                          <div className="w-full bg-gray-300 rounded-full h-3 mt-20">
                            <div
                              className="bg-green-500 h-3 rounded-full transition-all duration-200"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-1 text-center">
                            {" "}
                            Milling the malt grain...{progress}%
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-600 text-center">
                        {grainDropped
                          ? "✅ Milling complete!"
                          : "🛠️ Drag the grain into the mill"}
                      </p>
                    )}
                  </AnimatePresence>

                  {grainDropped && progress === 100 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 1.6, ease: "easeOut" }}
                      className="flex flex-col items-center space-y-4 mt-6"
                    >
                      <motion.div
                        className="text-green-600 text-xl font-bold mt-10 absolute"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        🎉 Ready for the next stage
                      </motion.div>

                      <motion.button
                        onClick={handleStageComplete}
                        className="px-6 py-3 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700 transition shadow-lg mt-30 absolute"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Complete Stage
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Mashing Stage */}
            {stage.name === "Mashing" && (
              <div className="flex flex-col-ml-10 gap-20 mt-40 space-y-80 mx-auto justify-center">
                <div className="flex flex-col items-center gap-6 mt-10 -ml-60">
                  {!grainDropped && (
                    <motion.img
                      drag
                      src="/grain-milled.svg"
                      alt="Grain"
                      className="w-16 z-50"
                      dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
                      onDragEnd={(_event, info) => {
                        if (info.point.y > 200) handleMashingDrop("grain");
                      }}
                    />
                  )}

                  {!hotWaterDropped && (
                    <motion.img
                      drag
                      src="/water.svg"
                      alt="Water"
                      className="w-16 z-50"
                      dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
                      onDragEnd={(_event, info) => {
                        if (info.point.y > 200) handleMashingDrop("water");
                      }}
                    />
                  )}
                </div>
                <div className="absolute -mt-30 ml-30 z-50">
                  {grainDropped && hotWaterDropped && (
                    <motion.img
                      drag
                      src="/pipette.png"
                      alt="Pipette"
                      className="w-24"
                      dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
                      onDragEnd={(_event, info) => {
                        if (info.point.y > 200) handleMashingDrop("acid lactic");
                      }}
                    />
                  )}
                </div>

                <div className="absolute w-60 h-60 bg-blue-200 rounded-xl items-center flex flex-col justify-center border-2 border-dashed border-black mt-10 ml-20 z-0">
                  <img
                    src="/kettle.png"
                    alt="Kettle"
                    className="w-50 h-50 absolute bottom-2 z-0"
                  />
                  {grainDropped &&
                    hotWaterDropped &&
                    phLevel === 5.6 &&
                    !isMixing && (
                      <motion.button
                        onClick={() => setIsMixing(true)}
                        className="absolute px-6 py-3 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 transition z-50 -mt-80"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5 }}
                      >
                        Start Mashing
                      </motion.button>
                    )}

                  {grainDropped &&
                    hotWaterDropped &&
                    !isMixing &&
                    (phLevel < 5.5 || phLevel > 5.7) && (
                      <motion.p
                        key="instruction"
                        className="absolute mt-80 font-bold text-gray-500 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        Now, add the lactic acid to adjust the pH level.
                      </motion.p>
                    )}

                  <AnimatePresence mode="wait">
                    {isMixing ? (
                      <motion.div
                        key="mashing"
                        className="text-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.img
                          src="/mashing.png"
                          alt="Mashing"
                          className="w-30 h-30 mt-6 ml-7 z-50"
                          animate={{ x: [-20, 20, -20] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        <p className="mt-2 text-sm">
                          Mashing in progress... {Math.round(progress)}%
                        </p>
                        <div className="w-40 h-4 bg-gray-300 rounded-full mt-2 mx-auto overflow-hidden">
                          <motion.div
                            className="h-full bg-orange-600"
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "linear", duration: 0.1 }}
                          />
                        </div>
                      </motion.div>
                    ) : (
                      (!grainDropped || !hotWaterDropped) && (
                        <p className="-mt-70 text-sm font-bold text-gray-500 text-center">
                          Drag both grained malt and hot water into the mash tun
                        </p>
                      )
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {phIdealReached && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-200 text-green-800 px-6 py-3 rounded-xl shadow-lg text-lg font-semibold z-50"
                      >
                        ✅ Ideal pH reached!
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="absolute top-0 ml-100 bg-gray-100 p-2 rounded-xl shadow-md flex flex-col items-center w-28 h-60">
                    <p className="text-sm font-bold text-blue-700">pH Level</p>
                    <div className="w-full h-24 bg-gray-200 rounded-full mt-2 overflow-hidden flex items-end">
                      <div
                        className="w-full bg-blue-500 transition-all duration-500"
                        style={{ height: `${((7 - phLevel) / 2.8) * 100}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">
                      {phLevel.toFixed(1)}
                    </p>
                  </div>

                  <div className="relative z-10 flex flex-col items-center">
                    <AnimatePresence>
                      {grainDropped && hotWaterDropped && progress === 100 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.5 }}
                          className="flex flex-col items-center space-y-4 mt-100"
                        >
                          <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-3xl font-bold text-green-600"
                          >
                            🎉 Stage Ready!
                          </motion.div>

                          <motion.button
                            onClick={handleStageComplete}
                            className="px-6 py-3 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700 transition"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Complete Stage
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* Sparging Stage */}
            {stage.name === "Sparging" && (
              <div className="relative space-y-10 mt-20">
                {!spargingStarted && (
                  <motion.button
                    onClick={() => {
                      setSpargingStarted(true);
                      const interval = setInterval(() => {
                        setSpargingProgress((prev) => {
                          if (prev >= 100) {
                            clearInterval(interval);
                            setSpargingFlow(true);
                          }
                          return Math.min(prev + 2, 100);
                        });
                      }, 100);
                    }}
                    className="absolute -mt-20 ml-12 px-6 py-3 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 transition"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5 }}
                  >
                    Start Sparging
                  </motion.button>
                )}

                {spargingFlow && (
                  <>
                    {!grainDropped && (
                      <motion.img
                        drag
                        src="/grain-milled.svg"
                        alt="Used Grain"
                        className="absolute ml-25 mt-25 w-15 cursor-grab z-50"
                        dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
                        onDragEnd={(_event, info) => {
                          if (info.point.x > 400) {
                            setGrainDropped(true);
                            setShowDragMessage(false);
                            setTimeout(() => setSpargingComplete(true), 500);
                          }
                        }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                    )}

                    <motion.img
                      drag
                      src="/pitcher.png"
                      alt="Pitcher"
                      className="absolute ml-60 -mt-20 w-20 z-50"
                      dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
                      onDragStart={() => {
                        setIsPouring(true);
                        setFlowProgress(0);
                        const interval = setInterval(() => {
                          setFlowProgress((prev) => {
                            if (prev >= 100) {
                              clearInterval(interval);
                              setIsPouring(false);
                              setShowPourMessage(false);
                              setShowDragMessage(true);
                            }
                            return Math.min(prev + 2, 100);
                          });
                        }, 100);
                      }}
                      onDragEnd={() => setIsPouring(false)}
                      whileDrag={{ rotate: -45 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    />
                  </>
                )}

                {isPouring && (
                  <>
                    {[0, 1, 2].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute ml-[7rem] mt-[4rem] z-40"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 30, opacity: [1, 0] }}
                        transition={{
                          duration: 0.7,
                          delay: i * 0.2,
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "easeInOut",
                        }}
                      >
                        <img src="/water.svg" alt="Drop" className="w-10 h-10" />
                      </motion.div>
                    ))}

                    <div className="absolute ml-60 mt-10 w-20 h-4 bg-gray-300 rounded-full overflow-hidden z-50">
                      <motion.div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${flowProgress}%` }}
                        transition={{ ease: "linear" }}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center w-full px-8 mt-40">
                  <div className="relative w-50 h-60 border rounded-xl bg-amber-100 flex opacity-80 items-center justify-center">
                    <img
                      src="/kettle.png"
                      alt="Kettle"
                      className="w-50 h-50 opacity-90"
                    />
                    {spargingStarted && (
                      <motion.svg
                        width="180"
                        height="200"
                        viewBox="0 0 180 200"
                        className="absolute z-20"
                        style={{ top: 0, left: 0 }}
                      >
                        <motion.path
                          d="M10 10 L10 190 L160 190 L160 160 M160 40 L160 10 L10 10"
                          stroke="#f59e0b"
                          strokeWidth="10"
                          strokeLinecap="round"
                          fill="transparent"
                          strokeDasharray="40 10"
                          strokeDashoffset="0"
                          animate={{ strokeDashoffset: [0, 50] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      </motion.svg>
                    )}
                  </div>

                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute w-40 h-40 bg-gray-300 rounded-lg flex items-center justify-center border border-gray-500 ml-80"
                  >
                    <img src="/waste.png" alt="Waste" className="w-40" />
                  </motion.div>
                </div>

                {spargingStarted && !spargingComplete && (
                  <div className="w-40 h-4 bg-gray-300 rounded-full mt-10 mx-auto">
                    <motion.div
                      className="h-4 bg-amber-500 rounded-full mt-10"
                      animate={{ width: `${spargingProgress}%` }}
                      transition={{ ease: "linear", duration: 0.1 }}
                    />
                    <p className="mt-2 text-sm text-center">
                      Recirculating the wort... {Math.round(spargingProgress)}%
                    </p>
                  </div>
                )}

                {showPourMessage && (
                  <motion.p
                    className="text-center text-sm font-semibold text-blue-700 -mt-23"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    Pour the pitcher over the grains
                  </motion.p>
                )}
                {showDragMessage && (
                  <motion.p
                    className="absolute text-center text-sm font-semibold text-green-700 -mt-22 ml-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    Drag the used grain into the waste
                  </motion.p>
                )}

                <AnimatePresence>
                  {spargingComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col items-center space-y-4 mt-10"
                    >
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-3xl font-bold text-green-600"
                      >
                        🎉 Stage Ready!
                      </motion.div>

                      <motion.button
                        onClick={handleStageComplete}
                        className="px-6 py-3 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700 transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Complete Stage
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Boiling Stage */}
            {stage.name === "Boiling" && (
              <div className="space-y-6">
                <div className="text-center text-gray-600 text-lg font-bold">
                  Drag the hops into the kettle, then start boiling
                </div>

                <div className="flex justify-center gap-8">
                  {!grainDropped && (
                    <>
                      {!isMilling && (
                        <motion.img
                          drag
                          src="/hops.svg"
                          alt="Hops"
                          className="w-14 cursor-grab"
                          dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
                          onDragEnd={(_event, info) => {
                            if (info.point.x > 200) {
                              setIsMilling(true);
                            }
                          }}
                        />
                      )}

                      {!progress && (
                        <motion.img
                          drag
                          src="/hop-yellow.png"
                          alt="Hop Yellow"
                          className="w-14 cursor-grab"
                          dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
                          onDragEnd={(_event, info) => {
                            if (info.point.x > 200) {
                              setProgress(1);
                            }
                          }}
                        />
                      )}
                      {!progress && (
                        <motion.img
                          drag
                          src="/hop-orange.png"
                          alt="Hop Yellow"
                          className="w-14 cursor-grab"
                          dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
                          onDragEnd={(_event, info) => {
                            if (info.point.x > 200) {
                              setProgress(1);
                            }
                          }}
                        />
                      )}
                    </>
                  )}
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative w-60 h-60 border rounded-xl bg-orange-200 flex items-center justify-center">
                    <img src="/kettle.png" alt="Kettle" className="w-60" />
                    {isMilling && (
                      <img
                        src="/hops.svg"
                        alt="Hops in"
                        className="w-6 absolute top-6 left-8"
                      />
                    )}
                    {progress > 0 && (
                      <img
                        src="/hop-yellow.png"
                        alt="Hop-Yellow in"
                        className="w-6 absolute bottom-4 right-8"
                      />
                    )}
                    {progress > 0 && (
                      <img
                        src="/hop-orange.png"
                        alt="Hop-Orange in"
                        className="w-6 absolute bottom-6 right-4"
                      />
                    )}
                    <img
                      src="/temperature-sensor.png"
                      alt="Temperature sensor"
                      className="absolute w-14"
                    ></img>
                  </div>

                  {!grainDropped && !boilingStarted && progress > 0 && (
                    <motion.button
                      onClick={handleStartBoiling}
                      className="mt-6 px-6 py-3 bg-red-600 text-white text-lg rounded-xl hover:bg-red-700 transition"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1 }}
                    >
                      Start Boiling
                    </motion.button>
                  )}

                  {boilingStarted && (
                    <div className="mt-8 flex flex-col items-center">
                      <motion.div
                        className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg mb-4 text-2xl"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        🌡️ {boilingTemperature}°C
                      </motion.div>

                      <div className="w-48 h-4 bg-gray-300 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-red-600"
                          animate={{ width: `${progress}%` }}
                          transition={{ ease: "linear", duration: 0.1 }}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-700">
                        Boiling in progress... {progress}%
                      </p>
                    </div>
                  )}

                  {grainDropped && (
                    <div className="w-full mt-4 px-8">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-red-500 h-3 rounded-full transition-all duration-100"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1 text-center">
                        {progress}%
                      </p>
                      {progress === 100 && (
                        <p className="text-green-600 font-medium text-center mt-2">
                          ✅ Boiling complete!
                        </p>
                      )}
                    </div>
                  )}
                  {progress === 100 && boilingStarted && (
                    <button
                      onClick={handleStageComplete}
                      className="mt-4 px-6 py-3 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700 transition z-10"
                    >
                      Complete Stage
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Cooling Stage */}
            {stage.name === "Cooling" && (
              <div className="relative">
                <div className="flex flex-col items-center mt-10 space-y-6">
                  <p className="text-lg font-semibold text-gray-700 text-center -mt-5">
                    Connect these elements to cool and transfer the wort to the
                    Fermenter
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-10 justify-items-center items-center mt-18">
                  <img src="/kettle.png" alt="Kettle" className="w-24" />
                  <img
                    src="/fermentator.png"
                    alt="Fermentator"
                    className="w-24"
                  />
                  <img src="/chiller.svg" alt="Chiller" className="w-20" />
                </div>

                {connections[4]?.connected && (
                  <>
                    <motion.svg
                      key="conn-0"
                      className="absolute"
                      width="160"
                      height="200"
                      viewBox="0 0 300 100"
                      style={{ left: "calc(51%)", top: "-1rem" }}
                    >
                      <motion.path
                        d="M20 100 L20 0 L300 0 L300 100"
                        stroke="#b8332f"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="transparent"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5 }}
                      />
                    </motion.svg>

                    <motion.svg
                      key="conn-1"
                      className="absolute"
                      width="180"
                      height="-200"
                      viewBox="0 0 300 100"
                      style={{ left: "calc(50%)", top: "3rem" }}
                    >
                      <motion.path
                        d="M0 100 L0 0 L300 0 L300 120"
                        stroke="#3b82f6"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="transparent"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5 }}
                      />
                    </motion.svg>
                  </>
                )}

                {connections[0]?.connected && (
                  <motion.svg
                    key="conn-2"
                    className="absolute"
                    width="120"
                    height="200"
                    viewBox="0 0 180 150"
                    style={{ left: "calc(16.33% + 2rem)", top: "6.5rem" }}
                  >
                    <motion.path
                      d="M0 -40 L80 -40 80 120 L80 180 140 180"
                      stroke="#f59e0b"
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray="20 10"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: -30 }}
                      transition={{
                        duration: 1,
                        ease: "linear",
                        repeat: Infinity,
                      }}
                    />
                  </motion.svg>
                )}

                {connections[1]?.connected && (
                  <motion.svg
                    key="conn-3"
                    className="absolute"
                    width="120"
                    height="200"
                    viewBox="0 0 180 150"
                    style={{ left: "calc(35.33% + 3rem)", top: "6.5rem" }}
                  >
                    <motion.path
                      d="M50 50 L50 100 L50 100 L50 100 L100 100 L100 175 L65 175"
                      stroke="#f59e0b"
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray="20 10"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: 30 }}
                      transition={{
                        duration: 1,
                        ease: "linear",
                        repeat: Infinity,
                      }}
                    />
                  </motion.svg>
                )}

                {connections[2]?.connected && (
                  <motion.svg
                    key="conn-4"
                    className="absolute"
                    width="120"
                    height="30"
                    viewBox="0 0 200 50"
                    style={{ left: "calc(14.33% + 2rem)", top: "19rem" }}
                  >
                    <motion.line
                      x1="0"
                      y1="40"
                      x2="180"
                      y2="40"
                      stroke="#38bdf8"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray="20 10"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: -30 }}
                      transition={{
                        duration: 1,
                        ease: "linear",
                        repeat: Infinity,
                      }}
                    />
                  </motion.svg>
                )}

                {connections[3]?.connected && (
                  <motion.svg
                    key="conn-5"
                    className="absolute"
                    width="120"
                    height="222"
                    viewBox="0 0 200 100"
                    style={{ left: "calc(54%)", top: "13.5rem" }}
                  >
                    <motion.line
                      x1="0"
                      y1="50"
                      x2="180"
                      y2="50"
                      stroke="#b8332f"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray="20 10"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: -30 }}
                      transition={{
                        duration: 1,
                        ease: "linear",
                        repeat: Infinity,
                      }}
                    />
                  </motion.svg>
                )}

                <div className="flex justify-center gap-24 mt-16">
                  <img src="/water-tap.png" alt="Water Tap" className="w-16" />
                  <img
                    src="/counterflow.svg"
                    alt="Counterflow Chiller"
                    className="w-16"
                  />
                  <img src="/hot-water.png" alt="Waste" className="w-16" />
                </div>

                <div className="mt-8 space-y-4">
                  {connections.map((conn, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleConnection(idx)}
                      className={`px-4 py-2 rounded text-black w-full text-left transition-all duration-300
                      ${conn.connected ? "bg-green-600" : "bg-amber-400"}`}
                    >
                      {conn.connected ? "✅" : "🔗"} Connect {conn.from} →{" "}
                      {conn.to}
                    </button>
                  ))}
                  <AnimatePresence>
                    {coolingStarted && (
                      <div className="flex flex-col items-center mt-10 space-y-4">
                        <motion.div
                          className="text-3xl font-mono bg-gray-800 text-green-400 px-4 py-2 rounded"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {Math.round(CoolingTemperature)}°C
                        </motion.div>

                        <div className="w-64 h-4 bg-gray-300 rounded-full overflow-hidden">
                          <motion.div
                            className="h-4 bg-blue-500"
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "linear", duration: 0.1 }}
                          />
                        </div>

                        <p className="text-sm text-gray-600">
                          Cooling in progress... {Math.round(progress)}%
                        </p>

                        {coolingStarted && progress === 100 && (
                          <motion.button
                            className="mt-4 px-6 py-3 bg-green-600 text-white rounded-xl shadow"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            onClick={handleStageComplete}
                          >
                            Complete Stage
                          </motion.button>
                        )}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Fermenting Stage */}
            {stage.name === "Fermenting" && (
              <div className="flex flex-col items-center mt-10 space-y-6">
                <p className="text-sm font-semibold text-gray-700 text-center -mt-0">
                  Drag the Yeast to the Fermenter
                </p>
                <div className="flex justify-center gap-30 mt-40 items-center relative">
                  <img
                    src="/fermentator.png"
                    alt="Fermenter"
                    className="w-40"
                    ref={fermentatorRef}
                  />
                  <img src="/chiller.svg" alt="Chiller" className="w-32" />

                  <div
                    ref={dropZoneRef}
                    className="absolute left-[calc(22%-4rem)] top-[2rem] w-32 h-32"
                    onDragOver={(e) => e.preventDefault()}
                  />
                </div>

                {!yeastPitched && (
                  <motion.img
                    drag
                    dragConstraints={{ top: -300, bottom: 300, left: -300, right: 300 }}
                    dragSnapToOrigin={false}
                    onDragEnd={(_event, info) => checkDrop(info.point)}
                    src="/yeast.svg"
                    alt="Yeast"
                    className="w-12 cursor-grab mx-auto mt-8"
                    whileDrag={{ scale: 1.2 }}
                  />
                )}

                <div className="items-center justify-center mx-auto">
                  <motion.svg
                    key="conn-0"
                    className="absolute"
                    width="400"
                    height="200"
                    viewBox="0 0 400 100"
                    style={{ left: "calc(42%)", top: "18rem" }}
                  >
                    <motion.path
                      d="M20 100 L20 50 L300 50 L300 100"
                      stroke="#b8332f"
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="transparent"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5 }}
                    />
                  </motion.svg>

                  <motion.svg
                    key="conn-1"
                    className="absolute"
                    width="400"
                    height="200"
                    viewBox="0 0 400 100"
                    style={{ left: "calc(43%)", top: "18rem" }}
                  >
                    <motion.path
                      d="M0 100 L0 0 L300 0 L300 100"
                      stroke="#3b82f6"
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="transparent"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5 }}
                    />
                  </motion.svg>
                </div>

                {fermentationStarted && (
                  <div className="left-[calc(50%-4rem)] top-[2.5rem] w-32 h-32 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute bottom-100 left-[43%] w-2 h-2 bg-blue-300 rounded-full"
                        initial={{ y: 0, opacity: 1, x: Math.random() * 30 - 15 }}
                        animate={{
                          y: -80,
                          opacity: 0,
                          x: Math.random() * 30 - 15,
                        }}
                        transition={{
                          duration: 2 + Math.random(),
                          repeat: Infinity,
                          repeatDelay: Math.random() * 2,
                        }}
                      />
                    ))}
                    <div className="text-center mt-8">
                      <p className="text-lg font-semibold">
                        Fermentation Week: {day} / 7
                      </p>
                      <div className="w-full h-4 bg-gray-200 rounded mt-2">
                        <div
                          className="h-full bg-green-500 rounded transition-all"
                          style={{ width: `${(day / 7) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 space-y-4">
                  <button
                    onClick={startFermentation}
                    disabled={!yeastPitched}
                    className={`px-4 py-2 rounded w-full text-black transition-all -mt-20 ${
                      yeastPitched
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    🕒 Start Fermentation
                  </button>

                  {fermentationStarted && day >= 7 && (
                    <>
                      <p className="text-green-600 font-bold text-center mt-4">
                        ✅ Fermentation complete!
                      </p>
                      <motion.button
                        onClick={handleStageComplete}
                        className="mt-4 px-6 py-3 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700 transition w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Complete Stage
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Bottling Stage */}
            {stage.name === "Bottling" && (
              <div className="w-full mt-30">
                <div className="flex justify-between items-end w-full">
                  <div className="items-center">
                    <img
                      src="/fermentator.png"
                      alt="Fermentator"
                      className="w-120"
                    />
                    <span className="mt-2 text-sm text-gray-500">
                      Fermentator
                    </span>
                  </div>

                  <motion.svg
                    key="conn-4"
                    className="w-64 h-32"
                    viewBox="0 0 200 80"
                  >
                    <motion.path
                      d="M0 60 L160 60 L160 5 L200 5"
                      stroke="#f59e0b"
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="transparent"
                      initial={{ pathLength: 0 }}
                      animate={bottlingStarted ? { pathLength: 1 } : { pathLength: 0 }}
                      transition={{ duration: 1 }}
                    />
                  </motion.svg>

                  <div className="flex flex-col items-center">
                    <img
                      src="/bottling-machine.svg"
                      alt="Bottling"
                      className="w-32 mb-4"
                    />
                    <span className="text-sm text-gray-500">Embotelladora</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-6 h-12 border-2 border-gray-400 rounded bg-gradient-to-t from-green-400 to-transparent overflow-hidden"
                          initial={{ height: "0%" }}
                          animate={
                            bottlingStarted ? { height: "100%" } : { height: "0%" }
                          }
                          transition={{
                            delay: bottlingStarted ? i * 0.5 : 0,
                            duration: 1,
                            repeat: bottlingStarted ? Infinity : 0,
                            repeatType: "reverse",
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">Llenado</span>
                  </div>

                  <div className="flex items-end gap-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.img
                        key={i}
                        src="/beer-bottle.png"
                        alt="Bottle"
                        className="w-12 h-12"
                        initial={{ y: -20, opacity: 0 }}
                        animate={
                          bottlingStarted
                            ? { y: 0, opacity: 1 }
                            : { y: -20, opacity: 0 }
                        }
                        transition={{
                          delay: bottlingStarted ? 2 + i * 0.5 : 0,
                          duration: 0.8,
                          repeat: bottlingStarted ? Infinity : 0,
                          repeatDelay: 2,
                        }}
                      />
                    ))}
                    <img src="/box.svg" alt="Box" className="w-20 ml-4" />
                  </div>
                </div>
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setBottlingStarted(true)}
                    className={`bg-blue-600 hover:bg-blue-700 text-black font-semibold px-6 py-2 rounded transition-all duration-300 ${
                      bottlingStarted ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={bottlingStarted}
                  >
                    🚀 Start Bottling
                  </button>
                </div>
                {bottlingStarted && (
                  <motion.button
                    onClick={handleStageComplete}
                    className="mt-10 px-6 py-3 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700 transition ml-35"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Stage Complete
                  </motion.button>
                )}
              </div>
            )}

            {/* Monitoring Stage */}
            {stage.name === "Monitoring" && (
              <div className="p-8 bg-gray-100 rounded-xl shadow-inner">
                <h2 className="text-3xl font-bold mb-8 text-center text-blue-800">
                  📊 Brewing Process Monitoring
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "🌡️ Temp", value: `${temperature}°C`, color: "text-red-600" },
                    { label: "🧪 pH", value: ph, color: "text-blue-600" },
                    { label: "💨 CO₂", value: `${co2} PSI`, color: "text-green-600" },
                    {
                      label: "🎨 Color",
                      value: (
                        <div className="flex flex-col items-center">
                          <div
                            className="w-10 h-10 rounded-full border"
                            style={{ backgroundColor: beerColor }}
                          />
                          <p className="text-sm mt-1">{srm} SRM</p>
                        </div>
                      ),
                      color: "",
                    },
                    { label: "🍺 Alcohol", value: `${abv}% ABV`, color: "text-yellow-700" },
                    { label: "📦 Volumen", value: `${liters}L`, color: "text-purple-700" },
                  ].map((card, index) => (
                    <motion.div
                      key={index}
                      className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-xl transition"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h3 className="text-lg font-semibold mb-2">{card.label}</h3>
                      <motion.p
                        className={`text-2xl font-bold transition-all duration-500 ${card.color}`}
                        key={card.value?.toString()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {card.value}
                      </motion.p>
                    </motion.div>
                  ))}
                </div>

                <div className="w-full h-64 mt-12 bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-center mb-4 text-blue-600">
                    🌡️ Temperature History
                  </h2>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[15, 30]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#1e3a8a"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <motion.button
                  onClick={handleStageComplete}
                  className="mt-10 px-6 py-3 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700 transition ml-35"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Stage Complete
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}