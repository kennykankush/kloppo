import { redirect } from "next/navigation";

// Handles GET /gaffers?id=12345 from the navbar search form
export default async function GaffersRoot({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (id) redirect(`/gaffers/${id}`);
  redirect("/");
}
