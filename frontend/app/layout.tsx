import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import SessionProvider from "@/context/SessionProvider";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeSwitcher } from "@/components/theme-switcher";

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
            <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
              <p>
                Powered by{" "}
                <a
                  href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                  target="_blank"
                  className="font-bold hover:underline"
                  rel="noreferrer"
                >
                  Newslingo
                </a>
              </p>
              <ThemeSwitcher />
            </footer>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}