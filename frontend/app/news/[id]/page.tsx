import { NewsItemDetail } from "@/types/types";
import Image from "next/image";
import ExpandableSection from "./ExpandableSection";
import { formatDateKST } from "@/utils/utils";
import Comments from "@/components/Comments";
import Head from "next/head";
import { split } from "sentence-splitter";
import { notFound } from "next/navigation";
import SplitModeToggle from "./SplitModeToggle";
import SplitContent from "./SplitContent";

// SSR 모드 강제: 이 설정을 통해 빌드 시 정적화 대신 런타임 SSR을 강제합니다.
export const dynamic = "force-dynamic";

async function fetchNewsDetail(id: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000";
    const res = await fetch(`${baseUrl}/api/news?news_id=${id}`);
    if (!res.ok) {
        console.error(`Failed to fetch news detail with status: ${res.status}`);
        notFound();
    }
    return res.json() as Promise<NewsItemDetail>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const news = await fetchNewsDetail(id);

    // 예: 뉴스 제목 + 설명 구성
    const description =
        news.news_english[0].content +
        "..." +
        news.news_korean[0].content;

    return {
        title: `${news.news_english[0].title} - Newslingo`,
        description,
        openGraph: {
            title: news.news_english[0].title,
            description,
            url: `https://newslingo.site/news/${id}`,
            images: [news.thum_url || "/default-thumbnail.jpg"],
        },
        // 필요하다면 twitter, robots, etc. 추가
        twitter: {
            card: "summary_large_image",
            title: news.news_english[0].title,
            description,
            images: [news.thum_url || "/default-thumbnail.jpg"],
        },
    };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const news = await fetchNewsDetail(id);

    // 빈 텍스트와 공백만 있는 항목 제거
    function cleanParts(parts: string[]): string[] {
        return parts
            .map(part => part.trim()) // 공백 제거
            .filter(Boolean); // 비어 있거나 공백만 있는 항목 제거
    }


    return (
        <div className="max-w-4xl mx-auto p-4">

            <h1 className="text-3xl font-bold mb-6">{news.news_english[0].title}</h1>
            <p className="text-sm text-gray-500 mb-4">
                Published on: {formatDateKST(news.broadcast_date)}
            </p>
            <SplitModeToggle />
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

            <SplitContent english={news.news_english[0].content} korean={news.news_korean[0].content} />
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
            <Comments resourceType="news" resourceId={String(id)} />
        </div>
    );
}