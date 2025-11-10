import Link from "next/link";
import { AuthButton } from "./auth/auth-button";

export function Header() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground h-16">
      <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center">
          <Link href={"/"}>Superprism</Link>
        </div>
        <AuthButton />
      </div>
    </nav>
  );
}
