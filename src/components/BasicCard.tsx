import React from "react";
import Link from "next/link";
import { Route } from "next";

interface BasicCardProps {
  title: string;
  description: string;
  href: Route<string>;
}

export const BasicCard = ({ title, description, href }: BasicCardProps) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h3 className="mb-3 text-xl font-bold dark:text-white">{title}</h3>
      <p className="mb-4 text-gray-600 dark:text-gray-300">{description}</p>
      <Link href={href} className="text-primary hover:underline">
        Learn more
      </Link>
    </div>
  );
};
