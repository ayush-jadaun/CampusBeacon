import { motion } from "framer-motion";

/*
  ================================================
  Re-useable primary button (beacon amber pill)
  ================================================
*/
const ButtonColourfull = ({
  text = "Error",
  type = "submit",
  textsize = "text-base",
  buttonsize = "w-full p-4",
  onClick,
}) => {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={`${buttonsize} bg-beacon text-ink rounded-full font-semibold hover:bg-beacon-soft transition-colors duration-300 ${textsize}`}
      onClick={onClick}
    >
      {text}
    </motion.button>
  );
};

export default ButtonColourfull;
