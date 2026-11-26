import type { Payload } from "payload";
import { ORDER_STATUSES } from "../constants";

// Shown at the top of /admin: what needs doing today, at a glance.

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

type ProductDoc = { id: string; title: string; status: string; variants?: { label: string; stock: number }[] };
type OrderDoc = { totals?: { total?: number } };

async function count(payload: Payload, where: Record<string, unknown>) {
  const { totalDocs } = await payload.count({ collection: "orders", where: where as never, overrideAccess: true });
  return totalDocs;
}

export async function DashboardStats({ payload }: { payload: Payload }) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const since30 = new Date(Date.now() - 30 * 864e5);
  const sold = ["paid", "cod_confirmed", "packed", "shipped", "delivered"];

  const [codToConfirm, toPack, toShip, stockIssues, today, month, products] = await Promise.all([
    count(payload, { status: { equals: "cod_pending" } }),
    count(payload, { status: { in: ["paid", "cod_confirmed"] } }),
    count(payload, { status: { equals: "packed" } }),
    count(payload, { stockIssue: { equals: true } }),
    payload.find({ collection: "orders", where: { createdAt: { greater_than_equal: start.toISOString() }, status: { in: [...sold, "cod_pending"] } } as never, limit: 500, depth: 0, overrideAccess: true }),
    payload.find({ collection: "orders", where: { createdAt: { greater_than_equal: since30.toISOString() }, status: { in: sold } } as never, limit: 5000, depth: 0, overrideAccess: true }),
    payload.find({ collection: "products", where: { status: { equals: "active" } } as never, limit: 500, depth: 0, overrideAccess: true }),
  ]);

  const sum = (docs: unknown[]) => (docs as OrderDoc[]).reduce((a, o) => a + (o.totals?.total ?? 0), 0);
  const low = (products.docs as unknown as ProductDoc[])
    .flatMap((p) => (p.variants ?? []).map((v) => ({ id: p.id, title: p.title, label: v.label, stock: v.stock })))
    .filter((v) => v.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8);

  const link = (status: string) => `/admin/collections/orders?where[status][equals]=${status}`;
  const tiles: { label: string; value: string | number; href?: string; tone?: "warn" }[] = [
    { label: "COD orders to confirm", value: codToConfirm, href: link("cod_pending"), tone: codToConfirm ? "warn" : undefined },
    { label: "Ready to pack", value: toPack, href: `/admin/collections/orders?where[status][in][0]=paid&where[status][in][1]=cod_confirmed`, tone: toPack ? "warn" : undefined },
    { label: "Packed, not shipped", value: toShip, href: link("packed") },
    { label: "Today's orders", value: `${today.totalDocs} · ${inr(sum(today.docs))}` },
    { label: "Last 30 days (paid + confirmed)", value: `${month.totalDocs} · ${inr(sum(month.docs))}` },
    ...(stockIssues ? [{ label: "Orders with a stock problem", value: stockIssues, href: `/admin/collections/orders?where[stockIssue][equals]=true`, tone: "warn" as const }] : []),
  ];

  const card: React.CSSProperties = { border: "1px solid var(--theme-elevation-150)", borderRadius: 8, padding: "16px 18px", background: "var(--theme-elevation-0)", textDecoration: "none", color: "inherit", display: "block" };

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ margin: "0 0 12px" }}>Today at Seoul Nutrition</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
        {tiles.map((t) => {
          const inner = (
            <>
              <div style={{ fontSize: 13, opacity: 0.7 }}>{t.label}</div>
              <div style={{ fontSize: 24, fontWeight: 600, marginTop: 6, color: t.tone === "warn" ? "var(--theme-warning-650)" : undefined }}>{t.value}</div>
            </>
          );
          return t.href ? <a key={t.label} href={t.href} style={card}>{inner}</a> : <div key={t.label} style={card}>{inner}</div>;
        })}
      </div>
      {low.length > 0 && (
        <div style={{ ...card, marginTop: 12 }}>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>Low stock (10 or fewer)</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {low.map((v) => (
              <li key={v.id + v.label}>
                <a href={`/admin/collections/products/${v.id}`}>{v.title}</a> · {v.label}: <strong>{v.stock === 0 ? "sold out" : v.stock}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p style={{ fontSize: 12, opacity: 0.6, marginTop: 10 }}>Order flow: {ORDER_STATUSES.filter((s) => ["cod_pending", "paid", "packed", "shipped", "delivered"].includes(s.value)).map((s) => s.label).join(" → ")}</p>
    </div>
  );
}
