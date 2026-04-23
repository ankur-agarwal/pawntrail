import { requireUser } from "@/lib/supabase/current-user";
import {
  updateDisplayName,
  updateLichessUsername,
  removeLichessUsername,
  updateTheme,
  deleteAccount,
} from "./actions";
import { ExportGamesButton } from "@/components/settings/ExportGamesButton";

type SearchParams = { error?: string; saved?: string };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { profile } = await requireUser();
  const sp = await searchParams;

  return (
    <main style={{ padding: "40px 24px", maxWidth: 720, margin: "0 auto" }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
          marginBottom: 4,
        }}
      >
        PawnTrail · Settings
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 24px" }}>
        Settings
      </h1>

      {sp.error && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            border: "0.5px solid var(--pt-border-strong)",
            borderRadius: 6,
            background: "rgba(169, 79, 36, 0.08)",
            fontSize: 13,
          }}
        >
          {sp.error}
        </div>
      )}

      <Section title="Account">
        <form action={updateDisplayName} style={{ display: "grid", gap: 10 }}>
          <Row label="Email" value={profile?.email ?? "—"} />
          <Row label="Phone" value={profile?.phone ?? "—"} />
          <FormRow label="Display name">
            <input
              name="display_name"
              defaultValue={profile?.display_name ?? ""}
              style={inputStyle}
            />
            <SmallButton>Save</SmallButton>
          </FormRow>
        </form>
      </Section>

      <Section title="Lichess">
        {profile?.lichess_username ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>
              @{profile.lichess_username}
            </span>
            <form action={removeLichessUsername}>
              <SmallButton variant="ghost">Remove</SmallButton>
            </form>
          </div>
        ) : (
          <form action={updateLichessUsername} style={{ display: "grid", gap: 6 }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--pt-text-muted)",
                marginBottom: 6,
              }}
            >
              Connect your Lichess handle to open games in your study directly.
            </div>
            <FormRow label="Lichess username">
              <div
                style={{
                  display: "flex",
                  border: "0.5px solid var(--pt-border-strong)",
                  borderRadius: 4,
                  overflow: "hidden",
                  flex: 1,
                }}
              >
                <span
                  style={{
                    padding: "6px 10px",
                    background: "var(--pt-bg-elev)",
                    color: "var(--pt-text-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                  }}
                >
                  @
                </span>
                <input
                  name="lichess_username"
                  style={{ ...inputStyle, border: "none", borderRadius: 0 }}
                  placeholder="your_handle"
                />
              </div>
              <SmallButton>Verify &amp; pair</SmallButton>
            </FormRow>
          </form>
        )}
      </Section>

      <Section title="Theme">
        <form action={updateTheme} style={{ display: "flex", gap: 8 }}>
          {(["light", "dark", "system"] as const).map((t) => (
            <label
              key={t}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background:
                  profile?.theme === t
                    ? "var(--pt-forest)"
                    : "var(--pt-bg-elev)",
                color:
                  profile?.theme === t ? "var(--pt-cream)" : "var(--pt-text)",
                border: "0.5px solid var(--pt-border-strong)",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="theme"
                value={t}
                defaultChecked={profile?.theme === t}
                style={{ display: "none" }}
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
              />
              {t}
            </label>
          ))}
        </form>
      </Section>

      <Section title="Data">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <ExportGamesButton />
          <form action={deleteAccount}>
            <details>
              <summary
                style={{
                  fontSize: 12,
                  color: "var(--pt-blunder)",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Delete my account
              </summary>
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  border: "0.5px solid var(--pt-border-strong)",
                  borderRadius: 6,
                  background: "rgba(169, 79, 36, 0.05)",
                  fontSize: 12,
                }}
              >
                <p style={{ margin: "0 0 8px" }}>
                  This wipes every game, move, and scan. Type{" "}
                  <strong>DELETE</strong> to confirm.
                </p>
                <input
                  name="confirm"
                  placeholder="DELETE"
                  style={{ ...inputStyle, width: 200 }}
                />
                <button
                  type="submit"
                  style={{
                    marginLeft: 10,
                    padding: "6px 12px",
                    fontSize: 12,
                    background: "var(--pt-blunder)",
                    color: "var(--pt-cream)",
                    border: "0.5px solid var(--pt-blunder)",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Delete account
                </button>
              </div>
            </details>
          </form>
        </div>
      </Section>

    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        padding: 16,
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 8,
        background: "var(--pt-bg-elev)",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
          fontFamily: "var(--font-mono)",
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <span
        style={{
          width: 120,
          fontSize: 11,
          color: "var(--pt-text-muted)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13 }}>{value}</span>
    </div>
  );
}

function FormRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <span
        style={{
          width: 120,
          fontSize: 11,
          color: "var(--pt-text-muted)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center" }}>
        {children}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "6px 10px",
  fontSize: 13,
  background: "transparent",
  color: "var(--pt-text)",
  border: "0.5px solid var(--pt-border-strong)",
  borderRadius: 4,
  fontFamily: "inherit",
};

function SmallButton({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: "ghost";
}) {
  const isGhost = variant === "ghost";
  return (
    <button
      type="submit"
      style={{
        padding: "6px 12px",
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: isGhost ? "transparent" : "var(--pt-forest)",
        color: isGhost ? "var(--pt-text)" : "var(--pt-cream)",
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
