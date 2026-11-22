import { QuizRunner } from "@/components/player/QuizRunner";

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <QuizRunner slug={slug} />;
}
