"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const flipVariants = {
  enter: (direction) => ({
    rotateY: direction > 0 ? 90 : -90,
    opacity: 0,
  }),
  center: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  exit: (direction) => ({
    rotateY: direction < 0 ? 90 : -90,
    opacity: 0,
    transition: { duration: 0.6, ease: "easeIn" },
  }),
};

export default function PageFlipper({ pages, currentPage, onPageChange }) {
  const [direction, setDirection] = useState(0);

  const goToPage = (newPage) => {
    if (newPage < 0 || newPage >= pages.length) return;
    setDirection(newPage > currentPage ? 1 : -1);
    onPageChange(newPage);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return (
    <div className="page-flipper" style={{ perspective: "1200px" }}>
      <div className="page-container" style={{ position: "relative", width: "100%", minHeight: "80vh" }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={flipVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            {pages[currentPage]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="controls" style={{ display: "flex", justifyContent: "center", gap: "1rem", padding: "1rem" }}>
        <button onClick={prevPage} disabled={currentPage === 0}>
          Page precedente
        </button>
        <span>
          {currentPage + 1} / {pages.length}
        </span>
        <button onClick={nextPage} disabled={currentPage === pages.length - 1}>
          Page suivante
        </button>
      </div>
    </div>
  );
}
