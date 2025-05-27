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
        className="relative"
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #5B90B0 0%, #3A5F77 50%, #5B90B0 100%)',
          border: '2px solid #4ECDC4',
          boxShadow: '0 0 30px rgba(91, 144, 176, 0.3), inset 0 0 30px rgba(58, 95, 119, 0.2)',
          animation: 'globeRotate 20s linear infinite',
        }}
      >
        {/* Wireframe lines */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              linear-gradient(0deg, transparent 48%, #4ECDC4 49%, #4ECDC4 51%, transparent 52%),
              linear-gradient(90deg, transparent 48%, #4ECDC4 49%, #4ECDC4 51%, transparent 52%),
              radial-gradient(circle at 50% 50%, transparent 48%, #4ECDC4 49%, #4ECDC4 51%, transparent 52%)
            `,
            opacity: 0.6,
            animation: 'wireframeRotate 15s linear infinite reverse',
          }}
        />
        
        {/* Glowing points */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
            style={{
              top: `${20 + Math.sin(i * 0.5) * 30}%`,
              left: `${20 + Math.cos(i * 0.7) * 30}%`,
              boxShadow: '0 0 8px #4ECDC4',
              animation: `pointFloat ${3 + i * 0.2}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
        
        {/* Connection lines */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute bg-blue-400"
            style={{
              width: '1px',
              height: '60px',
              top: `${10 + i * 10}%`,
              left: `${30 + Math.sin(i) * 20}%`,
              transformOrigin: 'bottom',
              transform: `rotate(${i * 45}deg)`,
              opacity: 0.4,
              animation: `lineGlow ${2 + i * 0.3}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes globeRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes wireframeRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pointFloat {
          from { transform: translateY(0px) scale(1); opacity: 0.8; }
          to { transform: translateY(-5px) scale(1.2); opacity: 1; }
        }
        
        @keyframes lineGlow {
          from { opacity: 0.2; transform: scaleY(0.8); }
          to { opacity: 0.6; transform: scaleY(1.2); }
        }
      `}</style>
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
