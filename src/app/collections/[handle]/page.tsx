import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { collections, getCollection, productsIn } from "@/data/collections";
import { trending } from "@/data/site";
import { CollectionView } from "@/components/CollectionView";
import { Accordion, Breadcrumbs } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const generateStaticParams = () => collections.map((c) => ({ handle: c.handle }));

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const c = getCollection((await params).handle);
  return c ? { title: c.title, description: c.intro } : {};
}

export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const c = getCollection(handle);
  if (!c) notFound();
  const items = productsIn(handle);
  const crumbs = [{ label: "Home", href: "/" }];
  if (handle.startsWith("whey-protein")) crumbs.push({ label: "Protein Powders", href: "/collections/protein-powders" });

  return (
    <>
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,var(--color-ink),#3a1214)] text-on-ink">
        <div className="container-x py-10 md:py-14">
          <div className="[&_a]:text-white/70 [&_a:hover]:text-white [&_nav]:text-white/70 [&_span[aria-current]]:text-white"><Breadcrumbs items={[...crumbs, { label: c.title.replace(" for Muscle Gain and Recovery", "") }]} /></div>
          <h1 className="mt-4 max-w-3xl animate-fade-up text-3xl font-extrabold tracking-tight md:text-5xl">{c.title}</h1>
          <p className="mt-3 max-w-2xl animate-fade-up text-white/80 [animation-delay:100ms]">{c.intro}</p>
        </div>
      </section>

      <section className="container-x py-8">
        <CollectionView items={items} />
      </section>

      {c.seo && (
        <section className="container-x space-y-14 py-10">
          {c.seo.compare && (
            <Reveal>
              <h2 className="mb-4 text-2xl font-extrabold">Compare the range</h2>
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-surface"><tr>{c.seo.compare.head.map((h, i) => <th key={i} scope="col" className="p-4 font-extrabold">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-line">
                    {c.seo.compare.rows.map((r, i) => <tr key={i}>{r.map((cell, j) => j === 0 ? <th key={j} scope="row" className="p-4 font-bold">{cell}</th> : <td key={j} className="p-4 text-muted">{cell}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>
            </Reveal>
          )}
          {c.seo.blocks && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {c.seo.blocks.map((b, k) => (
                <Reveal key={b.title} delay={k * 50}><div className="h-full rounded-lg bg-surface p-6"><h3 className="text-lg font-extrabold">{b.title}</h3><p className="mt-2 text-muted">{b.body}</p></div></Reveal>
              ))}
            </div>
          )}
          {c.seo.faqs && (
            <Reveal><h2 className="mb-4 text-2xl font-extrabold">Frequently asked questions</h2><Accordion items={c.seo.faqs} /></Reveal>
          )}
          <div>
            <p className="mb-3 font-bold">Popular searches</p>
            <p className="text-sm text-muted">
              {trending.map((t, i) => <span key={t}>{i > 0 && " · "}<Link href={`/search?q=${encodeURIComponent(t)}`} className="hover:text-ink hover:underline">{t}</Link></span>)}
            </p>
          </div>
        </section>
      )}
    </>
  );
}
