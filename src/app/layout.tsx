import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/data/site";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { NotifyMeModal, SignupPopup, Toast } from "@/components/Popups";

export const metadata: Metadata = {
  title: { default: `${site.name} | ${site.tagline}`, template: `%s | ${site.name}` },
  description: "Clean, lab-tested whey protein, creatine and daily nutrition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-on-ink">Skip to content</a>
        <StoreProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
          <NotifyMeModal />
          <SignupPopup />
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
