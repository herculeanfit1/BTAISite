import Link from "next/link";

/**
 * DesktopNav Component
 *
 * Desktop navigation menu with hover effects
 */
export const DesktopNav = () => {
  return (
    <div className="ml-auto flex items-center">
      {/* Solutions link with hover underline effect */}
      <Link
        href="/#solutions"
        className="group relative mr-6 inline-block overflow-hidden px-4 py-2 text-lg font-semibold text-blue-500 transition-colors hover:text-slate-600"
      >
        <span className="relative z-10">Solutions</span>
        <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
      </Link>

      {/* About link with hover underline effect */}
      <Link
        href="/#about"
        className="group relative mr-6 inline-block overflow-hidden px-4 py-2 text-lg font-semibold text-blue-500 transition-colors hover:text-slate-600"
      >
        <span className="relative z-10">About</span>
        <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
      </Link>

      {/* Contact button styled as a call-to-action */}
      <Link
        href="/#contact"
        className="rounded-lg bg-blue-500 px-5 py-2 text-lg font-semibold text-white transition-all hover:bg-slate-600 hover:shadow-md"
      >
        Contact
      </Link>
    </div>
  );
};
