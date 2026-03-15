import { redirect } from "next/navigation";

// For now, redirect to the analysis page.
// Future: this will be the marketing/landing page.
export default function Home() {
  redirect("/analyze");
}
