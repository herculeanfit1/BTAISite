"use client";

import React from "react";
import { PlaceholderNetworkIcon } from "../icons/NetworkIcons";

export const PlaceholderImage = () => (
  <div className="group relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
    {/* Subtle background pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="bg-grid-pattern absolute inset-0"></div>
    </div>

    {/* Center icon with subtle animation */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-2/3 w-2/3 transition-all duration-3000 group-hover:opacity-90">
        <div className="from-primary/10 to-accent/10 absolute inset-0 transform rounded-2xl bg-gradient-to-br backdrop-blur-sm transition-transform duration-2000 group-hover:translate-y-[-4px]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <PlaceholderNetworkIcon
            className="text-primary h-1/2 w-1/2 opacity-80 transition-transform duration-2000 group-hover:scale-110 dark:text-white/70"
            size={48}
          />
        </div>
      </div>
    </div>

    {/* Subtle glowing particles */}
    <div className="bg-primary animate-pulse-soft absolute top-1/4 right-1/4 h-1 w-1 rounded-full opacity-50"></div>
    <div
      className="bg-accent animate-pulse-soft absolute bottom-1/3 left-1/3 h-2 w-2 rounded-full opacity-50"
      style={{ animationDelay: "1s" }}
    ></div>
    <div
      className="bg-primary animate-pulse-soft absolute top-1/2 left-1/4 h-1 w-1 rounded-full opacity-50"
      style={{ animationDelay: "2s" }}
    ></div>

    {/* Subtle connection lines */}
    <svg
      className="absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="25%"
        y1="25%"
        x2="50%"
        y2="50%"
        strokeWidth="0.5"
        stroke="currentColor"
        strokeOpacity="0.1"
      />
      <line
        x1="75%"
        y1="25%"
        x2="50%"
        y2="50%"
        strokeWidth="0.5"
        stroke="currentColor"
        strokeOpacity="0.1"
      />
      <line
        x1="25%"
        y1="75%"
        x2="50%"
        y2="50%"
        strokeWidth="0.5"
        stroke="currentColor"
        strokeOpacity="0.1"
      />
      <line
        x1="75%"
        y1="75%"
        x2="50%"
        y2="50%"
        strokeWidth="0.5"
        stroke="currentColor"
        strokeOpacity="0.1"
      />
    </svg>
  </div>
);
