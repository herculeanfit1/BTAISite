import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Contact Us | Bridging Trust AI",
  description:
    "Get in touch with our team to learn how we can help you implement ethical and transparent AI solutions for your business.",
};

export default function ContactPage() {
  redirect("/#contact");
}
