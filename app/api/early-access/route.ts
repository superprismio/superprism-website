import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type EarlyAccessPayload = {
  email?: unknown;
  source?: unknown;
  metadata?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EarlyAccessPayload;
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const email = rawEmail.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const metadata =
      body.metadata && typeof body.metadata === "object" ? body.metadata : {};
    const source =
      typeof body.source === "string" && body.source.length > 0
        ? body.source
        : "marketing_site";

    const { data: existing, error: fetchError } = await supabase
      .from("early_signups")
      .select("id")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Unable to save your request right now." },
        { status: 500 }
      );
    }

    let mutationError = null;

    if (existing) {
      const { error } = await supabase
        .from("early_signups")
        .update({ metadata, source })
        .eq("email", email);
      mutationError = error;
    } else {
      const { error } = await supabase
        .from("early_signups")
        .insert({ email, metadata, source });
      mutationError = error;
    }

    if (mutationError) {
      return NextResponse.json(
        { error: "Unable to save your request right now." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Request saved. We'll be in touch soon.",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 400 }
    );
  }
}

