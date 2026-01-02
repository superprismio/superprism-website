import Image from "next/image";
import Link from "next/link";
import { Copyright } from "lucide-react";
import mobileLogo from "../public/images/SP_logo.png";

export function Footer() {
  return (
    <footer className="w-full flex flex-row items-center justify-between border-t text-xs gap-4 py-4 px-8">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2"><Copyright className="h-3 w-3" /><p>2026</p></div>
        <Image
          alt="Superprism logo"
          className="h-12 w-auto object-cover"
          src={mobileLogo}
        />
      </div>
      <Link
        href="https://twitter.com/superprism"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm hover:text-primary transition-colors"
      >
        @superprism
      </Link>
    </footer>
  );
}
