"use client";

import { NewsItemDetail } from "@/types/types";
import { useState, useEffect } from "react";
import { AiOutlineDown, AiOutlineRight } from "react-icons/ai"; // 아이콘 사용
import { use } from "react";

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [news, setNews] = useState<NewsItemDetail | null>(null);
    const [visibleSections, setVisibleSections] = useState<{ [key: number]: boolean }>({}); // 한글 콘텐츠 표시 상태

    useEffect(() => {
        const fetchNews = async () => {
            const response = await fetch(`/api/news?news_id=${id}`);
            const data = await response.json();
            console.log(data)
            setNews(data);
        };

        fetchNews();
    }, [id]);

    if (!news) {
        return <div>Loading...</div>;
    }

    const combinedContent = [];
    const englishParts = news.news_english[0].content.split("\n\n");
    const koreanParts = news.news_korean[0].content.split("\n\n");
    console.log(englishParts, koreanParts);
    for (let i = 0; i < englishParts.length; i++) {
        combinedContent.push({ type: "english", content: englishParts[i] });
        if (koreanParts[i]) {
            combinedContent.push({ type: "korean", content: koreanParts[i] });
        }
    }

    const toggleVisibility = (index: number) => {
        setVisibleSections((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">{news.news_english[0].title}</h1>
            <p className="text-sm text-gray-500 mb-4">
                Published on: {new Date(news.broadcast_date).toLocaleDateString()}
            </p>

            {news.thum_url ? (
                <img
                    src={news.thum_url}
                    alt={news.news_english[0].title}
                    className="w-full h-auto object-cover rounded-md mb-6"
                />
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
                            <div className="bg-gray-100 p-4 rounded-md">
                                <button
                                    onClick={() => toggleVisibility(index)}
                                    className="flex items-center gap-2 text-gray-600"
                                >
                                    {visibleSections[index] ? (
                                        <AiOutlineDown className="text-lg" />
                                    ) : (
                                        <AiOutlineRight className="text-lg" />
                                    )}
                                </button>
                                {visibleSections[index] && (
                                    <div className="mt-2 text-gray-700">
                                        <p>{section.content}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}