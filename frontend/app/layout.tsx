import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import SessionProvider from "@/context/SessionProvider";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const metadata = {
  title: "Newslingo - 영어뉴스를 한국어로 보기",
  description: "최신 국내 뉴스를 영어로 볼 수 있고, 한국어로 번역하여 제공합니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <head>
        {/* 기본 메타 태그 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="최신 국내 뉴스를 영어로 볼 수 있고, 한국어로 번역하여 제공합니다." />
        <meta
          name="keywords"
          content="영어 최신 뉴스, 국내 뉴스, 최신 뉴스, 실시간 번역, 영어 번역, Newslingo, 영어 뉴스, 한국어 뉴스, 뉴스, 실시간 번역 뉴스, 영어 뉴스를 한국어로 번역, 뉴스링고, 뉴스 링고, 최신 영어 뉴스"
        />
        <meta name="author" content="Newslingo" />
        <meta name="robots" content="index, follow" />
        <meta name="google-adsense-account" content="ca-pub-1665728096998954" />

        {/* Open Graph 메타 태그 */}
        <meta property="og:title" content="Newslingo - 영어뉴스를 한국어로 보기" />
        <meta property="og:description" content="영어 뉴스를 실시간으로 번역하여 제공합니다." />
        <meta property="og:image" content="https://newslingo.site/og-image.jpg" />
        <meta property="og:url" content="https://newslingo.site" />
        <meta property="og:type" content="website" />

        {/* Twitter 메타 태그 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Newslingo - 영어뉴스를 한국어로 보기" />
        <meta
          name="twitter:description"
          content="영어 뉴스를 실시간으로 번역하여 제공합니다."
        />
        <meta name="twitter:image" content="https://newslingo.site/twitter-image.jpg" />
      </head>
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