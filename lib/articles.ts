import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const articlesDirectory = path.join(process.cwd(), "data/articles");

export type ArticleType = "research-report" | "case-study" | "experiment-log";
export type ArticleStatus = "draft" | "published";

export type Article = {
  title: string;
  subtitle?: string;
  slug: string;
  date: string;
  type: ArticleType;
  status: ArticleStatus;
  summary: string;
  tags: string[];
  client?: string;
  product?: string;
  featured: boolean;
  image?: string;
  imageAlt?: string;
  readingTime: string;
  content: string;
};

type ArticleFrontMatter = {
  title?: unknown;
  subtitle?: unknown;
  slug?: unknown;
  date?: unknown;
  type?: unknown;
  status?: unknown;
  summary?: unknown;
  tags?: unknown;
  client?: unknown;
  product?: unknown;
  featured?: unknown;
  image?: unknown;
  imageAlt?: unknown;
};

function asString(value: unknown): string | undefined {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function asStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeArticleType(value: unknown): ArticleType {
  const type = asString(value);

  if (
    type === "research-report" ||
    type === "case-study" ||
    type === "experiment-log"
  ) {
    return type;
  }

  return "research-report";
}

function normalizeArticleStatus(value: unknown): ArticleStatus {
  return asString(value) === "draft" ? "draft" : "published";
}

function slugFromFilename(filename: string): string {
  return filename
    .replace(/\.md$/, "")
    .replace(/^\d{8}-/, "")
    .toLowerCase();
}

function estimateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));

  return `${minutes} min read`;
}

function parseArticle(filename: string): Article {
  const filePath = path.join(articlesDirectory, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(raw);
  const frontMatter = data as ArticleFrontMatter;
  const slug = asString(frontMatter.slug) ?? slugFromFilename(filename);
  const title = asString(frontMatter.title) ?? slug.replaceAll("-", " ");
  const date =
    asString(frontMatter.date) ?? filename.match(/^\d{8}/)?.[0] ?? "";
  const summary = asString(frontMatter.summary) ?? content.slice(0, 180);

  return {
    title,
    subtitle: asString(frontMatter.subtitle),
    slug,
    date,
    type: normalizeArticleType(frontMatter.type),
    status: normalizeArticleStatus(frontMatter.status),
    summary,
    tags: asStringList(frontMatter.tags),
    client: asString(frontMatter.client),
    product: asString(frontMatter.product),
    featured: frontMatter.featured === true,
    image: asString(frontMatter.image),
    imageAlt: asString(frontMatter.imageAlt),
    readingTime: estimateReadingTime(content),
    content,
  };
}

export function getAllArticles(options: { includeDrafts?: boolean } = {}) {
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(articlesDirectory)
    .filter((filename) => filename.endsWith(".md"))
    .map(parseArticle)
    .filter((article) => options.includeDrafts || article.status === "published")
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getFeaturedArticles(limit = 3) {
  const articles = getAllArticles();
  const featured = articles.filter((article) => article.featured);

  return (featured.length > 0 ? featured : articles).slice(0, limit);
}

export function getArticleBySlug(slug: string) {
  return getAllArticles({ includeDrafts: true }).find(
    (article) => article.slug === slug,
  );
}
