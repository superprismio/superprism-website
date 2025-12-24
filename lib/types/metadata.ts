export type TableOfContentsEntry = {
  title: string;
  level: 1 | 2 | 3;
  start_line: number;
  end_line: number;
  start_char?: number | null;
  end_char?: number | null;
  sectionTags?: string[];
  sectionOtherTags?: string[];
};

export type FileMeta = {
  summary_short?: string | null;
  tags?: string[];
  tags_pending?: string[];
  tags_raw?: string[];
  folders?: string[];
  table_of_contents?: TableOfContentsEntry[];
  row_schema?: TabularColumnSchema[] | null;
  source_url?: string | null;
  source_path?: string | null;
  source_sha?: string | null;
  extracted_storage_path?: string | null;
  extracted_file_hash?: string | null;
  [key: string]: unknown;
};

export type TabularColumnSchema = {
  key: string;
  label?: string | null;
  data_type?:
    | "string"
    | "number"
    | "boolean"
    | "date"
    | "timestamp"
    | "json"
    | string;
  nullable?: boolean;
  description?: string | null;
  sample_value?: string | number | boolean | null;
  [key: string]: unknown;
};

export type ChunkSectionBreadcrumb = {
  h1?: string | null;
  h2?: string | null;
  h3?: string | null;
};

export type ChunkLineSpan = {
  from: number;
  to: number;
};

export type ChunkMetadata = {
  file_id: string;
  heap_id: string;
  storage_path?: string | null;
  file_name?: string | null;
  user_id?: string | null;
  tags?: string[];
  folders?: string[];
  uploaded_at?: string | null;
  doc_id?: string | null;
  chunk_index: number;
  section?: ChunkSectionBreadcrumb | null;
  lines?: ChunkLineSpan | null;
  text_hash_sha256?: string | null;
  [key: string]: unknown;
};

export type JobRunStepStatusEntry = {
  id?: string | null;
  label?: string | null;
  message?: string | null;
  state?: "queued" | "running" | "partial" | "succeeded" | "failed" | string;
  progress?: number | null;
  updated_at?: string | null;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

export type JobRunStepStatus = JobRunStepStatusEntry[];
