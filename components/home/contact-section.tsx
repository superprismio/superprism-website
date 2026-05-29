"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContactFormModal } from "@/components/shared/contact-form-modal";

const partnershipTypes = [
  {
    title: "Research Partnerships",
    description: "Teams experimenting with collaborative AI systems.",
  },
  {
    title: "Applied Implementations",
    description:
      "Organizations integrating AI into complex coordination workflows.",
  },
  {
    title: "Funding & Grants",
    description:
      "Support our research into privacy-preserving and decentralized AI infrastructure.",
  },
];

export function ContactSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section
      id="contact"
      className="relative z-10 w-full border-t border-border scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto py-24 px-6">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Work With Us</h2>
          <p className="text-muted-foreground">
            Superprism works closely with organizations exploring new ways of
            enhancing collaboration with AI.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {partnershipTypes.map((type) => (
            <div key={type.title} className="bg-card border border-border p-6">
              <h3 className="font-semibold mb-2">{type.title}</h3>
              <p className="text-sm text-muted-foreground">
                {type.description}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Button
            className="holographic-shimmer-hover"
            onClick={() => setModalOpen(true)}
          >
            Start a Conversation
          </Button>
          <Button asChild variant="outline">
            <Link href="/research">Follow Our Research</Link>
          </Button>
        </div>
      </div>

      <ContactFormModal open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  );
}
