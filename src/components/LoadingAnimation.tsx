"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const LoadingAnimation = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="relative">
        <motion.div
          className="relative w-32 h-32"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 0, 0],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <Image
            src="/logo.svg"
            alt="VideoApp Logo"
            width={128}
            height={128}
            className="text-primary"
            priority
          />
        </motion.div>

        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary/20"
          initial={{ scale: 0.5, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{
            duration: 1,
            ease: "easeOut",
            repeat: Infinity,
          }}
        />

        {/* Loading text */}
        <motion.p
          className="mt-8 text-center text-sm font-medium text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Loading VideoApp...
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingAnimation; 
