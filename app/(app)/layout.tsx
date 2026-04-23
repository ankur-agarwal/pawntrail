import { requireUser } from "@/lib/supabase/current-user";
import { AppShell } from "@/components/shell/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();
  return <AppShell profile={profile}>{children}</AppShell>;
}
