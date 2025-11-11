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
