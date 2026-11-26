import { Suspense } from "react";
import { SearchResults } from "@/components/SearchResults";

export const metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-x py-16">Loading…</div>}>
      <SearchResults />
    </Suspense>
  );
}
