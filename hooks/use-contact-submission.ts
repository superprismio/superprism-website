"use client";

import { useMutation } from "@tanstack/react-query";

export type ContactSubmissionInput = {
  email: string;
  source?: "early_access" | "contact_form" | (string & {});
  message?: string;
  metadata?: Record<string, unknown>;
};

type ContactResponse = {
  ok: boolean;
  message?: string;
  error?: string;
};

async function submitContact(input: ContactSubmissionInput) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = (await response.json().catch(() => ({}))) as ContactResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to send your message.");
  }

  return payload;
}

export function useContactSubmission() {
  return useMutation({
    mutationFn: submitContact,
  });
}
