import type { Database } from "./types";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Insert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Update<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type Game = Tables<"games">;
export type Move = Tables<"moves">;
export type Scan = Tables<"scans">;
export type BillingEvent = Tables<"billing_events">;
