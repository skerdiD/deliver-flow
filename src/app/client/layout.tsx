import { requireRole } from "@/lib/supabase/auth";

type ClientLayoutProps = {
  children: React.ReactNode;
};

export default async function ClientLayout({ children }: ClientLayoutProps) {
  await requireRole("client");

  return children;
}