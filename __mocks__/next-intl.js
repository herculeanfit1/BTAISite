module.exports = {
  useTranslations: jest.fn().mockImplementation(() => (key) => {
    // A simple lookup table for common translations for testing
    const translations = {
      services: "Services",
      about: "About",
      blog: "Blog",
      contact: "Contact",
      home: "Home",
      careers: "Careers",
      getStarted: "Get Started",
      learnMore: "Learn More",
      subscribe: "Subscribe",
      bookConsultation: "Book a Consultation",
      sendMessage: "Send Message",
    };

    // If the key is in the lookup table, return it, otherwise return the key itself
    return translations[key] || key;
  }),
  useLocale: jest.fn().mockReturnValue("en"),
  NextIntlClientProvider: ({ children }) => children,
};
