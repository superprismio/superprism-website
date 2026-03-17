import Image from "next/image";
import chromaOrb from "../public/images/chroma_orb.png";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { HeroSection } from "@/components/home/hero-section";
import { ProblemSection } from "@/components/home/problem-section";
import { ResearchAreasSection } from "@/components/home/research-areas-section";
import { ReferenceImplSection } from "@/components/home/reference-impl-section";
import { AppliedResearchSection } from "@/components/home/applied-research-section";
import { ThesisSection } from "@/components/home/thesis-section";
import { ContactSection } from "@/components/home/contact-section";

export default function Home() {
  return (
    <div className="flex-1 w-full flex flex-col">
      <Header />
      <HeroSection />
      <ProblemSection />
      <ResearchAreasSection />
      <ReferenceImplSection />
      <AppliedResearchSection />
      <div className="relative overflow-hidden">
        <Image
          alt=""
          src={chromaOrb}
          fill
          className="object-cover object-center opacity-50"
          aria-hidden="true"
        />
        <ThesisSection />
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
}
