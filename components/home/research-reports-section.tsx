import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFeaturedArticles } from "@/lib/articles";

function formatArticleDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
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

export function ResearchReportsSection() {
  const articles = getFeaturedArticles(3);

  if (articles.length === 0) {
    return null;
  }

  return (
    <section
      id="reports"
      className="relative w-full border-t border-border scroll-mt-24 bg-background"
    >
      <div className="max-w-6xl mx-auto py-24 px-6">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Research Reports
            </p>
            <h2 className="text-4xl font-bold">Published Field Notes</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl">
              Research reports, case studies, and experimentation logs from
              Superprism field work.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/research">
              View all reports
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/research/${article.slug}`}
              className="group bg-card border border-border overflow-hidden transition-colors hover:border-primary/70"
            >
              <div className="relative aspect-[16/10] bg-muted">
                <Image
                  src={article.image ?? "/images/prism_landscape.jpg"}
                  alt={article.imageAlt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{formatArticleType(article.type)}</Badge>
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {formatArticleDate(article.date)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold leading-tight">
                  {article.title}
                </h3>
                {article.subtitle ? (
                  <p className="text-muted-foreground mt-2">
                    {article.subtitle}
                  </p>
                ) : null}
                <p className="text-sm text-muted-foreground mt-5">
                  {article.summary}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
