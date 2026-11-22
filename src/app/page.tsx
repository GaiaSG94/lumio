import { AuroraBackground } from "@/components/home/AuroraBackground";
import { PromptComposer } from "@/components/home/PromptComposer";
import { Logo } from "@/components/brand/Logo";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-lavender-50">
      <AuroraBackground />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main navigation">
          <a href="#login" className="hidden min-h-11 items-center rounded-[10px] px-4 font-medium text-ink-2 hover:text-violet-700 sm:inline-flex">
            Log in
          </a>
          <a href="#prompt" className="btn-primary">
            Get started
          </a>
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 pb-24 pt-16 text-center sm:pt-24">
        <span className="pastille mb-7 animate-appear">Free · No account · In English</span>
        <h1 className="animate-appear text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-7xl">
          One lesson.
          <br />
          <span className="text-violet-600">One video.</span>
        </h1>
        <p className="mt-7 max-w-2xl animate-appear text-lg leading-relaxed text-ink-2 sm:text-xl">
          Paste your lesson, Lumio turns it into an animated video with voiceover and a quiz.
        </p>
        <div className="mt-11 w-full animate-appear">
          <PromptComposer />
        </div>
        <p className="mt-8 max-w-xl text-sm text-ink-2/80">
          Script, animated scenes, subtitles and a quiz in seconds. Refine your video by chatting with Lumio.
        </p>
      </section>

      <footer id="login" className="relative z-10 mx-auto max-w-7xl px-5 pb-8 text-center text-sm text-ink-2/70 sm:px-8">
        Lumio · one lesson, one video
      </footer>
    </main>
  );
}
