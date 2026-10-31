import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { benefitCollections, categoryCollections } from "@/data/collections";
import { experts, promises, testimonials, trending } from "@/data/site";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { HealthTabs, HeroSlider, TestimonialCard, VideoReviews } from "@/components/home";

export default function Home() {
  const tiles = [...categoryCollections, ...benefitCollections.slice(0, 4)];
  return (
    <>
      <HeroSlider />

      {/* Trending searches */}
      <section className="border-b border-line">
        <div className="container-x no-scrollbar flex items-center gap-3 overflow-x-auto py-4">
          <span className="shrink-0 text-sm font-bold text-muted">Trending:</span>
          {trending.map((t) => (
            <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="shrink-0 rounded-full bg-surface px-4 py-2 text-sm font-semibold transition hover:bg-ink hover:text-on-ink">{t}</Link>
          ))}
        </div>
      </section>

      {/* Shop by category */}
      <section className="container-x py-14 md:py-20">
        <Reveal><SectionHeading eyebrow="Find your fit" title="Shop by category" /></Reveal>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:gap-5 lg:grid-cols-6">
          {tiles.map((c, k) => (
            <Reveal key={c.handle} delay={k * 40}>
              <Link href={`/collections/${c.handle}`} className="group flex flex-col items-center gap-3 rounded-lg bg-surface p-4 text-center transition duration-300 hover:-translate-y-1 hover:bg-ink hover:text-on-ink">
                <span className="grid size-14 place-items-center rounded-full bg-bg text-ink transition group-hover:scale-110 md:size-16"><Icon name={c.icon} className="size-7" /></span>
                <span className="text-xs font-bold md:text-sm">{c.title.replace(" for Muscle Gain and Recovery", "")}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Video reviews */}
      <section className="bg-surface py-14 md:py-20">
        <div className="container-x">
          <Reveal><SectionHeading eyebrow="Real people, real routines" title="Hear it from them" sub="Tap a video to watch and shop the product in it." /></Reveal>
          <VideoReviews />
        </div>
      </section>

      {/* Health needs */}
      <section className="container-x py-14 md:py-20">
        <Reveal><SectionHeading eyebrow="Shop by need" title="What are you working on?" /></Reveal>
        <HealthTabs />
      </section>

      {/* Marquee */}
      <section className="overflow-hidden bg-accent py-4 text-on-accent" aria-label="Our promises">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-lg font-extrabold uppercase tracking-widest">
          {[...promises, ...promises, ...promises, ...promises].map((p, k) => <span key={k} className="flex items-center gap-10">{p.title}<span aria-hidden>✦</span></span>)}
        </div>
      </section>

      {/* Promise grid */}
      <section className="container-x py-14 md:py-20">
        <Reveal><SectionHeading eyebrow="The Seoul standard" title="What goes in, and what never does" /></Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {promises.map((p, k) => (
            <Reveal key={p.title} delay={k * 60}>
              <div className="flex h-full flex-col items-center gap-3 rounded-lg border border-line p-6 text-center">
                <Icon name={p.icon} className="size-9 text-accent" />
                <p className="font-bold">{p.title}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Science banner */}
      <section className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-lg bg-ink p-8 text-on-ink md:p-14">
            <FlaskConical className="absolute -right-6 -top-6 size-56 text-white/5" aria-hidden />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff9a9e]">Placeholder headline</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-extrabold md:text-5xl">The future of clean protein starts with a test report</h2>
            <p className="mt-4 max-w-xl text-white/75">Every batch is tested by an independent lab for protein content, heavy metals and amino spiking. The reports are public on every product page.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/pages/our-science" className="inline-flex h-12 items-center rounded-full bg-white px-6 font-bold text-ink hover:-translate-y-0.5 transition">Our science</Link>
              <Link href="/pages/our-promise" className="inline-flex h-12 items-center rounded-full border border-white/40 px-6 font-bold hover:bg-white/10">Our promise</Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Image + text */}
      <section className="container-x grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
        <Reveal>
          <div className="aspect-[4/3] rounded-lg bg-[linear-gradient(135deg,var(--color-surface-2),var(--color-surface))] p-6">
            <div className="grid size-full place-items-center rounded-md border-2 border-dashed border-line-input text-center text-muted">Brand photo placeholder<br />1200 × 900</div>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Our story</p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Nutrition made with the right intentions</h2>
          <p className="mt-4 text-muted">Placeholder: two or three sentences on why Seoul Nutrition exists and what makes it different. Keep it in your own voice.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/pages/ingredients" className="inline-flex items-center gap-2 font-bold hover:text-accent">Traceable ingredients <ArrowRight className="size-4" aria-hidden /></Link>
            <Link href="/pages/our-story" className="inline-flex items-center gap-2 font-bold hover:text-accent">Read our story <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
        </Reveal>
      </section>

      {/* Experts */}
      <section className="bg-surface py-14 md:py-20">
        <div className="container-x">
          <Reveal><SectionHeading eyebrow="Backed by experts" title="The people behind the formulas" /></Reveal>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {experts.map((e, k) => (
              <Reveal key={k} delay={k * 60}>
                <div className="overflow-hidden rounded-lg bg-bg">
                  <div className="grid aspect-square place-items-center bg-surface-2 text-sm text-muted">Photo placeholder</div>
                  <div className="p-4"><p className="font-bold">{e.name}</p><p className="text-sm text-muted">{e.role}</p><p className="text-xs text-muted">{e.place}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-x py-14 md:py-20">
        <Reveal><SectionHeading eyebrow="From our customers" title="Disbelievers turned believers" /></Reveal>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, k) => <Reveal key={k} delay={k * 60}><TestimonialCard t={t} /></Reveal>)}
        </div>
      </section>
    </>
  );
}
