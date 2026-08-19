import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";

export const metadata = {
  title: "3D Bharat — Investor & Corporate Dashboard",
  description: "Infrastructure construction monitoring & investment platform for roads, bridges, railways, metro, and solar projects.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
