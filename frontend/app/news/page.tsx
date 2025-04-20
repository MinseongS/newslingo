import { NewsItem } from "@/types/types";
import { formatDateKST } from "@/utils/utils";
import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import NewsItemCard from "@/components/NewsItemCard";
import { notFound } from "next/navigation";

// 기본 메타데이터
export const metadata = {
    title: "최신 무료 영어 뉴스 | 뉴스링고 Newslingo",
    description: "최신 영어 뉴스를 무료로 읽고 공부하세요. 매일 업데이트되는 다양한 주제의 영어 뉴스를 제공합니다.",
};

// 동적 메타데이터 생성 (페이지 번호, 카테고리에 따라)
export async function generateMetadata({
    searchParams,
}: {
    searchParams: { page?: string; category?: string };
}) {
    const page = searchParams.page || "1";
    const category = searchParams.category || "All";

    let canonicalPath = '/news';

    // 첫 페이지이고 카테고리가 All일 경우 단순 /news로 canonical 설정
    if (page !== "1" || category !== "All") {
        canonicalPath += '?';
        if (page !== "1") {
            canonicalPath += `page=${page}`;
        }
        if (category !== "All") {
            canonicalPath += page !== "1" ? `&category=${category}` : `category=${category}`;
        }
    }

    return {
        title: category !== "All"
            ? `${category} 뉴스 - 무료 영어 뉴스 | 뉴스링고`
            : "최신 무료 영어 뉴스 | 뉴스링고 Newslingo",
        description: category !== "All"
            ? `${category} 관련 최신 영어 뉴스를 무료로 읽고 공부하세요.`
            : "최신 영어 뉴스를 무료로 읽고 공부하세요. 매일 업데이트되는 다양한 주제의 영어 뉴스를 제공합니다.",
        alternates: {
            canonical: canonicalPath,
        },
    };
}

const pageSize = 20;
const categories = [
    "All",
    "Finance",
    "Technology",
    "Social",
    "Sports",
    "Entertainment",
    "Politics",
    "Weather",
];

async function fetchNews(page: number, category: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const categoryParam = category && category !== "All" ? `&category=${category}` : "";
    const response = await fetch(
        `${baseUrl}/api/news?page=${page}&pageSize=${pageSize}${categoryParam}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`);
    }

    return response.json();
}

export async function generateStaticParams() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/news?page=1&pageSize=${pageSize}`);

    if (!response.ok) {
        throw new Error("Failed to fetch pagination data");
    }

    const data = await response.json();
    const totalPages = data.pagination.totalPages;

    return Array.from({ length: totalPages }, (_, index) => ({
        page: (index + 1).toString(),
    }));
}

export default async function NewsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; category?: string }>;
}) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || "1", 10);
    const currentCategory = params.category || "All";

    if (currentPage <= 0) {
        notFound();
    }

    const data = await fetchNews(currentPage, currentCategory);
    const newsList: NewsItem[] = data.data;
    const pagination = data.pagination;

    const generatePageNumbers = (current: number, total: number) => {
        const range = [];
        for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
            range.push(i);
        }
        return range;
    };

    const pageNumbers = pagination
        ? generatePageNumbers(pagination.currentPage, pagination.totalPages)
        : [];

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">News</h1>

            {/* 카테고리 탭 영역 (표 느낌) */}
            <div className="mb-6">
                <div
                    className="
                        grid
                        grid-cols-2 
                        sm:grid-cols-2  /* 모바일: 2칸 */
                        md:grid-cols-4  /* 태블릿: 4칸 */
                        lg:grid-cols-8  /* 데스크톱: 8칸 */
                        bg-black border border-gray-300 rounded
                        dark:bg-gray-800 dark:border-gray-600
                    "
                >
                    {categories.map((cat, index) => {
                        const isActive = cat === currentCategory;
                        const href = cat !== "All" ? `/news?page=1&category=${cat}` : `/news?page=1`;

                        return (
                            <Link
                                key={cat}
                                href={href}
                                className={`
                                    block text-center p-2 border-gray-300
                                    ${isActive
                                        ? "bg-blue-600 text-white dark:text-gray-900"
                                        : "bg-white hover:bg-gray-100 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-600 dark:text-white"
                                    }
                                    border-b border-r
                                    ${index % 2 === 1 ? "sm:border-r-0" : "sm:border-r"} /* 2칸 기준 오른쪽 경계선 */
                                    ${index % 4 === 3 ? "md:border-r-0" : "md:border-r"} /* 4칸 기준 오른쪽 경계선 */
                                    ${index % 8 === 7 ? "lg:border-r-0" : "lg:border-r"} /* 8칸 기준 오른쪽 경계선 */
                                    ${index >= 6 ? "sm:border-b-0" : "sm:border-b"} /* 2줄에서 마지막 줄 아래 경계선 제거 */
                                    ${index >= 4 ? "md:border-b-0" : "md:border-b"} /* 4줄에서 마지막 줄 아래 경계선 제거 */
                                    ${index >= 0 ? "lg:border-b-0" : "lg:border-b"} /* 1줄에서 마지막 줄 아래 경계선 제거 */
                                `}
                            >
                                {cat === "Entertainment" ? "Entertain." : cat}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* 뉴스 카드 리스트 */}
            <div className="space-y-4">
                {newsList.map((news) => (
                    <NewsItemCard
                        key={news.id}
                        id={news.id}
                        newsId={news.news_id}
                        title={news.news_english[0].title}
                        content={news.news_english[0].content}
                        thumbUrl={news.thum_url || ""}
                        broadcastDate={formatDateKST(news.broadcast_date, 9)}
                    />
                ))}
            </div>

            {/* 페이지네이션 */}
            {pagination && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                    <Link
                        href={`/news?page=1&category=${currentCategory}`}
                        className={`p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 
              hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md ${currentPage === 1 ? "opacity-50 pointer-events-none" : ""}`}
                        aria-label="Go to first page"
                    >
                        <ChevronsLeft size={16} />
                    </Link>
                    <Link
                        href={`/news?page=${currentPage - 1}&category=${currentCategory}`}
                        className={`p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300
              hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md ${currentPage === 1 ? "opacity-50 pointer-events-none" : ""}`}
                        aria-label="Go to previous page"
                    >
                        <ChevronLeft size={16} />
                    </Link>

                    {pageNumbers.map((pageNumber) => (
                        <Link
                            key={pageNumber}
                            href={`/news?page=${pageNumber}&category=${currentCategory}`}
                            className={`px-4 py-2 rounded-md ${pageNumber === currentPage
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                            aria-label={`Go to page ${pageNumber}`}
                        >
                            {pageNumber}
                        </Link>
                    ))}

                    <Link
                        href={`/news?page=${currentPage + 1}&category=${currentCategory}`}
                        className={`p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 
              hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md ${currentPage >= pagination.totalPages ? "opacity-50 pointer-events-none" : ""}`}
                        aria-label="Go to next page"
                    >
                        <ChevronRight size={16} />
                    </Link>

                    <Link
                        href={`/news?page=${pagination.totalPages}&category=${currentCategory}`}
                        className={`p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 
              hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md ${currentPage >= pagination.totalPages ? "opacity-50 pointer-events-none" : ""}`}
                        aria-label="Go to last page"
                    >
                        <ChevronsRight size={16} />
                    </Link>
                </div>
            )}
        </div>
    );
}