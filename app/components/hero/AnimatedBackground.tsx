"use client";

import React from "react";
import { NetworkPattern1, NetworkPattern2 } from "../icons/NetworkIcons";

export const AnimatedBackground = () => (
  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
    {/* Gradient blobs */}
    <div className="from-primary/20 animate-float absolute top-0 right-[10%] h-[50%] w-[40%] rounded-full bg-gradient-to-b to-transparent opacity-70 blur-[80px]"></div>
    <div
      className="from-accent/20 animate-float absolute bottom-[10%] left-[5%] h-[40%] w-[30%] rounded-full bg-gradient-to-t to-transparent opacity-70 blur-[60px]"
      style={{ animationDelay: "2s" }}
    ></div>

    {/* Subtle grid pattern */}
    <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-repeat opacity-5"></div>

    {/* Network nodes */}
    <div
      className="animate-float absolute top-20 right-10 h-48 w-48 opacity-20 dark:opacity-30"
      style={{ animationDelay: "1s" }}
    >
      <NetworkPattern1 className="text-primary" size={140} />
    </div>
    <div
      className="animate-float absolute bottom-10 left-10 h-48 w-48 opacity-20 dark:opacity-30"
      style={{ animationDelay: "3s" }}
    >
      <NetworkPattern2 className="text-accent" size={140} />
    </div>
  </div>
);
