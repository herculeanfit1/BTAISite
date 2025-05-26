import Link from "next/link";

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

/**
 * MobileNav Component
 *
 * Mobile navigation menu with hamburger toggle
 */
export const MobileNav = ({ isOpen, setIsOpen }: MobileNavProps) => {
  return (
    <>
      {/* Mobile Menu Button - hide on desktop */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-3 right-6 text-gray-600 focus:outline-none"
          aria-label="Toggle menu"
        >
          {!isOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu - only visible when isOpen is true and on small screens */}
      {isOpen && (
        <div className="absolute w-full bg-white shadow-lg md:hidden">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/#solutions"
                className="py-2 font-semibold text-[#5B90B0] transition-colors hover:text-[#3A5F77]"
                onClick={() => setIsOpen(false)}
              >
                Solutions
              </Link>
              <Link
                href="/#about"
                className="py-2 font-semibold text-[#5B90B0] transition-colors hover:text-[#3A5F77]"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/#contact"
                className="py-2 font-semibold text-[#5B90B0] transition-colors hover:text-[#3A5F77]"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
