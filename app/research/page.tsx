import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { getAllArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Research Reports | SUPERPRISM",
  description:
    "Research reports, case studies, and experimentation logs from Superprism field work.",
};

function formatArticleDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatArticleType(type: string) {
  return type
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ResearchPage() {
  const articles = getAllArticles();

  return (
    <div className="flex-1 w-full flex flex-col">
      <Header />
      <section className="w-full border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
            Research Reports
          </p>
          <h1 className="max-w-4xl text-5xl font-bold leading-tight">
            Field notes for collaborative AI infrastructure.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Case studies, research reports, and experimentation logs from live
            Superprism deployments.
          </p>
        </div>
      </section>

      <section className="w-full">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 gap-8">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/research/${article.slug}`}
                className="group grid grid-cols-1 gap-6 border border-border bg-card overflow-hidden transition-colors hover:border-primary/70 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]"
              >
                <div className="relative min-h-72 bg-muted lg:min-h-full">
                  <Image
                    src={article.image ?? "/images/prism_landscape.jpg"}
                    alt={article.imageAlt ?? ""}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-8 lg:p-10">
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <Badge variant="outline">{formatArticleType(article.type)}</Badge>
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {formatArticleDate(article.date)}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {article.readingTime}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold leading-tight">
                    {article.title}
                  </h2>
                  {article.subtitle ? (
                    <p className="mt-2 text-lg text-muted-foreground">
                      {article.subtitle}
                    </p>
                  ) : null}
                  <p className="mt-6 text-muted-foreground">
                    {article.summary}
                  </p>
                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Read report
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
