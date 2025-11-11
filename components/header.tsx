import Link from "next/link";
import { AuthButton } from "./auth/auth-button";

export function Header() {
  return (
    <nav className="w-full flex justify-center h-16">
      <div className="w-full flex items-center justify-end text-sm">
        <div className="flex items-center gap-6 px-5 border-b border-b-foreground p-3 px-5">
          <Link href="#">About</Link>
          <Link href="#">Docs</Link>

          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
