import { AuroraBackground } from "@/components/home/AuroraBackground";
import { PromptComposer } from "@/components/home/PromptComposer";
import { Logo } from "@/components/brand/Logo";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-lavande-50">
      <AuroraBackground />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Navigation principale">
          <a href="#connexion" className="hidden min-h-11 items-center rounded-[10px] px-4 font-medium text-encre-2 hover:text-violet-700 sm:inline-flex">
            Se connecter
          </a>
          <a href="#prompt" className="btn-primaire">
            Commencer
          </a>
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 pb-24 pt-16 text-center sm:pt-24">
        <span className="pastille mb-7 animate-apparition">Gratuit · Sans compte · en français</span>
        <h1 className="animate-apparition text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-7xl">
          Une leçon.
          <br />
          <span className="text-violet-600">Une vidéo.</span>
        </h1>
        <p className="mt-7 max-w-2xl animate-apparition text-lg leading-relaxed text-encre-2 sm:text-xl">
          Colle ton cours, Lumio en fait une vidéo animée avec voix off et quiz.
        </p>
        <div className="mt-11 w-full animate-apparition">
          <PromptComposer />
        </div>
        <p className="mt-8 max-w-xl text-sm text-encre-2/80">
          Script, scènes animées, sous-titres et quiz en quelques secondes. Affine ta vidéo en discutant avec Lumio.
        </p>
      </section>

      <footer id="connexion" className="relative z-10 mx-auto max-w-7xl px-5 pb-8 text-center text-sm text-encre-2/70 sm:px-8">
        Lumio · une leçon, une vidéo
      </footer>
    </main>
  );
}
