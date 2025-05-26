/**
 * Type definitions for route-aware links in Next.js
 *
 * This file provides type definitions to make paths statically typed
 * when using Next.js Link components.
 */

/**
 * For Next.js 15, the href prop on Link components expects Route<string> or URL
 * which is a bit more strict than in previous versions.
 *
 * The simplest solution is to make sure all href strings are cast as Route<string>
 * when passing them to Link components, e.g.:
 *   <Link href={'/about' as Route<string>}>About</Link>
 *
 * This file provides a type helper for that pattern.
 */
import { Route } from "next";

/**
 * Define types for the application routes to provide type safety when linking
 */
export type AppRoutes =
  | "/"
  | "/about"
  | "/contact"
  | "/privacy"
  | "/terms"
  | "/coming-soon";

// Type for dynamic route paths (with :param or [param])
export type DynamicRoute = string;

// Type for href props in Link components
export type LinkHref = Route<string>;

// For backward compatibility if needed
export type AppRoute<T extends string> = T;
