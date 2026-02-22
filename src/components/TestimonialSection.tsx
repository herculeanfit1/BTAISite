"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface Testimonial {
  quote: string;
  author: string;
  title: string;
  company: string;
  image?: string;
  rating?: number;
}

interface TestimonialSectionProps {
  title: string;
  subtitle?: string;
  testimonials: Testimonial[];
  className?: string;
}

export const TestimonialSection = ({
  title,
  subtitle,
  testimonials,
  className = "",
}: TestimonialSectionProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((current) =>
      current === 0 ? testimonials.length - 1 : current - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((current) =>
      current === testimonials.length - 1 ? 0 : current + 1
    );
  };

  // Safely retrieve the current testimonial to avoid object injection warnings
  const getCurrentTestimonial = (): Testimonial => {
    // Ensure the activeIndex is valid
    if (activeIndex >= 0 && activeIndex < testimonials.length) {
      return (
        // eslint-disable-next-line security/detect-object-injection -- activeIndex is bounds-checked above
        testimonials[activeIndex] || {
          quote: "",
          author: "",
          title: "",
          company: "",
        }
      );
    }
    // Fallback to first testimonial or empty object if array is empty
    return (
      testimonials[0] || {
        quote: "",
        author: "",
        title: "",
        company: "",
      }
    );
  };

  const currentTestimonial = getCurrentTestimonial();

  return (
    <section className={`dark:bg-dark/50 bg-gray-50 py-20 ${className}`}>
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-300 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto max-w-3xl text-lg text-gray-700 dark:text-gray-300">
              {subtitle}
            </p>
          )}
        </div>

        {/* Testimonial Carousel */}
        <div className="relative mx-auto max-w-4xl">
          {/* Current Testimonial */}
          <div className="dark:bg-dark/80 rounded-xl bg-white p-8 shadow-lg md:p-12 dark:bg-gray-800">
            <div className="flex flex-col gap-8 md:flex-row md:items-center">
              <div className="md:flex-1">
                {/* Rating Stars */}
                {currentTestimonial.rating && (
                  <div className="mb-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
                          i < (currentTestimonial.rating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}

                {/* Quote */}
                <blockquote className="mb-6 text-xl font-medium text-gray-900 italic md:text-2xl dark:text-gray-300 dark:text-white">
                  "{currentTestimonial.quote}"
                </blockquote>

                {/* Author Info */}
                <div>
                  <div className="font-bold text-gray-900 dark:text-gray-300 dark:text-white">
                    {currentTestimonial.author}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 dark:text-gray-400">
                    {currentTestimonial.title}, {currentTestimonial.company}
                  </div>
                </div>
              </div>

              {/* Profile Image */}
              <div className="flex shrink-0 justify-center">
                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-200 md:h-32 md:w-32 dark:bg-gray-700">
                  {currentTestimonial.image ? (
                    <Image
                      src={
                        currentTestimonial.image ||
                        "/images/placeholder-avatar.png"
                      }
                      alt={currentTestimonial.author}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg
                        className="h-12 w-12 text-gray-400 dark:text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={handlePrev}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-700 shadow-md transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label="Previous testimonial"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-700 shadow-md transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label="Next testimonial"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="mt-6 flex justify-center">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`mx-1 h-3 w-3 rounded-full ${
                  index === activeIndex
                    ? "bg-primary"
                    : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
