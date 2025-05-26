"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface SocialShareProps {
  title: string;
  description?: string;
  className?: string;
  platforms?: ("twitter" | "facebook" | "linkedin" | "email" | "copy")[];
  vertical?: boolean;
}

export const SocialShare = ({
  title,
  description = "",
  className = "",
  platforms = ["twitter", "facebook", "linkedin", "email", "copy"],
  vertical = false,
}: SocialShareProps) => {
  const pathname = usePathname();
  const [copied, setCopied] = React.useState(false);
  const [url, setUrl] = useState("");

  // Set the full URL after component mounts to avoid SSR mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(`${window.location.origin}${pathname}`);
    }
  }, [pathname]);

  // Create sharing URLs for each platform
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url || "")}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || "")}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || "")}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url || ""}`)}`,
  };

  // Copy URL to clipboard
  const copyToClipboard = () => {
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div
      className={`${className} ${vertical ? "flex flex-col space-y-3" : "flex flex-row space-x-3"}`}
    >
      {platforms.includes("twitter") && (
        <Link
          href={shareUrls.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 transition-transform hover:scale-110 hover:text-[#1DA1F2] dark:text-gray-300 dark:hover:text-[#1DA1F2]"
          aria-label="Share on Twitter"
        >
          <svg
            className="h-6 w-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        </Link>
      )}

      {platforms.includes("facebook") && (
        <Link
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 transition-transform hover:scale-110 hover:text-[#4267B2] dark:text-gray-300 dark:hover:text-[#4267B2]"
          aria-label="Share on Facebook"
        >
          <svg
            className="h-6 w-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      )}

      {platforms.includes("linkedin") && (
        <Link
          href={shareUrls.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 transition-transform hover:scale-110 hover:text-[#0077B5] dark:text-gray-300 dark:hover:text-[#0077B5]"
          aria-label="Share on LinkedIn"
        >
          <svg
            className="h-6 w-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      )}

      {platforms.includes("email") && (
        <Link
          href={shareUrls.email}
          className="hover:text-primary dark:hover:text-primary text-gray-700 transition-transform hover:scale-110 dark:text-gray-300"
          aria-label="Share via Email"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </Link>
      )}

      {platforms.includes("copy") && (
        <button
          onClick={copyToClipboard}
          className="hover:text-primary dark:hover:text-primary text-gray-700 transition-transform hover:scale-110 dark:text-gray-300"
          aria-label="Copy link"
        >
          {copied ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};
