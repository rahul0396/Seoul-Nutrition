import { LeadForm } from "@/components/LeadForm";
import { site } from "@/data/site";

export const metadata = { title: "Contact us" };

export default function ContactPage() {
  return (
    <div className="container-x grid gap-10 py-14 md:grid-cols-2">
      <div>
        <h1 className="text-4xl font-extrabold">Contact us</h1>
        <p className="mt-3 text-lg text-muted">We reply within one working day.</p>
        <dl className="mt-6 space-y-3">
          <div><dt className="text-sm font-bold text-muted">Email</dt><dd className="font-bold"><a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a></dd></div>
          <div><dt className="text-sm font-bold text-muted">Phone</dt><dd className="font-bold">{site.phone}</dd></div>
          <div><dt className="text-sm font-bold text-muted">Hours</dt><dd className="font-bold">{site.hours}</dd></div>
        </dl>
      </div>
      <LeadForm kind="contact" />
    </div>
  );
}
