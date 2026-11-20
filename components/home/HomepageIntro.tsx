import Link from "next/link";
import { ArrowRight, BookOpen, Database, Sparkles } from "lucide-react";

const learningPaths = [
  {
    title: "Python",
    description: "Practical guides, from fundamentals to useful techniques.",
    href: "/topics/Python",
    icon: BookOpen,
    accent: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  },
  {
    title: "AI & machine learning",
    description: "Understand models and build with modern AI tools.",
    href: "/topics/AI",
    icon: Sparkles,
    accent: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  },
  {
    title: "Data science",
    description: "Work with data, analysis, and clear visualizations.",
    href: "/topics/Data_Science",
    icon: Database,
    accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
];

export default function HomepageIntro() {
  return (
    <section aria-labelledby="home-heading" className="mb-8 sm:mb-10">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 px-6 py-8 shadow-sm dark:border-slate-700 dark:from-gray-800 dark:via-gray-800 dark:to-slate-900 sm:px-9 sm:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl dark:bg-blue-500/10" />
        <div className="relative max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#0a73b0] dark:text-sky-300">
            Learn by building
          </p>
          <h1 id="home-heading" className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-gray-950 dark:text-white sm:text-4xl lg:text-5xl">
            Practical Python, data science, and AI guides.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
            Clear tutorials and useful resources to help you understand new ideas and put them to work in real projects.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/blog" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0a73b0] px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-[#085f91] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a73b0]">
              Browse tutorials <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/topics" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-white/80 px-5 py-2.5 font-semibold text-gray-800 transition hover:border-[#0a73b0] hover:text-[#0a73b0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a73b0] dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-100 dark:hover:border-sky-400 dark:hover:text-sky-300">
              Explore all topics
            </Link>
            <a href="#newsletter-signup" className="inline-flex min-h-11 items-center justify-center px-2 py-2.5 font-semibold text-[#0a73b0] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a73b0] dark:text-sky-300">
              Get new guides by email
            </a>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {learningPaths.map(({ title, description, href, icon: Icon, accent }) => (
          <Link key={title} href={href} className="group flex min-h-28 items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a73b0] dark:border-gray-700 dark:bg-gray-800 dark:hover:border-sky-700">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold text-gray-900 group-hover:text-[#0a73b0] dark:text-gray-100 dark:group-hover:text-sky-300">{title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">{description}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
