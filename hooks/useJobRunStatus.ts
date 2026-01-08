"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";

type JobRun = Database["public"]["Tables"]["job_runs"]["Row"];

const getErrorMessage = (errors: JobRun["errors"]) => {
  if (!errors) return null;
  if (typeof errors === "string") return errors;
  try {
    if (Array.isArray(errors)) {
      const messages = errors
        .map((err) => {
          if (!err) return null;
          if (typeof err === "string") return err;
          if (typeof err === "object") {
            const anyErr = err as Record<string, unknown>;
            const msg =
              anyErr.message ||
              anyErr.error ||
              anyErr.detail ||
              anyErr.reason;
            return typeof msg === "string" ? msg : null;
          }
          return null;
        })
        .filter((msg): msg is string => Boolean(msg));
      if (messages.length > 0) {
        return messages.join("; ");
      }
    }
    if (typeof errors === "object") {
      const anyErr = errors as Record<string, unknown>;
      const msg =
        anyErr.message || anyErr.error || anyErr.detail || anyErr.reason;
      if (typeof msg === "string") {
        return msg;
      }
    }
    return JSON.stringify(errors);
  } catch {
    return "Unknown error";
  }
};

const getLastString = (value: unknown) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const last = value[value.length - 1];
    return typeof last === "string" ? last : null;
  }
  return null;
};

export function useJobRunStatus(jobId: string | null) {
  const [jobRun, setJobRun] = useState<JobRun | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJobRun(null);
      return;
    }

    const supabase = createClient();
    let isActive = true;

    const fetchLatest = async () => {
      const { data, error } = await supabase
        .from("job_runs")
        .select("*")
        .eq("job_id", jobId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!isActive) return;
      if (!error && data) {
        setJobRun(data);
      }
    };

    void fetchLatest();

    const channel = supabase
      .channel(`job-runs-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "job_runs",
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          switch (payload.eventType) {
            case "INSERT":
            case "UPDATE":
              if (payload.new) {
                setJobRun(payload.new as JobRun);
              }
              break;
            case "DELETE":
              setJobRun(null);
              break;
            default:
              break;
          }
        }
      )
      .subscribe();

    return () => {
      isActive = false;
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  const statusMessages = useMemo(() => {
    if (!jobRun) return [];

    const messages: string[] = [];
    const seen = new Set<string>();

    const pushMessage = (message: string | null) => {
      if (!message) return;
      if (seen.has(message)) return;
      seen.add(message);
      messages.push(message);
    };

    const lastStepStatus = getLastString(jobRun.step_status);
    const lastStep = getLastString(jobRun.steps);

    if (lastStepStatus) {
      pushMessage(lastStepStatus);
    } else if (lastStep) {
      pushMessage(lastStep);
    } else {
      pushMessage(jobRun.status);
    }

    const errorMessage = getErrorMessage(jobRun.errors);
    if (errorMessage) {
      pushMessage(`Error: ${errorMessage}`);
    }

    return messages;
  }, [jobRun]);

  return { jobRun, statusMessages };
}
