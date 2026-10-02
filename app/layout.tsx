import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ledgerly Backend",
  description: "Backend API for Ledgerly personal finance tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
