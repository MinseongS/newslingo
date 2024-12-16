import { NewsItemDetail } from "@/types/types";
import Image from "next/image";
import ExpandableSection from "./ExpandableSection";
import { formatDateKST } from "@/utils/utils";
import Comments from "./Comments";
import Head from "next/head";

// SSR 모드 강제: 이 설정을 통해 빌드 시 정적화 대신 런타임 SSR을 강제합니다.
export const dynamic = "force-dynamic";

async function fetchNewsDetail(id: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000";
    const res = await fetch(`${baseUrl}/api/news?news_id=${id}`);
    if (!res.ok) {
        throw new Error("Failed to fetch news detail");
    }
    return res.json() as Promise<NewsItemDetail>;
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const news = await fetchNewsDetail(id);

    const englishParts = news.news_english[0].content.split("\n\n");
    const koreanParts = news.news_korean[0].content.split("\n\n");

    const combinedContent = [];
    for (let i = 0; i < englishParts.length; i++) {
        combinedContent.push({ type: "english", content: englishParts[i] });
        if (koreanParts[i]) {
            combinedContent.push({ type: "korean", content: koreanParts[i] });
        }
    }

    // description 생성: 뉴스 본문 중 첫 번째 문장을 요약으로 사용
    const description =
        news.news_english[0].content.slice(0, 150) +
        "..." +
        news.news_korean[0].content.slice(0, 150);

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* 동적 메타데이터 설정 */}
            <Head>
                <title>{news.news_english[0].title} - Newslingo</title>
                <meta name="description" content={description} />
                <meta property="og:title" content={news.news_english[0].title} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={news.thum_url || "/default-thumbnail.jpg"} />
                <meta property="og:url" content={`https://newslingo.site/news/${id}`} />
                <meta name="robots" content="index, follow" />
            </Head>

            <h1 className="text-3xl font-bold mb-6">{news.news_english[0].title}</h1>
            <p className="text-sm text-gray-500 mb-4">
                Published on: {formatDateKST(news.broadcast_date)}
            </p>

            {news.thum_url ? (
                <div className="mb-6 relative w-full h-64">
                    <Image
                        src={news.thum_url}
                        alt={news.news_english[0].title}
                        className="object-cover rounded-md"
                        fill
                        sizes="100vw"
                    />
                </div>
            ) : (
                <div className="w-full h-64 bg-gray-300 rounded-md flex items-center justify-center mb-6">
                    <span>No Image</span>
                </div>
            )}

            <div className="space-y-4">
                {combinedContent.map((section, index) => (
                    <div key={index}>
                        {section.type === "english" ? (
                            <div>
                                <p>{section.content}</p>
                            </div>
                        ) : (
                            <ExpandableSection content={section.content} />
                        )}
                    </div>
                ))}
            </div>
            <div className="text-xs text-gray-500 mt-4">
                Arirang news{" "}
                <a
                    href={news.news_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-400"
                >
                    {news.news_url}
                </a>
            </div>
            <Comments newsId={id} />
        </div>
    );
}