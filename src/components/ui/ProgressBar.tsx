import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

interface ProgressBarProps {
  isLoading: boolean;
  className?: string;
  color?: string;
}

export const ProgressBar = ({ isLoading, className, color = "bg-emerald-500" }: ProgressBarProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          const inc = Math.random() * 10;
          return Math.min(prev + inc, 95);
        });
      }, 400);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 500);
      return () => clearTimeout(timeout);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent pointer-events-none", className)}>
      <AnimatePresence>
        {progress > 0 && progress < 100 && (
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            exit={{ opacity: 0 }}
            className={cn("h-full transition-all duration-300 ease-out", color)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
