import Link from "next/link";
import Image from "next/image";

/**
 * Logo Component
 *
 * Displays the company logo and name with gradient text effect
 */
export const Logo = () => {
  return (
    <div className="group flex flex-shrink-0 items-center">
      <Link href="/" className="flex items-center">
        <Image
          src="/images/logo/BTAI_Logo_Original.svg"
          alt="Bridging Trust AI Logo"
          width={83}
          height={83}
          className="mr-2 overflow-hidden rounded-full border-2 border-blue-100 bg-blue-50 object-contain transition-transform duration-300 group-hover:scale-110"
        />
        {/* Company name with gradient text effect */}
        <span className="ml-2 bg-gradient-to-r from-slate-600 to-blue-500 bg-clip-text text-4xl text-xl font-bold text-transparent">
          Bridging Trust AI
        </span>
      </Link>
    </div>
  );
};
