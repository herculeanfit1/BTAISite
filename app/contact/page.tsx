import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Bridging Trust AI about a custom AI build, a productized solution, or whether AI is the right tool for the workflow you are trying to fix.",
};

export default function ContactPage() {
  redirect("/#contact");
}
