import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
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

const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mt-14 text-3xl font-bold leading-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-10 text-2xl font-bold leading-tight">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mt-6 text-lg leading-8 text-muted-foreground">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-6 space-y-3 text-lg leading-8 text-muted-foreground">
      {children}
    </ul>
  ),
  li: ({ children }) => (
    <li className="flex gap-3">
      <span className="mt-3 h-1.5 w-1.5 shrink-0 bg-primary" />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-foreground">{children}</strong>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-4 hover:text-primary/80"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="border border-border bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="mt-8 overflow-hidden border border-border">
      <Table className="min-w-[720px]">
        {children}
      </Table>
    </div>
  ),
  thead: ({ children }) => (
    <TableHeader className="bg-muted/70">{children}</TableHeader>
  ),
  tbody: ({ children }) => (
    <TableBody className="text-muted-foreground">{children}</TableBody>
  ),
  tr: ({ children }) => (
    <TableRow className="hover:bg-muted/30">{children}</TableRow>
  ),
  th: ({ children }) => (
    <TableHead className="h-auto min-w-36 px-4 py-3 align-top text-sm font-bold leading-6 text-foreground">
      {children}
    </TableHead>
  ),
  td: ({ children }) => (
    <TableCell className="min-w-36 px-4 py-4 align-top text-sm leading-6">
      {children}
    </TableCell>
  ),
};

export function generateStaticParams() {
  return getAllArticles().map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return {
    title: `${article.title} | SUPERPRISM`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: article.image ? [article.image] : undefined,
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article || article.status !== "published") {
    notFound();
  }

  return (
    <div className="flex-1 w-full flex flex-col">
      <Header />
      <article className="w-full">
        <header className="relative min-h-[calc(100vh-6rem)] overflow-hidden border-b border-border bg-background">
          <Image
            src={article.image ?? "/images/prism_landscape.jpg"}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-background/70" aria-hidden="true" />
          <div
            className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-background/10"
            aria-hidden="true"
          />
          <div className="relative z-10 flex min-h-[calc(100vh-6rem)] max-w-6xl mx-auto px-6 py-10">
            <div className="flex w-full flex-col justify-between">
            <Link
              href="/research"
              className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Research Reports
            </Link>

              <div className="max-w-4xl pb-10 lg:pb-16">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <Badge variant="outline">{formatArticleType(article.type)}</Badge>
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {formatArticleDate(article.date)}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {article.readingTime}
                  </span>
                </div>
                <h1 className="text-5xl font-bold leading-tight">
                  {article.title}
                </h1>
                {article.subtitle ? (
                  <p className="mt-5 text-2xl text-muted-foreground">
                    {article.subtitle}
                  </p>
                ) : null}
                <p className="mt-8 text-lg leading-8 text-muted-foreground">
                  {article.summary}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="mb-10 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <ReactMarkdown
            components={markdownComponents}
            remarkPlugins={[remarkGfm]}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </article>
      <Footer />
    </div>
  );
}
