import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import SessionProvider from "@/context/SessionProvider";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Script from "next/script";

export const metadata = {
  title: "무료 영어 뉴스로 쉽고 빠른 영어 공부 | 뉴스링고 Newslingo",
  description:
    "영어 공부할 때 가장 먼저 찾는 사이트! 매일 업데이트되는 최신 영어 뉴스로 쉽고 편하게 영어 공부하세요.",
  keywords: [
    "영어 뉴스",
    "영어 뉴스 사이트",
    "무료 영어 뉴스 사이트",
    "무료 영어 공부 사이트",
    "영어 기사",
    "영문 기사",
    "영어 기사 사이트",
    "영어 뉴스 기사",
    "영자 신문",
    "영어 신문 사이트"
  ],
  // <meta name="author" content="Newslingo" 를 표현하기 위한 필드
  authors: [{ name: "Newslingo", url: "https://newslingo.site" }],
  // <meta name="robots" content="index, follow" 를 표현하기 위한 설정
  robots: {
    index: true,
    follow: true,
  },
  // canonical URL 추가
  metadataBase: new URL("https://newslingo.site"),
  alternates: {
    canonical: '/',
  },
  // og 태그 -> openGraph 로 설정
  openGraph: {
    type: "website",
    url: "https://newslingo.site",
    title: "무료 영어 뉴스로 쉽고 빠른 영어 공부 | 뉴스링고",
    description:
      "영어 공부할 때 가장 먼저 찾는 사이트! 매일 업데이트되는 최신 영어 뉴스로 쉽고 편하게 영어 공부하세요.",
    images: [
      {
        url: "https://newslingo.site/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Newslingo OG Image",
      },
    ],
  },
  // 트위터 메타 태그 -> twitter 로 설정
  twitter: {
    card: "summary_large_image",
    title: "무료 영어 뉴스로 쉽고 빠른 영어 공부 | 뉴스링고",
    description:
      "영어 공부할 때 가장 먼저 찾는 사이트! 매일 업데이트되는 최신 영어 뉴스로 쉽고 편하게 영어 공부하세요.",
    images: ["https://newslingo.site/og-image.jpg"],
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={GeistSans.className} suppressHydrationWarning>
      <head>
        {/* <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="뉴스링고는 영어 뉴스를 번역하여 한국어로 제공하는 무료 영어 뉴스 플랫폼입니다. 영어 공부를 쉽고 재미있게 시작하세요." />
        <meta
          name="keywords"
          content="영어 최신 뉴스, 국내 뉴스, 최신 뉴스, 실시간 번역, 영어 번역, Newslingo, 영어 뉴스, 한국어 뉴스, 뉴스, 실시간 번역 뉴스, 영어 뉴스를 한국어로 번역, 뉴스링고, 뉴스 링고, 최신 영어 뉴스"
        />
        <meta name="author" content="Newslingo" />
        <meta name="robots" content="index, follow" />
        <meta name="google-adsense-account" content="ca-pub-1665728096998954" />

        <meta property="og:title" content="무료 영어 뉴스 공부 사이트 - Newslingo" />
        <meta property="og:description" content="뉴스링고는 영어 뉴스를 실시간 번역하여 한국어로 제공하는 무료 영어 뉴스 플랫폼입니다." />
        <meta property="og:image" content="https://newslingo.site/og-image.jpg" />
        <meta property="og:url" content="https://newslingo.site" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="무료 영어 뉴스 공부 사이트 - Newslingo" />
        <meta
          name="twitter:description"
          content="뉴스링고는 영어 뉴스를 실시간 번역하여 한국어로 제공하는 무료 영어 뉴스 플랫폼입니다."
        />
        <meta name="twitter:image" content="https://newslingo.site/twitter-image.jpg" /> */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1665728096998954"
          crossOrigin="anonymous"></script>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-PG2HTB6WGL"
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-QYEY9MPQ2Z"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PG2HTB6WGL');
            gtag('config', 'G-QYEY9MPQ2Z');
          `}
        </Script>
        <Script strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-P7QDPMMQ');
          `}
        </Script>
      </head>
      <body className="bg-background text-foreground">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P7QDPMMQ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
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