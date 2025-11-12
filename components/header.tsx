import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "./auth/auth-button";
import headerBg from '../public/images/SP_bg-prism.png'

export function Header() {
  return (
    <nav className="w-full flex justify-center h-24">
      <Image alt="Superprism bg"
        className="absolute inset-x-0 w-full -z-10 overflow-visible object-cover min-h-[600px]"
        priority
        src={headerBg}
        />
      <div className="w-1/3 flex items-center justify-start pl-20">
        <Image
          alt="Superprism logo"
          height={120}
          priority
          src="/images/SP_logo.png"
          width={200}
        />
      </div>
      <div className="w-2/3 flex items-center justify-end text-sm pr-20">
        <div className="flex items-center gap-6 px-5 border-b border-b-foreground p-3 px-5">
          <Link href="#">About</Link>
          <Link href="#">Docs</Link>

          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
