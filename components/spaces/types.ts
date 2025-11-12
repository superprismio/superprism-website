import { Tables } from "@/lib/types/supabase";

export type Space = Pick<Tables<"heaps">, "id" | "name" | "description">;

export type Activity = {
  id: string;
  title: string;
  subtitle: string | null;
  activity_type: string;
  created_at: string | null;
  status: string | null;
};

export type TableOfContentsItem = {
  level: number;
  title: string;
  end_char: number;
  end_line: number;
  start_char: number;
  start_line: number;
  sectionTags?: string[];
  sectionOtherTags?: string[];
};

export type FileMeta = {
  tags?: string[];
  folders?: string[];
  tags_raw?: string[];
  tags_pending?: string[];
  summary_short?: string;
  table_of_contents?: TableOfContentsItem[];
  extracted_file_hash?: string;
  extracted_storage_path?: string;
};

export type FileRow = {
  id: string;
  file_name: string | null;
  status: string | null;
  source_type: string | null;
  uploaded_at: string | null;
  meta: FileMeta | null;
};

export type Tag = {
  slug: string;
  label: string;
};


export type Member = {
  membership_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  role: string;
  display_name: string;
  avatar_url: string;
};

