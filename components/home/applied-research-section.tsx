import Image from "next/image";
import landscapeImg from "../../public/images/prism_landscape.jpg";

const caseStudies = [
  {
    label: "Case Study",
    title: "Raid Guild",
    description: "Collaborative AI systems for decentralized teams.",
    areas: [
      "Shared knowledge base for contributors",
      "Automated ingestion of chats and governance discussions",
      "AI-assisted sensemaking across distributed contributors",
    ],
  },
  {
    label: "Case Study",
    title: "Open Machine",
    description:
      "AI-native knowledge infrastructure for cultural search initiatives.",
    areas: [
      "Git-centric knowledge base",
      "Inner Mind built for knowledge production",
      "Outer Mind meant for public interaction",
    ],
  },
];

export function AppliedResearchSection() {
  return (
    <section
      id="applied"
      className="relative w-full border-t border-border scroll-mt-24 overflow-hidden"
    >
      <Image
        alt=""
        src={landscapeImg}
        fill
        className="object-cover object-center opacity-70"
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-6xl mx-auto py-24 px-6">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Field Work
          </p>
          <h2 className="text-4xl font-bold">Applied Research</h2>
          <p className="text-muted-foreground mt-4">
            Our systems are tested with organizations exploring collaborative
            AI.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {caseStudies.map((study) => (
            <div key={study.title} className="bg-card border border-border p-8">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                {study.label}
              </p>
              <h3 className="text-2xl font-bold mb-3">{study.title}</h3>
              <p className="text-muted-foreground mb-6">{study.description}</p>
              <ul className="space-y-2">
                {study.areas.map((area) => (
                  <li
                    key={area}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-0.5">•</span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
