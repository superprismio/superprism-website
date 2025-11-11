import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function Hero() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);
  const getStartedHref = isAuthenticated ? "/dashboard" : "/auth/login";

  return (
    <div className="flex flex-col gap-12 items-center w-full py-20">
      <div className="flex justify-center">
        <Image
          alt="Superprism logo"
          height={120}
          priority
          src="/images/logo.png"
          width={200}
        />
      </div>
      <p className=" lg:text-4xl mx-auto max-w-xl text-center">
        A collaborative workspace that is local first ad AI-native
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href={getStartedHref}>Get started</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="#">Read Docs</Link>
        </Button>
      </div>
    </div>
  );
}
