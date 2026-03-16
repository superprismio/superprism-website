import Image from "next/image";
import projectsImg from "../../public/images/sp_graphic-projects.png";
import spacesImg from "../../public/images/sp_graphic-spaces.png";
import extendImg from "../../public/images/sp_graphic-extend.png";

const researchAreas = [
  {
    title: "Collaborative AI Environments",
    description:
      "Shared workspaces where humans and agents operate on the same evolving context.",
    active: true,
  },
  {
    title: "Context Engineering",
    description:
      "Techniques for creating, maintaining, and isolating context so AI systems stay useful.",
    active: true,
  },
  {
    title: "Human-Agent Coordination",
    description:
      "Designing systems where agents assist teams without replacing human judgment.",
    active: false,
  },
  {
    title: "Local-First AI Infrastructure",
    description:
      "Architectures that preserve privacy and sovereignty over knowledge.",
    active: true,
  },
  {
    title: "Agentic Economies",
    description:
      "Exploring how AI agents interact with decentralized economic systems.",
    active: false,
  },
  {
    title: "Knowledge Interfaces",
    description:
      "New ways for humans to navigate and shape shared AI context.",
    active: false,
  },
];

export function ResearchAreasSection() {
  return (
    <section
      id="research"
      className="w-full border-t border-border scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto py-24 px-6">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Areas of Inquiry
          </p>
          <h2 className="text-4xl font-bold">Research Areas</h2>
          <p className="text-muted-foreground mt-4">
            We explore the systems required for collaborative AI.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {researchAreas.map((area) => (
            <div key={area.title} className="bg-card border border-border p-6">
              {area.active && (
                <p className="font-mono text-xs text-primary mb-3">
                  ● Active Experiment
                </p>
              )}
              <h3 className="font-semibold mb-2">{area.title}</h3>
              <p className="text-sm text-muted-foreground">
                {area.description}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          <Image src={spacesImg} alt="Spaces graphic" className="w-full h-auto" />
          <Image src={projectsImg} alt="Projects graphic" className="w-full h-auto" />
          <Image src={extendImg} alt="Extend graphic" className="w-full h-auto" />
        </div>
      </div>
    </section>
  );
}
