// import { Cta } from "@/components/cta";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import Image from "next/image";
import spacesImg from "../public/images/sp_graphic-spaces.png";
import projectsImg from "../public/images/sp_graphic-projects.png";
import extendImg from "../public/images/sp_graphic-extend.png";
import sectionBreak from "../public/images/prism_overlay.png"
import sectionBreak2 from "../public/images/prism_landscape.png"
import sectionBreak3 from "../public/images/chroma_orb.png"
import headerBg from "../public/images/superprism-0.png";
import { EarlyAccessForm } from "@/components/early-access-form";

export default function Home() {
  return (
    <div className="flex-1 w-full flex flex-col items-center relative">
      <Image
        alt="Superprism bg"
        className="absolute lg:pl-60 inset-x-0 w-full object-left -z-10 object-cover overflow-visible min-h-[600px] top-0"
        priority
        src={headerBg}
      />
      <Header />
      <div className="flex-1 w-full flex flex-col items-center mt-60 lg:mt-40 relative z-0">
        <Hero />
      </div>
      <div id="how-it-works" className="flex-1 w-full flex flex-col items-center max-w-4xl px-4 lg:px-0 scroll-mt-24">
        <h2 className="text-4xl lg:text-6xl my-8 text-center">How it Works</h2>
        <div className="flex flex-col lg:flex-row w-full mb-8 lg:mb-16 gap-4 lg:gap-0">
          <div className="flex flex-col w-full lg:w-1/2">
            <Image
              alt="Superprism logo"
              width={1200}
              height={1200}
              priority
              src={spacesImg}
              className="w-full h-auto"
            />
          </div>
          <div className="flex flex-col w-full lg:w-1/2 lg:pl-8 justify-center">
            <h3 className="text-xl lg:text-3xl mb-4">
              Build Spaces of Knowledge
            </h3>
            <p className="text-sm lg:text-lg">
              <strong>Create dedicated spaces for different contexts.</strong>
            </p>
            <p className="text-sm lg:text-base mt-4 text-muted-foreground">
              Upload documents, connect data sources, or ingest content from the
              web. Superprism organizes it automatically based on rules you set.
            </p>
            <p className="text-sm lg:text-base mt-4">
              <i>
                Your knowledge stays clean and up to date. No context bleed
                between unrelated work.
              </i>
            </p>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row w-full mb-8 lg:mb-16 gap-4 lg:gap-0">
          <div className="flex flex-col w-full lg:w-1/2">
            <Image
              alt="Superprism logo"
              width={1200}
              height={1200}
              priority
              src={projectsImg}
              className="w-full h-auto"
            />
          </div>
          <div className="flex flex-col w-full lg:w-1/2 lg:pl-8 justify-center">
            <h3 className="text-xl lg:text-3xl mb-4">
              Run Projects Within Spaces
            </h3>
            <p className="text-md lg:text-lg">
              <strong>
                Launch projects that use your space&apos;s knowledge as
                foundation.
              </strong>
            </p>
            <p className="text-sm lg:text-base mt-4 text-muted-foreground">
              Chat with your knowledge base, generate reports, create summaries,
              build documentation. Projects can pull in additional context
              without polluting your core space—they&apos;re experimental
              branches where only what you choose to keep persists.
            </p>
            <p className="text-sm lg:text-base mt-4">
              <i>Generate what you need. Keep what matters.</i>
            </p>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row w-full mb-8 lg:mb-16 gap-4 lg:gap-0">
          <div className="flex flex-col w-full lg:w-1/2">
            <Image
              alt="Superprism logo"
              width={1200}
              height={1200}
              priority
              src={extendImg}
              className="w-full h-auto"
            />
          </div>
          <div className="flex flex-col w-full lg:w-1/2 lg:pl-8 justify-center">
            <h3 className="text-xl lg:text-3xl mb-4">Share and Extend</h3>
            <p className="text-md lg:text-lg">
              <strong>
                Invite collaborators and connect to external tools and
                workflows.
              </strong>
            </p>
            <p className="text-sm lg:text-base mt-4 text-muted-foreground">
              Generate your own Model Context Protocol (MCP) server to connect
              your organized knowledge to other AI-ready tools. Export selective
              knowledge as wikis, summarized docs or public documentation. Your
              knowledge base becomes infrastructure for your entire workflow.
            </p>
            <p className="text-sm lg:text-base mt-4">
              <i>
                Private by default. Collaborative when you choose. Connect to
                your existing tools.
              </i>
            </p>
          </div>
        </div>
      </div>

      <div className="w-full h-auto relative lg:-mt-40 mb-[180px] lg:mb-[360px]">
        <div className="w-full h-auto absolute z-0">
          <Image
            alt="section break"
            width={1200}
            height={400}
            priority
            src={sectionBreak}
            className="w-full h-auto transform -scale-y-100"
          />
        </div>
      </div>

      <div id="capabilities" className="max-w-4xl px-8 lg:px-0 relative z-1 scroll-mt-24">
        
        <h3 className="text-3xl lg:text-6xl my-8 text-center">
          Key Capabilities
        </h3>
        <div className="flex flex-col lg:flex-row w-full mb-8 flex-wrap gap-6 lg:gap-0">
          <div className="flex flex-col w-full lg:w-1/3 lg:pr-8">
            <h4 className="text-base lg:text-lg mb-4">
              Dynamic Knowledge Ingestion
            </h4>
            <p className="text-sm">
              Pull knowledge from multiple sources: upload files directly,
              scrape web content, connect APIs, or sync from external stores
              like Google Drive or Obsidian vaults. Superprism structures
              incoming knowledge based on your organizational rules—tags,
              categories, hierarchies—as it arrives.
            </p>
          </div>
          <div className="flex flex-col w-full lg:w-1/3 lg:pr-8">
            <h4 className="text-base lg:text-lg mb-4">
              Intelligent Knowledge Navigation
            </h4>
            <p className="text-sm">
              Explore your knowledge base through traditional file browsing,
              semantic search, or visual knowledge graphs. Chat directly with
              your space to surface relevant context. Edit and refine knowledge
              blocks, and watch updates propagate through your entire base.
            </p>
          </div>
          <div className="flex flex-col w-full lg:w-1/3">
            <h4 className="text-base lg:text-lg mb-4">
              Context-Isolated Projects
            </h4>
            <p className="text-sm">
              Projects give you a sandbox to work with your knowledge base
              without contamination. Add project-specific context that stays
              ephemeral unless you explicitly choose to persist it back to your
              space. Perfect for experimental explorations, client work, or
              one-off analyses.
            </p>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row w-full mb-8 flex-wrap gap-6 lg:gap-0">
          <div className="flex flex-col w-full lg:w-1/3 lg:pr-8">
            <h4 className="text-base lg:text-lg mb-4">
              Multi-Modal Interactivity
            </h4>
            <p className="text-sm">
              Generate artifacts in multiple formats: documents, reports,
              summaries, structured data, or custom formats. Engage with outputs
              through chat interfaces, insight feeds, or visual representations.
              Export to other tools or publish selectively for external
              audiences.
            </p>
          </div>
          <div className="flex flex-col w-full lg:w-1/3 lg:pr-8">
            <h4 className="text-base lg:text-lg mb-4">
              Extensible Architecture
            </h4>
            <p className="text-sm">
              Built on open-source foundations. Create custom MCP servers from
              your spaces to enhance Claude, GPT, or other AI tools with your
              organized context. Build your own workflows, automations, and
              integrations. Fork and adapt the system to your exact needs.
            </p>
          </div>
          <div className="flex flex-col w-full lg:w-1/3">
            <h4 className="text-base lg:text-lg mb-4">
              Flexible Collaboration
            </h4>
            <p className="text-sm">
              Keep spaces private for personal knowledge gardening, or invite
              collaborators for team projects. Share selective portions of your
              knowledge as wikis, documentation sites, or structured exports for
              partners and stakeholders. You control the boundaries.
            </p>
          </div>
        </div>
      </div>

      <div id="principles" className="flex flex-col max-w-4xl mt-8 lg:mt-16 px-4 lg:px-0 scroll-mt-24">
        <div className="flex flex-row w-full">
          <h4 className="text-xl lg:text-2xl mb-8 text-center w-full">
            Design Principles
          </h4>
        </div>
        <div className="flex flex-col lg:flex-row w-full flex-wrap gap-6 lg:gap-0">
          <div className="flex flex-col w-full lg:w-1/2 lg:pr-8 mb-6 lg:mb-8">
            <p className="text-sm lg:text-base">
              <strong>Local-First Intelligence</strong>
            </p>
            <p className="text-sm lg:text-base">
              Your knowledge lives on your infrastructure—private by default,
              sovereign by design. Share selectively when it serves your
              purpose. Privacy and control aren&apos;t features; they&apos;re
              the foundation.
            </p>
          </div>
          <div className="flex flex-col w-full lg:w-1/2 mb-6 lg:mb-8">
            <p className="text-sm lg:text-base">
              <strong>Context Hygiene</strong>
            </p>
            <p className="text-sm lg:text-base">
              Separate spaces prevent unrelated knowledge from contaminating
              each other. Isolated projects let you experiment without polluting
              your core knowledge base. Relevance stays high because context
              stays focused.
            </p>
          </div>
          <div className="flex flex-col w-full lg:w-1/2 lg:pr-8 mb-6 lg:mb-8">
            <p className="text-sm lg:text-base">
              <strong>Open and Portable</strong>
            </p>
            <p className="text-sm lg:text-base">
              Built on open-source foundations, Superprism is forkable,
              extensible, and yours to adapt. No vendor lock-in. No proprietary
              formats. Your knowledge remains portable across tools and
              workflows.
            </p>
          </div>
          <div className="flex flex-col w-full lg:w-1/2 mb-6 lg:mb-8">
            <p className="text-sm lg:text-base">
              <strong>Symbiotic Productivity</strong>
            </p>
            <p className="text-sm lg:text-base">
              AI handles scale and synthesis. Humans provide judgment,
              creativity, and direction. Superprism weaves both into a
              partnership where machines augment rather than replace human
              intelligence. The system scales collective knowledge without
              sacrificing individual ingenuity.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full h-auto relative mb-[120px] lg:mb-[320px]">
        <div className="w-full h-auto absolute z-0">
          <Image
            alt="section break"
            width={1200}
            height={400}
            priority
            src={sectionBreak2}
            className="w-full h-auto"
          />
        </div>
      </div>


      <div id="foundation" className="flex flex-col max-w-4xl px-8 lg:px-0 relative z-1 scroll-mt-24">
        <div className="flex flex-row w-full">
          <h4 className="text-3xl lg:text-6xl mb-8 text-center w-full">
            Technical Foundation
          </h4>
        </div>
        <div className="flex flex-col lg:flex-row w-full flex-wrap gap-6 lg:gap-0">
          <div className="flex flex-col w-full lg:w-1/2 lg:pr-8 mb-6 lg:mb-8">
            <p className="text-sm lg:text-base">
              <strong>Transparent, Self-Hostable Stack</strong>
            </p>
            <p className="text-sm lg:text-base">
              Built on Next.js, Supabase (Postgres/Auth/Storage), and our Model
              Context Protocol server. Deploy on your own infrastructure with
              complete visibility into where your data lives. Every component is
              transparent and under your control.
            </p>
          </div>
          <div className="flex flex-col w-full lg:w-1/2 mb-6 lg:mb-8">
            <p className="text-sm lg:text-base">
              <strong>Non-Custodial by Design</strong>
            </p>
            <p className="text-sm lg:text-base">
              Supabase row-level policies keep workspaces isolated. N8n
              ingestion pipelines register every job in the open schema. You
              maintain custody of your knowledge base—no data handover required.
            </p>
          </div>
          <div className="flex flex-col w-full lg:w-1/2 lg:pr-8 mb-6 lg:mb-8">
            <p className="text-sm lg:text-base">
              <strong>Secure Context Streaming</strong>
            </p>
            <p className="text-sm lg:text-base">
              The MCP layer exposes context to AI agents via per-workspace API
              keys or Supabase OAuth. Stream read-only context to tools without
              exposing raw data, maintaining security while enabling powerful
              integrations.
            </p>
          </div>
          <div className="flex flex-col w-full lg:w-1/2 mb-6 lg:mb-8">
            <p className="text-sm lg:text-base">
              <strong>Future-Ready Coordination</strong>
            </p>
            <p className="text-sm lg:text-base">
              Aligning with emerging standards like ERC-8004 (autonomous worlds
              state sync), AP2&apos;s agent-to-protocol graph, and X402 wallet
              channels. Your spaces can plug into onchain workflows as these
              coordination rails mature—no custom glue code needed.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full h-auto relative mb-[180px] lg:mb-[360px]">
        <div className="w-full h-auto absolute -z-10 mx-auto">
          <Image
            alt="section break"
            width={1200}
            height={400}
            priority
            src={sectionBreak3}
            className="w-full h-auto transform -scale-y-100"
          />
        </div>
      </div>

      <div id="get-started" className="flex flex-col max-w-xl my-8 lg:my-16 px-4 lg:px-0 scroll-mt-24">
        <h4 className="text-2xl lg:text-4xl mb-4 text-center">
          Start refracting knowledge soon.
        </h4>
        <p className="text-sm lg:text-base mb-6 text-center">
          Whether you&apos;re a researcher organizing notes and reference
          material, a product team maintaining context across sprints, or a DAO
          coordinating community knowledge—Superprism gives you the foundation
          to work smarter with AI.
        </p>
        <EarlyAccessForm className="mx-auto w-full max-w-3xl" />
      </div>
      <Footer />
    </div>
  );
}
