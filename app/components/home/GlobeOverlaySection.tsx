"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Route } from "next";

// Simple CSS-based animated globe that always works
const SimpleAnimatedGlobe = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Main globe sphere */}
      <div 
        className="relative animate-spin"
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #5B90B0 0%, #3A5F77 50%, #5B90B0 100%)',
          border: '2px solid #4ECDC4',
          boxShadow: '0 0 30px rgba(91, 144, 176, 0.3), inset 0 0 30px rgba(58, 95, 119, 0.2)',
          animationDuration: '20s',
        }}
      >
        {/* Wireframe lines */}
        <div 
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background: `
              linear-gradient(0deg, transparent 48%, #4ECDC4 49%, #4ECDC4 51%, transparent 52%),
              linear-gradient(90deg, transparent 48%, #4ECDC4 49%, #4ECDC4 51%, transparent 52%),
              radial-gradient(circle at 50% 50%, transparent 60%, #4ECDC4 61%, #4ECDC4 63%, transparent 64%)
            `,
            opacity: 0.6,
            animationDuration: '15s',
            animationDirection: 'reverse',
          }}
        />
        
        {/* Animated tracer lines */}
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `
              linear-gradient(45deg, transparent 48%, #ff6b6b 49%, #ff6b6b 51%, transparent 52%),
              linear-gradient(-45deg, transparent 48%, #4ecdc4 49%, #4ecdc4 51%, transparent 52%)
            `,
            opacity: 0.8,
            animationDuration: '3s',
          }}
        />
        
        {/* Glowing center */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#4ECDC4',
            boxShadow: '0 0 20px #4ECDC4',
            animationDuration: '2s',
          }}
        />
      </div>
      
      {/* Orbiting particles */}
      <div 
        className="absolute inset-0 animate-spin"
        style={{
          animationDuration: '30s',
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: i % 2 === 0 ? '#ff6b6b' : '#4ecdc4',
              boxShadow: `0 0 10px ${i % 2 === 0 ? '#ff6b6b' : '#4ecdc4'}`,
              top: '50%',
              left: '50%',
              transform: `
                translate(-50%, -50%) 
                rotate(${i * 60}deg) 
                translateX(120px)
              `,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '2s',
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Globe Overlay Section Component
 * Features the interactive globe with overlay content
 */
export const GlobeOverlaySection = () => {
  return (
    <section className="py-12 md:py-20 px-4 md:px-6 w-full relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto">
        <div className="relative h-[300px] md:h-[500px] w-full rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl">
          {/* Background gradient */}
          <div 
            className="absolute inset-0 z-0 opacity-15"
            style={{
              background: "linear-gradient(90deg, #3A5F77 0%, #9CAEB8 100%)"
            }}
          />
          
          {/* Globe container */}
          <div className="absolute inset-0 z-10">
            <SimpleAnimatedGlobe />
          </div>

          {/* Content overlay */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center p-4 md:p-6 text-center">
            <div className="max-w-2xl md:max-w-4xl backdrop-blur-sm bg-white/20 dark:bg-black/20 p-4 md:p-6 rounded-t-xl md:rounded-t-2xl">
              <p className="text-xl md:text-4xl font-medium text-[#5B90B0] mb-2 md:mb-3">
                AI Without Borders
              </p>
              <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 leading-tight text-gray-900 dark:text-white">
                Scalable Solutions, Universal Impact
              </h2>
              <p className="mb-4 md:mb-6 text-sm md:text-lg text-white/90 dark:text-gray-100 max-w-lg md:max-w-2xl mx-auto leading-relaxed">
                We deliver trusted AI strategies that scale from regional operations to worldwide expansion—helping your business unlock sustainable growth wherever opportunity arises.
              </p>
              <Link
                href="/#solutions"
                className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 border border-transparent rounded-md font-medium bg-[#5B90B0] text-white hover:bg-[#4a7a96] transition-colors duration-300 text-sm md:text-base"
              >
                Explore Our Solutions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
