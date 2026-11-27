import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
      <div><p className="text-7xl font-extrabold text-accent">404</p><h1 className="mt-2 text-2xl font-extrabold">This page does not exist</h1>
      <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-6 font-bold text-on-ink">Back to home</Link></div>
    </div>
  );
}
