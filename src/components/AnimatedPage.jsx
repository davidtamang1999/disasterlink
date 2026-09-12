import { motion } from "framer-motion";

const slideRight = {
  initial: { 
    x: 300, 
    opacity: 0      // Invisible at start
  },
  animate: { 
    x: 0, 
    opacity: 1      // Fully visible at end
  },
  exit: { 
    x: -300, 
    opacity: 0      // Fades out while sliding left
  }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.05
};

const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideRight}
      transition={pageTransition}
      className="w-full h-full overflow-hidden"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;