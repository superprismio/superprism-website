"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContactFormModal } from "@/components/shared/contact-form-modal";
import refactoryImg from "../../public/images/refactory.png";

const capabilities = [
  "Application product support and admin workflows",
  "CMS management and content operations",
  "Durable community memory across chat, meetings, docs, and repos",
  "Custom workflow engine for review, approvals, and runtime actions",
];

export function ReferenceImplSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section
      id="platform"
      className="w-full border-t border-border scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto py-24 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
              R&amp;D Initiative
            </p>
            <h2 className="text-4xl font-bold mb-6">The Refactory</h2>
            <p className="text-muted-foreground mb-4">
              The Refactory is our infrastructure initiative for collaborative
              AI communities: an owned, adaptable stack that turns chat,
              meetings, documents, and repositories into usable shared context.
            </p>
            <p className="text-muted-foreground mb-8">
              It gives operators a practical surface for support, content
              management, memory, and workflow automation while keeping the
              system open source, self-hostable, and shaped around the
              community&apos;s real operating model.
            </p>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Capabilities
            </p>
            <ul className="space-y-2 mb-8">
              {capabilities.map((capability) => (
                <li
                  key={capability}
                  className="font-mono text-sm text-foreground flex items-center gap-2"
                >
                  <span className="text-primary">•</span>
                  {capability}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="holographic-shimmer-hover">
                <Link
                  href="https://refactory.superprism.io/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit The Refactory
                  <ArrowUpRight />
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(true)}>
                <MessageSquare />
                Start a Conversation
              </Button>
            </div>
          </div>
          <div className="border border-border">
            <Image
              src={refactoryImg}
              alt="The Refactory platform interface"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
      <ContactFormModal open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  );
}
