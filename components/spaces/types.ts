import { Tables } from "@/lib/types/supabase";

export type Space = Pick<Tables<"heaps">, "id" | "name" | "description">;