import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-ink z-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center relative z-10"
      >
        <div className="w-20 h-20 mx-auto relative">
          <div className="absolute inset-0 animate-ping bg-beacon rounded-full opacity-40" />
          <div className="absolute inset-[22%] bg-beacon rounded-full shadow-[0_0_40px_8px_rgba(255,178,36,0.45)]" />
        </div>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6 font-display italic text-2xl md:text-3xl font-semibold text-paper"
        >
          Lighting the <span className="text-beacon not-italic">beacon</span>…
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex justify-center gap-2 mt-5"
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-beacon"
              style={{ animation: `bounce 1s infinite ${i * 0.2}s` }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
