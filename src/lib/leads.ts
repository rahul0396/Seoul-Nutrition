// Sends a form to /api/leads (contact, consultation, back-in-stock, newsletter).
// Resolves to an error message, or null when it worked.
export async function sendLead(data: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) return null;
    const body = await res.json().catch(() => ({}));
    return body.message || "Could not send. Please try again.";
  } catch {
    return "Network problem. Check your internet and try again.";
  }
}
