import Link from "next/link";
import { blogPosts } from "@/data/site";
import { Reveal } from "@/components/Reveal";

export const metadata = { title: "Journal" };

export default function JournalPage() {
  return (
    <div className="container-x py-12">
      <h1 className="text-4xl font-extrabold">The Seoul Journal</h1>
      <p className="mt-2 text-muted">Straight answers on protein, training and recovery.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {blogPosts.map((p, k) => (
          <Reveal key={p.slug} delay={k * 60}>
            <Link href={`/blogs/journal/${p.slug}`} className="group block h-full overflow-hidden rounded-lg border border-line transition hover:-translate-y-1 hover:shadow-pop">
              <div className="grid aspect-[4/3] place-items-center bg-surface-2 text-sm text-muted">Cover image</div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-accent">{p.tag} · {p.minutes} min</p>
                <h2 className="mt-2 text-lg font-extrabold group-hover:underline">{p.title}</h2>
                <p className="mt-1 text-sm text-muted">{p.excerpt}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
