"use client";

import { NewsItem, Pagination } from "@/types/types";
import { useState, useEffect } from "react";


export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const fetchNews = async () => {
      const response = await fetch(`/api/news?page=${currentPage}&pageSize=${pageSize}`);
      const data = await response.json();
      console.log(data.data);
      setNewsList(data.data);
      setPagination(data.pagination);
    };

    fetchNews();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">News Articles</h1>
      <div className="space-y-4">
        {newsList.map((news) => (
          <div key={news.id} className="flex gap-4 border-b pb-4">
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
              <a
                href={news.news_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-semibold text-blue-600 hover:underline"
              >
                {news.news_english[0].title}
              </a>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(news.broadcast_date).toLocaleDateString()}
              </p>
              <p className="text-gray-700 mt-2 line-clamp-2">{news.news_english[0].content}</p>
            </div>
          </div>
        ))}
      </div>
      {pagination && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}