import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import SessionProvider from "@/context/SessionProvider";
import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "Newslingo",
  description: "Realtime translation news website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}