import Image from "next/image";
import screenshotImg from "../../public/images/sp_ref_screenshot.png";

const experiments = [
  "multi-source knowledge ingestion",
  "automated daily and weekly digests",
  "shared context workspaces",
  "project-specific context isolation",
  "knowledge graph exploration",
];

export function ReferenceImplSection() {
  return (
    <section
      id="platform"
      className="w-full border-t border-border scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto py-24 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Reference Implementation
            </p>
            <h2 className="text-4xl font-bold mb-6">Superprism</h2>
            <p className="text-muted-foreground mb-4">
              Superprism is our primary research artifact — a collaborative AI
              workspace for distributed teams.
            </p>
            <p className="text-muted-foreground mb-8">
              Each capability represents a hypothesis about how humans and
              agents should coordinate.
            </p>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Current Experiments
            </p>
            <ul className="space-y-2">
              {experiments.map((exp) => (
                <li
                  key={exp}
                  className="font-mono text-sm text-foreground flex items-center gap-2"
                >
                  <span className="text-primary">•</span>
                  {exp}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-border">
            <Image src={screenshotImg} alt="Superprism platform screenshot" className="w-full h-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
