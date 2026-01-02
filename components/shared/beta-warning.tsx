"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShieldAlert } from "lucide-react";
import { Button } from "../ui/button";

export function BetaWarning({ trigger }: { trigger?: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="flex items-center gap-2" variant="ghost">
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            Beta Testing Notice
          </DialogTitle>
          <div className="pt-2">
            <div className="space-y-3 text-left text-sm text-muted-foreground">
              <p>
                Thank you for being an early beta user of Superprism! We
                appreciate your patience and feedback as we continue to improve
                the platform.
              </p>
              <p>Please be aware that during this beta phase:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>The user interface may change frequently</li>
                <li>Services may experience downtime or interruptions</li>
                <li>
                  Data structures may shift, potentially affecting your content
                </li>
                <li>Features are still under active development</li>
              </ul>
              <p className="pt-2">
                If you encounter any issues or have feedback, please don't
                hesitate to reach out to our team.
              </p>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
