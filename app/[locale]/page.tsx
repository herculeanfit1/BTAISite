import { Metadata } from "next";
import { HeroSection } from "../components/HeroSection";
import { FeatureSection } from "../components/FeatureSection";
import { TestimonialSection } from "../components/TestimonialSection";
import { Timeline } from "../components/Timeline";
import { GlobeOverlaySection } from "../components/home/GlobeOverlaySection";
import { Route } from "next";

export const metadata: Metadata = {
  title: "Bridging Trust AI - Ethical AI Solutions",
  description:
    "Building ethical AI solutions that enhance human capabilities while maintaining transparency.",
};

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Home(props: PageProps) {
  const params = await props.params;
  const { locale } = params;

  // Features data
  const features = [
    {
      title: "Human-Centered Design",
      description: "We put people first in all our AI solutions",
      icon: "UserGroup",
    },
    {
      title: "Ethical Implementation",
      description: "Transparent and responsible AI development",
      icon: "ShieldCheck",
    },
    {
      title: "Custom Solutions",
      description: "Tailored to your specific business needs",
      icon: "Cog",
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      quote:
        "Bridging Trust AI transformed our customer service with their ethical AI approach.",
      author: "Jane Smith",
      title: "CTO",
      company: "Tech Innovations Inc.",
      image: "/images/testimonial-1.jpg",
    },
    {
      quote:
        "Their custom AI solution increased our efficiency while maintaining human oversight.",
      author: "John Davis",
      title: "Director of Technology",
      company: "Global Solutions Ltd.",
      image: "/images/testimonial-2.jpg",
    },
  ];

  return (
    <div className="page-content">
      {/* Hero Section */}
      <HeroSection
        title="Building Trust in AI Solutions"
        subtitle={`We create ethical, transparent AI systems that enhance human capabilities (${locale})`}
        ctaButton={{
          text: "Get Started",
          href: "/#contact" as Route<string>,
        }}
        secondaryButton={{
          text: "Learn More",
          href: "/#about" as Route<string>,
        }}
        hasImagePlaceholder={true}
      />

      {/* Feature Section */}
      <FeatureSection title="Our Approach" features={features} />

      {/* AI Without Borders Section */}
      <GlobeOverlaySection />

      {/* Testimonial Section */}
      <TestimonialSection
        title="What Our Clients Say"
        testimonials={testimonials}
      />

      {/* Timeline Section */}
      <Timeline
        title="Our Process"
        items={[
          {
            title: "Consultation",
            description: "We meet with you to understand your needs and goals.",
          },
          {
            title: "Assessment",
            description:
              "We evaluate your current systems and identify opportunities.",
          },
          {
            title: "Design",
            description:
              "We create a customized AI solution designed with ethics in mind.",
          },
          {
            title: "Development",
            description:
              "We build your solution with transparency throughout the process.",
          },
          {
            title: "Deployment",
            description:
              "We implement your solution and provide training and support.",
          },
        ]}
      />

      {/* Newsletter Section - Hidden until fully implemented */}
      <section className="dark:bg-dark/50 bg-gray-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Coming Soon
            </h2>
            <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
              We're working on additional features to keep you updated with the
              latest in ethical AI development. Check back soon for our
              newsletter and more resources.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
