import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/data/site";
import { products } from "@/data/products";
import { Breadcrumbs } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";

export const dynamicParams = false;
export const generateStaticParams = () => blogPosts.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = blogPosts.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.excerpt } : {};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <article className="container-x max-w-3xl py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Journal", href: "/blogs/journal" }, { label: post.title }]} />
      <p className="mt-6 text-xs font-bold uppercase tracking-widest text-accent">{post.tag} · {post.minutes} min read · {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
      <h1 className="mt-2 text-4xl font-extrabold leading-tight">{post.title}</h1>
      <div className="mt-6 grid aspect-[16/9] place-items-center rounded-lg bg-surface-2 text-muted">Cover image placeholder</div>
      <div className="mt-8 space-y-4 text-lg leading-relaxed text-muted">
        <p>{post.excerpt}</p>
        <p>Placeholder article body. Write the full post in your CMS or add it here as Markdown.</p>
      </div>
      <div className="mt-12">
        <p className="mb-4 text-xl font-extrabold">Shop the article</p>
        <div className="grid grid-cols-2 gap-4">{products.slice(0, 2).map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </div>
      <Link href="/blogs/journal" className="mt-10 inline-block font-bold hover:underline">← All articles</Link>
    </article>
  );
}
