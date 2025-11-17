import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import Image from "next/image"
import { Cta } from "@/components/cta";
import spacesImg from "../public/images/sp_graphic-spaces.png"
import projectsImg from "../public/images/sp_graphic-projects.png"
import extendImg from "../public/images/sp_graphic-extend.png"

export default function Home() {
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <Header />
      <div className="flex-1 w-full flex flex-col items-center">
        <Hero />
      </div>
      <div className="flex-1 w-full flex flex-col items-center max-w-4xl">
        <h2 className="lg:text-2xl my-8">How it Works</h2>
        <div className="flex flex-row w-full mb-16">
          <div className="flex flex-col w-1/2">
            <Image 
            alt="Superprism logo"
            width={1200}
            height={1200}
            priority
            src={spacesImg} />
          </div>
          <div className="flex flex-col w-1/2">
          <h3 className="lg:text-xl mb-4">1. Build Spaces of Knowledge</h3>
          <p>Create dedicated spaces for different domains—one for a research project, another for product specs, another for community docs. Each space is a focused knowledge base with its own context. Upload documents, connect data sources, or ingest content from the web. Superprism organizes it automatically based on rules you set.</p>
          <p><strong>Your knowledge stays clean and up to date. No context bleed between unrelated work.</strong></p>
          </div>
        </div>
        <div className="flex flex-row w-full mb-16">
          <div className="flex flex-col w-1/2">
            <Image 
            alt="Superprism logo"
            width={1200}
            height={1200}
            priority
            src={projectsImg} />
          </div>
          <div className="flex flex-col w-1/2">
          <h3 className="lg:text-xl mb-4">2. Run Projects Within Spaces</h3>
          <p>Launch projects that use your space's knowledge as foundation. Chat with your knowledge base, generate reports, create summaries, build documentation. Projects can pull in additional context without polluting your core space—they're experimental branches where only what you choose to keep persists.</p>
          <p><strong>Generate what you need. Keep what matters.</strong></p>
          </div>
        </div>
        <div className="flex flex-row w-full mb-16">
          <div className="flex flex-col w-1/2">
           <Image 
            alt="Superprism logo"
            width={1200}
            height={1200}
            priority
            src={extendImg} />
            </div>
          <div className="flex flex-col w-1/2">
          <h3 className="lg:text-xl mb-4">3. Share and Extend</h3>
          <p>Invite collaborators to spaces or projects. Generate your own Model Context Protocol (MCP) server to connect your organized knowledge to other AI-ready tools. Export selective knowledge as wikis, summarized docs or public documentation. Your knowledge base becomes infrastructure for your entire workflow.</p>
          <p><strong>Local by default. Collaborative when you choose. Connect to your existing tools.</strong></p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <h3 className="lg:text-2xl my-8">Key Capabilities</h3>
        <div className="flex flex-row w-full mb-8 flex-wrap">
          <div className="flex flex-col w-1/3 lg:pr-8">
          <h4 className="lg:text-lg mb-4">Dynamic Knowledge Ingestion</h4>
          <p className="text-sm">Pull knowledge from multiple sources: upload files directly, scrape web content, connect APIs, or sync from external stores like Google Drive or Obsidian vaults. Superprism structures incoming knowledge based on your organizational rules—tags, categories, hierarchies—as it arrives.</p>
          </div>
          <div className="flex flex-col w-1/3 lg:pr-8">
          <h4 className="lg:text-lg mb-4">Intelligent Knowledge Navigation</h4>
          <p className="text-sm">Explore your knowledge base through traditional file browsing, semantic search, or visual knowledge graphs. Chat directly with your space to surface relevant context. Edit and refine knowledge blocks, and watch updates propagate through your entire base.</p>
          </div>
          <div className="flex flex-col w-1/3">
          <h4 className="lg:text-lg mb-4">Context-Isolated Projects</h4>
          <p className="text-sm">Projects give you a sandbox to work with your knowledge base without contamination. Add project-specific context that stays ephemeral unless you explicitly choose to persist it back to your space. Perfect for experimental explorations, client work, or one-off analyses.</p>
          </div>
        </div>
        <div className="flex flex-row w-full mb-8 flex-wrap">
          <div className="flex flex-col w-1/3 lg:pr-8">
          <h4 className="lg:text-lg mb-4">Multi-Modal Interactivity</h4>
          <p className="text-sm">Generate artifacts in multiple formats: documents, reports, summaries, structured data, or custom formats. Engage with outputs through chat interfaces, insight feeds, or visual representations. Export to other tools or publish selectively for external audiences.</p>
          </div>
          <div className="flex flex-col w-1/3 lg:pr-8">
          <h4 className="lg:text-lg mb-4">Extensible Architecture</h4>
          <p className="text-sm">Built on open-source foundations. Create custom MCP servers from your spaces to enhance Claude, GPT, or other AI tools with your organized context. Build your own workflows, automations, and integrations. Fork and adapt the system to your exact needs.</p>
          </div>
          <div className="flex flex-col w-1/3">
          <h4 className="lg:text-lg mb-4">Flexible Collaboration</h4>
          <p className="text-sm">Keep spaces private for personal knowledge gardening, or invite collaborators for team projects. Share selective portions of your knowledge as wikis, documentation sites, or structured exports for partners and stakeholders. You control the boundaries.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col max-w-4xl mt-16">
        <div className="flex flex-row w-full">
          <h4 className="text-2xl mb-8">Design Principles</h4>
        </div>
        <div className="flex flex-row w-full flex-wrap">
          <div className="flex flex-col w-1/2 lg:pr-8 mb-8">
            <p><strong>Local-First Intelligence</strong></p>
            <p>Your knowledge lives on your infrastructure—private by default, sovereign by design. Share selectively when it serves your purpose. Privacy and control aren't features; they're the foundation.</p>
          </div>
          <div className="flex flex-col w-1/2 mb-8">
            <p><strong>Context Hygiene</strong></p>
            <p>Separate spaces prevent unrelated knowledge from contaminating each other. Isolated projects let you experiment without polluting your core knowledge base. Relevance stays high because context stays focused.</p>
          </div>
          <div className="flex flex-col w-1/2 lg:pr-8 mb-8">
            <p><strong>Open and Portable</strong></p>
            <p>Built on open-source foundations, Superprism is forkable, extensible, and yours to adapt. No vendor lock-in. No proprietary formats. Your knowledge remains portable across tools and workflows.</p>
          </div>
          <div className="flex flex-col w-1/2 mb-8">
            <p><strong>Symbiotic Productivity</strong></p>
            <p>AI handles scale and synthesis. Humans provide judgment, creativity, and direction. Superprism weaves both into a partnership where machines augment rather than replace human intelligence. The system scales collective knowledge without sacrificing individual ingenuity.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col max-w-4xl my-16">
        <h4 className="text-4xl">Start refracting knowledge today.</h4>
        <p>Whether you're a researcher organizing notes and reference material, a product team maintaining context across sprints, or a DAO coordinating community knowledge—Superprism gives you the foundation to work smarter with AI.</p>
        <Cta />
      </div>

      {/* <div>
        <h4>Technicals</h4>
      </div> */}

    </div>
  );
}
