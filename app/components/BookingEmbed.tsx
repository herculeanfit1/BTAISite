"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BookingEmbedProps {
  title?: string;
  description?: string;
  height?: string;
  className?: string;
}

export const BookingEmbed = ({
  title = "Schedule a Consultation",
  description = "Book a time to discuss your AI implementation needs with our team.",
  height = "700px",
  className = "",
}: BookingEmbedProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [useCalendly, setUseCalendly] = useState(false);

  useEffect(() => {
    // Determine if we should use MS Bookings or Calendly
    // This could be based on environment variables or other configuration
    const shouldUseCalendly = process.env.NEXT_PUBLIC_USE_CALENDLY === "true";
    setUseCalendly(shouldUseCalendly);

    // Set loaded state after a small delay to prevent flickering
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Microsoft Bookings iframe URL (replace with your actual Bookings URL)
  const msBookingsUrl =
    "https://outlook.office365.com/owa/calendar/BridgingTrustAI@bridgingtrustai.com/bookings/";

  // Calendly iframe URL (replace with your actual Calendly URL)
  const calendlyUrl = "https://calendly.com/bridgingtrustai/consultation";

  const bookingUrl = useCalendly ? calendlyUrl : msBookingsUrl;

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-300 dark:text-white">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>

      <div className="w-full overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
        {!isLoaded && (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-2 border-b-2"></div>
          </div>
        )}

        <iframe
          src={bookingUrl}
          frameBorder="0"
          style={{
            width: "100%",
            height,
            overflow: "hidden",
            visibility: isLoaded ? "visible" : "hidden",
          }}
          title="Schedule a meeting"
          data-testid="booking-iframe"
          loading="lazy"
        ></iframe>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Prefer to schedule via email? Contact us at{" "}
          <Link href="mailto:bookings@bridgingtrustai.com" className="link">
            bookings@bridgingtrustai.com
          </Link>
        </p>
      </div>
    </div>
  );
};
