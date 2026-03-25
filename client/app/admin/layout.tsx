import type { Metadata } from "next";
import { AdminModeProvider } from "@/context/admin-mode-context";

export const metadata: Metadata = {
  title: "Architectural Lens | Admin listings",
  description: "Browse listings with internal notes",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminModeProvider>{children}</AdminModeProvider>;
}
