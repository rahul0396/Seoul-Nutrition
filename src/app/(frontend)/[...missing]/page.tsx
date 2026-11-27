import { notFound } from "next/navigation";

// Any unknown URL shows the store's own 404 page (with header and footer).
export default function Missing() {
  notFound();
}
