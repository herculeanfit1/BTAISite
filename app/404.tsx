/**
 * Fallback 404 Page
 * This file serves as a fallback for static export to generate a 404 page.
 * It redirects to the not-found.tsx which contains the actual 404 page contents.
 */
import { redirect } from "next/navigation";

export default function Custom404() {
  // Redirect to the not-found page defined in app/not-found.tsx
  redirect("/not-found");
}
