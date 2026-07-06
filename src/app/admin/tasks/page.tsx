import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Milestones",
};

export default async function AdminTasksRoute() {
  redirect("/admin/milestones");
}
