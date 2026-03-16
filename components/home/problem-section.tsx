import Image from "next/image";
import topoImg from "../../public/images/prism_topography-0.png";

export function ProblemSection() {
  return (
    <section
      id="problem"
      className="relative w-full border-t border-border scroll-mt-24 overflow-hidden"
    >
      <Image
        alt=""
        src={topoImg}
        fill
        className="object-cover object-center opacity-30"
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-6xl mx-auto py-24 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              AI tools are built for individuals.
            </h2>
          </div>
          <div>
            <p className="text-muted-foreground mb-6">
              But the most complex work happens in{" "}
              <strong className="text-foreground">teams</strong>:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-6">
              <li>• distributed organizations</li>
              <li>• research groups</li>
              <li>• open source communities</li>
              <li>• global companies</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              These teams struggle to maintain{" "}
              <strong className="text-foreground">shared context</strong> across
              conversations, documents, repositories, and AI agents.
            </p>
            <p className="text-foreground">
              Superprism explores how{" "}
              <strong>
                humans and AI systems coordinate knowledge together.
              </strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
