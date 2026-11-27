import { notFound } from "next/navigation";
import { contentPages } from "@/data/site";
import { Breadcrumbs } from "@/components/ui";

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(contentPages).map((slug) => ({ slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = contentPages[(await params).slug];
  return p ? { title: p.title } : {};
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const page = contentPages[(await params).slug];
  if (!page) notFound();
  return (
    <article className="container-x max-w-3xl py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.title }]} />
      <h1 className="mt-4 text-4xl font-extrabold animate-fade-up">{page.title}</h1>
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">{page.body.map((p, i) => <p key={i}>{p}</p>)}</div>
    </article>
  );
}
