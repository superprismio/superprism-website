export function ThesisSection() {
  return (
    <section
      id="thesis"
      className="w-full border-t border-border scroll-mt-24"
    >
      <div className="max-w-4xl mx-auto py-32 px-6 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-8">
          The next generation of AI will not be individual.
          <br />
          <span className="text-primary">It will be collaborative.</span>
        </h2>
        <p className="text-muted-foreground text-lg mb-6">
          As AI agents become ubiquitous, the challenge is no longer individual
          productivity.
        </p>
        <p className="text-foreground text-lg font-medium mb-6">
          The challenge is <strong>shared intelligence</strong>.
        </p>
        <p className="text-foreground text-lg mb-6">There's also a compounding problem. The most capable AI tools are built for technical users, and collaboration doesn't work when only half the room can participate.</p>
        <p className="text-muted-foreground text-lg mb-6">
          How teams create, maintain, and govern context will determine whether
          AI empowers organizations — or fragments them.
        </p>
        <p className="text-muted-foreground text-lg">
          Superprism explores the infrastructure required for{" "}
          <strong className="text-foreground">collaborative intelligence.</strong>
        </p>
      </div>
    </section>
  );
}
