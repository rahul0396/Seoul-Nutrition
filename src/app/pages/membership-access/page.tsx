import { membership } from "@/data/site";
import { inr } from "@/lib/pricing";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { Accordion, SectionHeading } from "@/components/ui";
import { JoinButton } from "@/components/JoinButton";
import { site } from "@/data/site";

export const metadata = { title: "Membership" };

export default function MembershipPage() {
  const rows = [
    ["Member price on every product", "—", `${membership.discount}% off`],
    ["Free gift with next order", "—", "Yes"],
    ["Early access to launches and sales", "—", "Yes"],
    ["Member-only offers", "—", "Yes"],
    ["Free shipping threshold", "₹499", "₹499"],
  ];
  return (
    <>
      <section className="bg-[linear-gradient(135deg,var(--color-member),#0b2a21)] text-on-ink">
        <div className="container-x py-16 text-center md:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70 animate-fade-up">Seoul Access</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold md:text-6xl animate-fade-up [animation-delay:80ms]">Member prices on everything, all year</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80 animate-fade-up [animation-delay:160ms]">Join for {inr(membership.price)} and save up to 20% on every order for {membership.months} months.</p>
          <div className="mt-8 animate-fade-up [animation-delay:240ms]"><JoinButton light /></div>
        </div>
      </section>

      <section className="container-x py-14 md:py-20">
        <Reveal><SectionHeading title="What you get" /></Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {membership.benefits.map((b, k) => (
            <Reveal key={b.title} delay={k * 60}>
              <div className="h-full rounded-lg bg-surface p-6"><span className="grid size-12 place-items-center rounded-full bg-bg text-member"><Icon name={b.icon} /></span><p className="mt-4 text-lg font-extrabold">{b.title}</p><p className="mt-1 text-muted">{b.body}</p></div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x grid items-start gap-8 pb-14 md:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <div className="rounded-lg border-2 border-member p-8">
            <p className="inline-block rounded-full bg-member px-3 py-1 text-xs font-bold text-on-ink">Launch offer</p>
            <p className="mt-4 text-sm font-bold text-muted">{membership.months} months</p>
            <p className="mt-1 flex items-baseline gap-3"><span className="text-5xl font-extrabold">{inr(membership.price)}</span><span className="text-lg text-muted line-through">{inr(membership.mrp)}</span></p>
            <p className="mt-2 text-sm text-muted">One-time payment. No auto-renewal. Online payment only.</p>
            <div className="mt-6"><JoinButton /></div>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface"><tr><th scope="col" className="p-4"></th><th scope="col" className="p-4 font-extrabold">Regular</th><th scope="col" className="p-4 font-extrabold text-member">Member</th></tr></thead>
              <tbody className="divide-y divide-line">{rows.map((r) => <tr key={r[0]}><th scope="row" className="p-4 font-bold">{r[0]}</th><td className="p-4 text-muted">{r[1]}</td><td className="p-4 font-bold text-member">{r[2]}</td></tr>)}</tbody>
            </table>
          </div>
        </Reveal>
      </section>

      <section className="bg-surface py-14">
        <div className="container-x">
          <SectionHeading title="How it works" />
          <ol className="grid gap-4 md:grid-cols-3">
            {["Add membership to your cart", "Check out and pay online", "Member prices switch on right away"].map((t, k) => (
              <li key={t} className="rounded-lg bg-bg p-6"><span className="text-4xl font-extrabold text-member">0{k + 1}</span><p className="mt-2 text-lg font-bold">{t}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x max-w-3xl py-14">
        <SectionHeading title="Questions" />
        <Accordion items={membership.faqs} />
        <p className="mt-6 text-sm text-muted">Still stuck? Write to {site.email} or call {site.phone}.</p>
      </section>
    </>
  );
}
