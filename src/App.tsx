import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import BrewingStage from "./pages/BrewingStage";

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <>
      {gameStarted ? (
        <BrewingStage />
      ) : (
        <LandingPage onStart={() => setGameStarted(true)} />
      )}
    </>
  );
}

export default App;
