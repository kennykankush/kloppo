import { redirect } from "next/navigation";
import { getBootstrap } from "@/lib/fpl";

export const revalidate = 300;

export default async function FixturesRedirect() {
  const bootstrap = await getBootstrap();
  const current = bootstrap.events.find((e) => e.is_current) ?? bootstrap.events.find((e) => e.is_next);
  redirect(`/fixtures/${current?.id ?? 1}`);
}
