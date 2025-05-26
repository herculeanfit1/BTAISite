"use client";

import React, { useState } from "react";
import Image from "next/image";

// Define prop interface for the component
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  blurDataURL?: string;
  onLoad?: () => void;
}

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  aspectRatio = "16/9",
  className = "",
  priority = false,
  fill = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 85,
  objectFit = "cover",
  objectPosition = "center",
  blurDataURL,
  onLoad,
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(!priority); // If priority is true, don't show loading state

  // Handle image load completion
  const handleImageLoad = () => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  // Generate a simple blur placeholder if not provided
  const defaultBlurDataURL =
    blurDataURL ||
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImcxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBzdG9wLWNvbG9yPSIjZWVlIiBvZmZzZXQ9IjIwJSIgLz48c3RvcCBzdG9wLWNvbG9yPSIjZmZmIiBvZmZzZXQ9IjUwJSIgLz48c3RvcCBzdG9wLWNvbG9yPSIjZWVlIiBvZmZzZXQ9IjgwJSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cxKSIgLz48L3N2Zz4=";

  // Define wrapper styles for aspect ratio if not using fill
  const wrapperStyle = !fill
    ? {
        aspectRatio,
        position: "relative" as const,
      }
    : {};

  // Create object for styling classes
  const imageClasses = `transition-opacity duration-500 ${isLoading ? "opacity-60" : "opacity-100"} object-${objectFit} object-${objectPosition}`;

  const commonImageProps = {
    src,
    alt,
    quality,
    sizes,
    className: imageClasses,
    placeholder: "blur" as const,
    blurDataURL: defaultBlurDataURL,
    onLoad: handleImageLoad,
    priority,
  };

  return (
    <div
      className={`overflow-hidden ${fill ? "relative" : ""} ${className}`}
      style={wrapperStyle}
    >
      {fill ? (
        <Image {...commonImageProps} fill={fill} />
      ) : (
        <Image {...commonImageProps} width={width} height={height} />
      )}
    </div>
  );
};

export default OptimizedImage;
