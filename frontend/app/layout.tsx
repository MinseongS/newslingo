import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import SessionProvider from "@/context/SessionProvider";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Script from "next/script";

export const metadata = {
  title: "뉴스링고 | 무료 영어 뉴스 공부 사이트 - Newslingo",
  description: "뉴스링고는 영어 뉴스를 실시간 번역하여 한국어로 제공하는 무료 영어 뉴스 플랫폼입니다. 영어 뉴스 기사를 읽으며 실시간 번역과 함께 학습할 수 있어 영어 공부와 뉴스 이해를 동시에 할 수 있습니다. 영어 공부를 쉽고 재미있게 시작하세요. 무료로 영어 뉴스를 읽고, 학습하고, 실력을 키워보세요.",
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
        <meta name="description" content="뉴스링고는 최신 영어 뉴스를 실시간 번역하여 한국어로 제공합니다. 영어뉴스를 쉽게 보고 이해하세요." />
        <meta
          name="keywords"
          content="영어 최신 뉴스, 국내 뉴스, 최신 뉴스, 실시간 번역, 영어 번역, Newslingo, 영어 뉴스, 한국어 뉴스, 뉴스, 실시간 번역 뉴스, 영어 뉴스를 한국어로 번역, 뉴스링고, 뉴스 링고, 최신 영어 뉴스"
        />
        <meta name="author" content="Newslingo" />
        <meta name="robots" content="index, follow" />
        <meta name="google-adsense-account" content="ca-pub-1665728096998954" />

        {/* Open Graph 메타 태그 */}
        <meta property="og:title" content="뉴스링고 | 무료 영어 뉴스 공부 사이트 - Newslingo" />
        <meta property="og:description" content="뉴스링고는 영어 뉴스를 실시간 번역하여 한국어로 제공하는 무료 영어 뉴스 플랫폼입니다." />
        <meta property="og:image" content="https://newslingo.site/og-image.jpg" />
        <meta property="og:url" content="https://newslingo.site" />
        <meta property="og:type" content="website" />

        {/* Twitter 메타 태그 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Newslingo - 영어뉴스를 한국어로 보기" />
        <meta
          name="twitter:description"
          content="뉴스링고는 영어 뉴스를 실시간 번역하여 한국어로 제공하는 무료 영어 뉴스 플랫폼입니다."
        />
        <meta name="twitter:image" content="https://newslingo.site/twitter-image.jpg" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1665728096998954"
          crossOrigin="anonymous"></script>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-PG2HTB6WGL"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PG2HTB6WGL');
          `}
        </Script>
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