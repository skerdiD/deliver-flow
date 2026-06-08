import { requireRole } from "@/lib/supabase/auth";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireRole("admin");

  return children;
}