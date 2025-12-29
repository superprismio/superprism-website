// import { Cta } from "@/components/cta";
// import { createClient } from "@/lib/supabase/server";
import { EarlyAccessForm } from "./early-access-form";

export async function Hero() {
  // const supabase = await createClient();
  // const { data } = await supabase.auth.getClaims();
  // const isAuthenticated = Boolean(data?.claims);
  // const getStartedHref = isAuthenticated ? "/dashboard" : "/auth/login";

  return (
    <div className="flex flex-col gap-6 lg:gap-12 w-full max-w-full px-8 lg:px-20 py-20 lg:py-40 xl:py-60">
      <p className="text-4xl lg:text-6xl max-w-xl text-muted-foreground">
        A collaborative knowledge base that is AI-native and privacy-focused.
      </p>
      <p className="text-base lg:text-xl max-w-xl">
        Superprism refracts your scattered knowledge into focused, powerful
        contexts. Organize your information into distinct spaces, ready to work
        with AI within relevant context. Local-first architecture protects your
        data. Context isolation keeps your AI sharp and relevant.
      </p>
      {/* <div className="flex flex-wrap justify-center gap-4">
        <Cta />
      </div> */}
      <div className="items-center w-full">
        <EarlyAccessForm className="mx-auto w-full max-w-3xl" />
      </div>
    </div>
  );
}
