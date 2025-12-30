import Image from "next/image";
// import Link from "next/link";
// import { AuthButton } from "./auth/auth-button";

export function Header() {
  return (
    <nav className="w-full flex justify-center items-start h-24">
      <Image
        alt="Superprism bg"
        className="absolute lg:pl-60 inset-x-0 w-full object-left -z-10 object-cover overflow-visible min-h-[600px]"
        priority
        src="/images/superprism-0.png"
        width={1920}
        height={600}
      />
      <div className="grid place-items-center w-full max-h-8 p-4">
        <Image
          alt="Superprism logo"
          priority
          sizes="271px"
          className="size-//full object-cover"
          src="/images/SP_logo.png"
          width={271}
          height={271}
        />
      </div>
      {/* <div className="w-2/3 flex items-center justify-end text-sm pr-20">
        <div className="flex items-center gap-6 px-5 border-b border-b-foreground p-3 px-5">
          <Link href="#">About</Link>
          <Link href="#">Docs</Link>

          <AuthButton />
        </div>
      </div> */}
    </nav>
  );
}
