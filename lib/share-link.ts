/**
 * Generates a shareable URL for the current workspace state
 */
export function generateShareUrl(
  heapId: string,
  options?: {
    section?: "settings" | "projects" | "knowledge";
    projectId?: string | null;
    fileId?: string | null;
    ingest?: "upload" | "text" | null;
  }
): string {
  if (typeof window === "undefined") {
    return "";
  }

  const params = new URLSearchParams();

  if (options?.section) {
    params.set("section", options.section);
  }

  if (options?.projectId) {
    params.set("projectId", options.projectId);
  }

  if (options?.fileId) {
    params.set("fileId", options.fileId);
  }

  if (options?.ingest) {
    params.set("ingest", options.ingest);
  }

  const queryString = params.toString();
  const baseUrl = `${window.location.origin}/dashboard/${heapId}`;

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

