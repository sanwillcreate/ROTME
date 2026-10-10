
"use client";

import React, { createContext, useContext, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { MotionValue } from "framer-motion";

const MouseContext = createContext<{
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
} | null>(null);

export const DraggableCardContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <MouseContext.Provider value={{ mouseX, mouseY }}>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className={className}
      >
        {children}
      </div>
    </MouseContext.Provider>
  );
};

export const DraggableCardBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const context = useContext(MouseContext);

  if (!context) {
    throw new Error(
      "DraggableCardBody must be used inside DraggableCardContainer"
    );
  }

  const { mouseX, mouseY } = context;

  const rotateX = useTransform(mouseY, [0, 460], [5, -5]);
  const rotateY = useTransform(mouseX, [0, 700], [-5, 5]);

  const springRotateX = useSpring(rotateX, {
    stiffness: 300,
    damping: 30,
  });

  const springRotateY = useSpring(rotateY, {
    stiffness: 300,
    damping: 30,
  });

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.12}
      whileTap={{ cursor: "grabbing" }}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        x: "-50%",
        y: "-50%",
        rotateX: springRotateX,
        rotateY: springRotateY,
        touchAction: "none",
      }}
      className={`cursor-grab border border-white/10 shadow-2xl ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
};
