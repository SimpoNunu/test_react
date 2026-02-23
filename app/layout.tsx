import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Boutique en ligne",
  description: "Application e-commerce Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <main className="container mx-auto p-4">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
