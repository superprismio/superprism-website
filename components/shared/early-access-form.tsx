"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

type SubmissionState = "idle" | "success" | "error";

export function EarlyAccessForm({ className }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      setStatus("error");
      setMessage("Please enter an email address.");
      return;
    }

    console.log("email", email);

    setIsSubmitting(true);
    setStatus("idle");
    setMessage(null);

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json().catch(() => ({}));

      console.log("payload", payload);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to save your request.");
      }

      setStatus("success");
      setMessage("Thanks! We'll let you know as soon as slots open up.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showAlert = status !== "idle" && message;

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-white/60 text-center sm:text-left">
        Join the Waitlist to get early access.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-4 sm:mt-6 flex w-full flex-col gap-3 sm:flex-row"
      >
        <div className="flex-1 w-full">
          <Label htmlFor="early-access-email" className="sr-only">
            Email address
          </Label>
          <Input
            id="early-access-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={isSubmitting}
            className="w-full"
          />
        </div>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? "Sending..." : "Request access"}
        </Button>
      </form>

      {showAlert && (
        <Alert
          variant={status === "error" ? "destructive" : "default"}
          className="mt-4"
        >
          <AlertDescription className="text-sm">{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
