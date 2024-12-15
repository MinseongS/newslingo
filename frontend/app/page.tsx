import { NewsItem } from "@/types/types";
import { formatDateKST } from "@/utils/utils";
import Link from "next/link";

const pageSize = 20;

async function fetchNews(page: number) {
  // 절대 경로를 구성
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/news?page=${page}&pageSize=${pageSize}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.statusText}`);
  }

  return response.json();
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);

  const data = await fetchNews(currentPage);
  const newsList: NewsItem[] = data.data;
  const pagination = data.pagination;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">News</h1>
      <div className="space-y-4">
        {newsList.map((news) => (
          <Link key={news.id} href={`/news/${news.news_id}`} className="flex gap-4 border-b pb-4">
            {news.thum_url ? (
              <img
                src={news.thum_url}
                alt={news.news_english[0].title}
                className="w-32 h-32 object-cover rounded-md"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-300 rounded-md flex items-center justify-center">
                <span>No Image</span>
              </div>
            )}
            <div>
              <p className="text-xl font-semibold">
                {news.news_english[0].title}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {formatDateKST(news.broadcast_date)}
              </p>
              <p className="text-gray-700 mt-2 line-clamp-2">
                {news.news_english[0].content}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {pagination && (
        <div className="flex justify-between items-center mt-6">
          <Link
            href={`/news?page=${currentPage - 1}`}
            className={`px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md ${currentPage === 1 ? "opacity-50 pointer-events-none" : ""
              }`}
          >
            Previous
          </Link>
          <span className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Link
            href={`/news?page=${currentPage + 1}`}
            className={`px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md ${currentPage === pagination.totalPages ? "opacity-50 pointer-events-none" : ""
              }`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}