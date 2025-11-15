"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShaderAnimation } from "@/components/ui/shader-animation";

interface BackgroundPathsProps {
  title?: string;
  children?: React.ReactNode;
}

export function BackgroundPaths({
  title = "Background Paths",
  children,
}: BackgroundPathsProps) {
  const words = title.split(" ");

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0">
        <ShaderAnimation />
      </div>

      <div className="container relative z-10 mx-auto flex w-full flex-col items-center px-4 py-16 md:px-6">
        {children ? (
          children
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="mx-auto max-w-3xl space-y-6 text-center text-white"
          >
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
              {words.map((word, wordIndex) => (
                <span key={wordIndex} className="mr-4 inline-block last:mr-0">
                  {word.split("").map((letter, letterIndex) => (
                    <motion.span
                      key={`${wordIndex}-${letterIndex}`}
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        delay: wordIndex * 0.1 + letterIndex * 0.03,
                        type: "spring",
                        stiffness: 150,
                        damping: 25,
                      }}
                      className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>
            <p className="mx-auto max-w-xl text-base font-medium text-white/70 md:text-lg">
              Ambiente moderno e sem distrações para o seu time acessar o sistema interno.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function DemoBackgroundPaths() {
  return <BackgroundPaths title="Background Paths" />;
}
