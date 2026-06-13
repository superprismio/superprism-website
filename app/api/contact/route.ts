import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DISCORD_MESSAGE_LIMIT = 2000;
const CONTACT_SOURCE = "superprism-website";
const emailPattern =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

type ContactPayload = {
  email?: unknown;
  source?: unknown;
  message?: unknown;
  metadata?: unknown;
};

type ContactSummary = {
  email: string;
  leadType: string;
  message?: string;
  metadata: Record<string, unknown>;
  site: "superprism.io";
  source: typeof CONTACT_SOURCE;
  submittedAt: string;
};

function getEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not configured`);
  }

  return value;
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength - 3)}...`;
}

function getMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return metadata as Record<string, unknown>;
}

function formatLeadType(source: string) {
  return source
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatMetadata(metadata: Record<string, unknown>) {
  const entries = Object.entries(metadata).filter(
    ([key, value]) => key !== "message" && value != null && value !== "",
  );

  if (entries.length === 0) return null;

  return entries
    .map(([key, value]) => `**${formatLeadType(key)}:** ${String(value)}`)
    .join("\n");
}

function formatDiscordMessage(summary: ContactSummary) {
  const sections = [
    "**New Superprism lead**",
    `**Source:** ${summary.source}`,
    `**Site:** ${summary.site}`,
    `**Form:** ${summary.leadType}`,
    `**Email:** ${summary.email}`,
    `**Submitted:** ${summary.submittedAt}`,
  ];
  const metadata = formatMetadata(summary.metadata);

  if (summary.message) {
    sections.push(`**Message:**\n${summary.message}`);
  }

  if (metadata) {
    sections.push(metadata);
  }

  return truncate(sections.join("\n\n"), DISCORD_MESSAGE_LIMIT);
}

async function sendDiscordMessage(content: string) {
  const botToken = getEnv("DISCORD_BOT_TOKEN");
  const channelId = getEnv("DISCORD_CONSULTATION_CHANNEL_ID");

  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        allowed_mentions: { parse: [] },
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Discord notification failed: ${details}`);
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ContactPayload | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const metadata = getMetadata(body.metadata);
  const message =
    typeof body.message === "string"
      ? body.message.trim()
      : typeof metadata.message === "string"
        ? metadata.message.trim()
        : "";
  const source =
    typeof body.source === "string" && body.source.trim().length > 0
      ? body.source.trim()
      : "early_access";

  if (!emailPattern.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (source === "contact_form" && message.length <= 5) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please include a little more detail in your message.",
      },
      { status: 400 },
    );
  }

  try {
    const summary: ContactSummary = {
      email,
      leadType: formatLeadType(source),
      message: message || undefined,
      metadata,
      site: "superprism.io",
      source: CONTACT_SOURCE,
      submittedAt: new Date().toISOString(),
    };

    await sendDiscordMessage(formatDiscordMessage(summary));

    return NextResponse.json({
      ok: true,
      message: "Your message was sent.",
    });
  } catch (error) {
    console.error("Error submitting contact request:", error);

    return NextResponse.json(
      { ok: false, error: "Unable to send your message right now." },
      { status: 500 },
    );
  }
}
