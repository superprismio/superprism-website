"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import heroImg from "../../public/images/superprism-0.png";
import { Button } from "@/components/ui/button";
import { ContactFormModal } from "@/components/shared/contact-form-modal";

export function HeroSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="w-full">
      <Image
        alt="Superprism bg"
        className="absolute lg:pl-60 inset-x-0 w-full object-left -z-10 object-cover overflow-visible min-h-[600px] top-0"
        priority
        src={heroImg}
      />
      <div className="flex-1 w-full flex flex-col items-center mt-60 lg:mt-40 relative z-0">
        <div className="flex flex-col gap-6 lg:gap-12 w-full max-w-full px-8 lg:px-20 py-20 lg:py-40 xl:py-60">
          <p className="text-4xl lg:text-6xl max-w-xl text-muted-foreground">
            Superprism. Infrastructure for Collaborative AI
          </p>
          <p className="text-base lg:text-2xl max-w-xl">
            <i>
              Superprism is an{" "}
              <strong className="text-foreground">
                R&D lab for human-agent coordination
              </strong>
              . We research and build systems where humans and AI agents
              generate shared context together — without sacrificing privacy or
              sovereignty.
            </i>
          </p>
          {/* <div className="items-start w-full">
            <EarlyAccessForm className="w-full max-w-xl" />
          </div> */}
          <div className="flex items-center gap-4 mt-10">
            <Button asChild className="holographic-shimmer-hover">
              <Link href="#research">Explore Our Research</Link>
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              Partner With Us
            </Button>
          </div>
        </div>
      </div>

      <ContactFormModal open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  );
}
