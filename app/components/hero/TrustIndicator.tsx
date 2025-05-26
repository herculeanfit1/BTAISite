"use client";

import React, { ReactNode } from "react";
import { CheckCircleIcon } from "../icons/NetworkIcons";

interface TrustIndicatorProps {
  text: string;
  icon?: ReactNode;
}

export const TrustIndicator = ({ text, icon }: TrustIndicatorProps) => (
  <div className="dark:bg-dark/50 flex items-center rounded-full bg-white/50 px-4 py-2 backdrop-blur-sm">
    <div className="bg-primary/20 text-primary mr-3 flex h-8 w-8 items-center justify-center rounded-full">
      {icon || <CheckCircleIcon size={16} />}
    </div>
    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
      {text}
    </span>
  </div>
);
