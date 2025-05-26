/**
 * Custom 500 Error Page
 * This file serves as a fallback for static export to generate a 500 error page.
 * It redirects to the error.tsx which contains the actual error page contents.
 */
import { redirect } from "next/navigation";

export default function Custom500() {
  // Redirect to the error page defined in app/error.tsx
  redirect("/error");
}
