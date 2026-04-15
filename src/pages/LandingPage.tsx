import { motion } from "framer-motion";

const LandingPage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="relative h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-amber-200">
<motion.div
  className="absolute top-0 left-0 w-full overflow-hidden z-0"
  animate={{ y: [0, 20, 0] }}
  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
>
  <img src="/foam-top.png" alt="Foam overflow" className="w-full opacity-80 blur-sm" />
</motion.div>

      <motion.div 
      className="absolute top-4 left-1/2 transform -translate-x-1/2"
      initial={{opacity:0, y: -40}}
      animate={{opacity: 1, y: 0}}
      transition={{ duration: 1, ease: "easeOut"}}
      >
        <img
        src="/logo_full_black.png"
        alt="Logo Leonardo"
        className="w-auto h-16 onbject-contain"
        />
      </motion.div>

      <motion.h1
        className="text-5xl md:text-8xl font-extrabold bg-amber-200 px-8 py-4 rounded-full inline-block text-amber-800 mb-12 drop-shadow-lg"
        style={{fontFamily: 'Bungee, sans-serif'}}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: "backOut" }}
      >
        🍺 Brewing Simulator
      </motion.h1>
      <motion.button
        onClick={onStart}
        className="relative mt-20 px-8 py-4 bg-amber-500 text-white text-xl rounded-lg shadow-lg hover:bg-amber-700 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        🎮 Start Gaming
      </motion.button>
    </div>
  );
};

export default LandingPage;
