import { notFound } from "next/navigation";
import { isDev } from "@/lib/env";

/** Previews with no sign-in, from the invented fixture. Development only. */
export default function PreviewLayout({ children }: LayoutProps<"/apercu">) {
  if (!isDev) notFound();
  return children;
}
