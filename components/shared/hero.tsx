import Image from "next/image";
import { EarlyAccessForm } from "./early-access-form";
import GlassPyramidWrapper from "./glass-pyramid-wrapper";

export async function Hero() {
  return (
    <div className="flex flex-col gap-6 lg:gap-12 h-[100vh] w-full max-w-full px-8 lg:px-20 py-20 relative overflow-visible">
      {/* <div className="w-[100vw] absolute top-0 left-0 z-0 object-cover">
        <Image src="/hdri/prism.jpeg" alt="Prism" width={1200} height={1200} />
      </div> */}
      <div className="w-full absolute top-0 -right-[15%] z-1 overflow-visible">
        <GlassPyramidWrapper />
      </div>
      
      <div className="relative z-10 pointer-events-none">
      <p className="text-4xl lg:text-6xl max-w-xl text-muted-foreground">
        A collaborative knowledge base that is privacy-focused & AI-native.
      </p>
      <p className="text-base lg:text-xl max-w-xl">
        Superprism refracts your scattered knowledge into focused, powerful
        contexts. Organize your information into distinct spaces, ready to work
        with AI and external tools within your existing workflows.
      </p>
      <p className="text-base lg:text-2xl max-w-xl">
        <i>
          Privacy-first architecture protects your data. Context isolation keeps
          your AI sharp.
        </i>
      </p>
      </div>
      <div className="items-start w-full">
        <EarlyAccessForm className="w-full max-w-xl" />
      </div>
      
    </div>
  );
}
