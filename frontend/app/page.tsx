import { NewsItem } from "@/types/types";
import { formatDateKST } from "@/utils/utils";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import NewsItemCard from "@/components/NewsItemCard";

const pageSize = 20;

// Fetch news data at build time
async function fetchNews(page: number) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/news?page=${page}&pageSize=${pageSize}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.statusText}`);
  }

  return response.json();
}

// SSG: Define static paths
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

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);

  if (currentPage <= 0) {
    return <h1>404 - Page Not Found</h1>;
  }

  const data = await fetchNews(currentPage);
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
      <div className="space-y-4">
        {newsList.map((news) => (
          <NewsItemCard
            key={news.id}
            id={news.id}
            newsId={news.news_id}
            title={news.news_english[0].title}
            content={news.news_english[0].content}
            thumbUrl={news.thum_url || ""}
            broadcastDate={formatDateKST(news.broadcast_date)}
          />
        ))}
      </div>
      {pagination && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <Link
            href={`/news?page=1`}
            className={`p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md ${currentPage === 1 ? "opacity-50 pointer-events-none" : ""}`}
          >
            <ChevronsLeft size={16} />
          </Link>

          <Link
            href={`/news?page=${currentPage - 1}`}
            className={`p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md ${currentPage === 1 ? "opacity-50 pointer-events-none" : ""}`}
          >
            <ChevronLeft size={16} />
          </Link>

          {pageNumbers.map((pageNumber) => (
            <Link
              key={pageNumber}
              href={`/news?page=${pageNumber}`}
              className={`px-4 py-2 rounded-md ${pageNumber === currentPage
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
            >
              {pageNumber}
            </Link>
          ))}

          <Link
            href={`/news?page=${currentPage + 1}`}
            className={`p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md ${currentPage === pagination.totalPages
              ? "opacity-50 pointer-events-none"
              : ""}`}
          >
            <ChevronRight size={16} />
          </Link>

          <Link
            href={`/news?page=${pagination.totalPages}`}
            className={`p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md ${currentPage === pagination.totalPages
              ? "opacity-50 pointer-events-none"
              : ""}`}
          >
            <ChevronsRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}