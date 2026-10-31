import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, products } from "@/data/products";
import { getCollection } from "@/data/collections";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs, SectionHeading } from "@/components/ui";

export const generateStaticParams = () => products.map((p) => ({ handle: p.handle }));

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const p = getProduct((await params).handle);
  return p ? { title: p.title, description: p.subtitle } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) notFound();
  const main = getCollection(product.categories[0]);
  const related = products.filter((p) => p.id !== product.id && p.categories.some((c) => product.categories.includes(c))).slice(0, 4);
  const fill = related.length < 4 ? products.filter((p) => p.id !== product.id && !related.includes(p)).slice(0, 4 - related.length) : [];

  return (
    <>
      <div className="container-x py-4">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, ...(main ? [{ label: main.title.replace(" for Muscle Gain and Recovery", ""), href: `/collections/${main.handle}` }] : []), { label: product.title }]} />
      </div>
      <ProductDetail product={product} />
      <section className="container-x pb-10">
        <SectionHeading title="You may also like" />
        <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
          {[...related, ...fill].map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </>
  );
}
