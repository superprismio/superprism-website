"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useContactSubmission } from "@/hooks/use-contact-submission";

type SubmissionState = "idle" | "success" | "error";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ContactFormModal({ open, onOpenChange }: Props) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const contactSubmission = useContactSubmission();
  const isSubmitting = contactSubmission.isPending;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      setStatus("error");
      setStatusMessage("Please enter an email address.");
      return;
    }

    setStatus("idle");
    setStatusMessage(null);

    try {
      await contactSubmission.mutateAsync({
        email,
        source: "contact_form",
        message,
      });

      setStatus("success");
      setStatusMessage("Thanks! We'll be in touch soon.");
      setEmail("");
      setMessage("");
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Get in Touch</DialogTitle>
        </DialogHeader>

        {status === "success" ? (
          <p className="mt-2 text-xl text-primary">{statusMessage}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-email">Email address</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-message">
                How would you like to collaborate?
              </Label>
              <Textarea
                id="contact-message"
                placeholder="Describe your project, goals, or ideas..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                rows={5}
              />
            </div>

            {status === "error" && statusMessage && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  {statusMessage}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full holographic-shimmer-hover"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
