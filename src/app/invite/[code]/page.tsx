import InvitePreview from "@/components/guild/InvitePreview";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <InvitePreview code={code} />;
}
