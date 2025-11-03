import type { Metadata } from "next";
import { Martian_Mono, Roboto, Rokkitt } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

const defaultUrl = process.env.APP_URL
  ? `https://${process.env.APP_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "HEAPS",
  description: "FEED THE PILE",
};

const martianMono = Martian_Mono({
  variable: "--font-mono",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-sans",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

const rokkitt = Rokkitt({
  variable: "--font-serif",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.variable} ${rokkitt.variable} ${martianMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col items-center">
              <Header />
              {children}
              <Footer />
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
