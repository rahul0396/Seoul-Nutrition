import { LeadForm } from "@/components/LeadForm";
import { Stethoscope } from "lucide-react";

export const metadata = { title: "Free consultation" };

export default function ConsultPage() {
  return (
    <div className="container-x grid gap-10 py-14 md:grid-cols-2">
      <div className="animate-fade-up">
        <span className="grid size-14 place-items-center rounded-full bg-accent-soft text-accent"><Stethoscope className="size-7" aria-hidden /></span>
        <h1 className="mt-4 text-4xl font-extrabold">Book a free consultation</h1>
        <p className="mt-3 text-lg text-muted">Talk to a nutritionist for 15 minutes about your goals, diet and which products fit. No pressure to buy.</p>
        <ul className="mt-6 space-y-2 font-semibold">
          <li>✓ Personal protein and supplement plan</li><li>✓ Diet tips that fit Indian meals</li><li>✓ Answers about allergies and medication (we will refer you to a doctor where needed)</li>
        </ul>
      </div>
      <LeadForm kind="consult" />
    </div>
  );
}
