"use client";

import type { ReactNode } from "react";
import { Micro, SegControl } from "./primitives";

export interface HeadersFormState {
  color: "white" | "black";
  result: "win" | "loss" | "draw" | "unknown";
  opponent_name: string;
  opponent_rating: string;
  played_on: string;
  tournament_name: string;
  round: string;
  time_control: string;
}

export const EMPTY_HEADERS: HeadersFormState = {
  color: "white",
  result: "unknown",
  opponent_name: "",
  opponent_rating: "",
  played_on: "",
  tournament_name: "",
  round: "",
  time_control: "",
};

export function HeadersForm({
  state,
  onChange,
}: {
  state: HeadersFormState;
  onChange: (next: HeadersFormState) => void;
}) {
  const set = <K extends keyof HeadersFormState>(
    key: K,
    value: HeadersFormState[K],
  ) => onChange({ ...state, [key]: value });

  return (
    <div
      style={{
        padding: 14,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}
    >
      <Field label="Your color">
        <SegControl<"white" | "black">
          value={state.color}
          options={[
            { value: "white", label: "White" },
            { value: "black", label: "Black" },
          ]}
          onChange={(v) => set("color", v)}
        />
      </Field>
      <Field label="Result">
        <SegControl<"win" | "loss" | "draw" | "unknown">
          value={state.result}
          options={[
            { value: "win", label: "Win" },
            { value: "loss", label: "Loss" },
            { value: "draw", label: "Draw" },
          ]}
          onChange={(v) => set("result", v)}
        />
      </Field>
      <Field label="Opponent">
        <Input
          value={state.opponent_name}
          onChange={(v) => set("opponent_name", v)}
        />
      </Field>
      <Field label="Rating">
        <Input
          value={state.opponent_rating}
          onChange={(v) => set("opponent_rating", v)}
          mono
          inputMode="numeric"
        />
      </Field>
      <Field label="Date">
        <Input
          type="date"
          value={state.played_on}
          onChange={(v) => set("played_on", v)}
          mono
        />
      </Field>
      <Field label="Time control">
        <Input
          value={state.time_control}
          onChange={(v) => set("time_control", v)}
          mono
          placeholder="90+30"
        />
      </Field>
      <Field label="Tournament">
        <Input
          value={state.tournament_name}
          onChange={(v) => set("tournament_name", v)}
        />
      </Field>
      <Field label="Round">
        <Input
          value={state.round}
          onChange={(v) => set("round", v)}
          mono
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Micro style={{ color: "var(--pt-text-muted)" }}>{label}</Micro>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  mono = false,
  placeholder,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  mono?: boolean;
  placeholder?: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      style={{
        padding: "6px 10px",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
        fontSize: 13,
        background: "var(--pt-bg)",
        color: "var(--pt-text)",
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 4,
        outline: "none",
      }}
    />
  );
}
