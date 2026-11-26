"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { sendLead } from "@/lib/leads";
import { Button } from "./ui";

const input = "h-12 w-full rounded-md border border-line-input px-4 outline-none focus:border-ink aria-[invalid=true]:border-danger";

// Saved to the Leads collection in /admin.
export function LeadForm({ kind }: { kind: "consult" | "contact" }) {
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState("");
  if (done) {
    return (
      <div className="grid place-items-center rounded-lg bg-surface p-10 text-center animate-pop">
        <CheckCircle2 className="size-12 text-success" aria-hidden />
        <p className="mt-3 text-xl font-extrabold">{kind === "consult" ? "Request received" : "Message sent"}</p>
        <p className="mt-1 text-muted">{kind === "consult" ? "A nutritionist will call you to fix a time." : "We will get back to you soon."}</p>
      </div>
    );
  }
  return (
    <form
      noValidate
      className="space-y-4 rounded-lg border border-line p-6 shadow-card"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const err: Record<string, string> = {};
        if (!String(f.get("name") || "").trim()) err.name = "Enter your name";
        if (!/^[6-9]\d{9}$/.test(String(f.get("phone") || ""))) err.phone = "Enter a 10 digit mobile number";
        if (kind === "contact" && !/^\S+@\S+\.\S+$/.test(String(f.get("email") || ""))) err.email = "Enter a valid email";
        if (kind === "contact" && !String(f.get("message") || "").trim()) err.message = "Write your message";
        setErrors(err);
        if (Object.keys(err).length) return;
        setBusy(true);
        const problem = await sendLead({ kind, name: f.get("name"), phone: f.get("phone"), email: f.get("email") || "", goal: f.get("goal") || undefined, message: f.get("message") || undefined, website: f.get("website") || "" });
        setBusy(false);
        if (problem) setSendError(problem);
        else setDone(true);
      }}
    >
      {([["name", "Full name", "text"], ["phone", "Mobile number", "tel"], ...(kind === "contact" ? [["email", "Email", "email"]] : [])] as [string, string, string][]).map(([n, l, t]) => (
        <label key={n} className="block"><span className="mb-1 block text-sm font-bold">{l}</span>
          <input name={n} type={t} className={input} aria-invalid={!!errors[n]} />
          {errors[n] && <span className="mt-1 block text-sm text-danger">{errors[n]}</span>}
        </label>
      ))}
      {kind === "consult" ? (
        <label className="block"><span className="mb-1 block text-sm font-bold">Your goal</span>
          <select name="goal" className={input}><option>Build muscle</option><option>Lose weight</option><option>Better sleep</option><option>Gut health</option><option>General wellness</option></select>
        </label>
      ) : (
        <label className="block"><span className="mb-1 block text-sm font-bold">Message</span>
          <textarea name="message" rows={5} className="w-full rounded-md border border-line-input p-4 outline-none focus:border-ink aria-[invalid=true]:border-danger" aria-invalid={!!errors.message} />
          {errors.message && <span className="mt-1 block text-sm text-danger">{errors.message}</span>}
        </label>
      )}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {sendError && <p className="text-sm text-danger" role="alert">{sendError}</p>}
      <Button size="lg" className="w-full" loading={busy}>{kind === "consult" ? "Request a call" : "Send message"}</Button>
    </form>
  );
}
