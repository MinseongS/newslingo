import { NewsItemDetail } from "@/types/types";
import Image from "next/image";
import ExpandableSection from "./ExpandableSection";
import { formatDateKST } from "@/utils/utils";

// SSR 모드 강제: 이 설정을 통해 빌드 시 정적화 대신 런타임 SSR을 강제합니다.
export const dynamic = "force-dynamic";

// SSR로 전환하면 generateStaticParams는 제거합니다.
// export async function generateStaticParams() {
//     // SSG를 위해 자기 자신에게 fetch하는 로직 제거
//     // 또는 외부 API 사용 가능 시 외부 API로 대체
// }

async function fetchNewsDetail(id: string) {
    // 여기서는 실제 프로덕션 API Endpoint 또는 외부 API 주소를 사용하세요.
    // 로컬 빌드시 localhost:3000 호출을 피해야 합니다.
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

    return (
        <div className="max-w-4xl mx-auto p-4">
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
                            <div className="text-gray-700">
                                <p>{section.content}</p>
                            </div>
                        ) : (
                            <ExpandableSection content={section.content} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}