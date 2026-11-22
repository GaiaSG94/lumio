import { StudentPlayer } from "@/components/player/StudentPlayer";

export default async function VideoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { slug } = await params;
  const { t } = await searchParams;
  return <StudentPlayer slug={slug} initialTime={Number(t) || 0} />;
}
