import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Plus,
} from "lucide-react";

const pageSize = 10;

const boardCategories = [
    { id: 1, name: "자유게시판", slug: "free" },
    { id: 2, name: "공부인증", slug: "study" },
    { id: 3, name: "질문게시판", slug: "questions" },
];

async function fetchBoardPosts(slug: string, page: number) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(
        `${baseUrl}/api/boards?page=${page}&pageSize=${pageSize}&category=${slug}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    return response.json();
}

export default async function BoardPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; category?: string }>;
}) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || "1", 10);
    const currentCategory = params.category || "free";

    if (currentPage <= 0 || !boardCategories.some((cat) => cat.slug === currentCategory)) {
        return <h1>404 - Page Not Found</h1>;
    }

    const data = await fetchBoardPosts(currentCategory, currentPage);
    const posts = data.data;
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
        <div className="max-w-4xl mx-auto p-4 relative">
            <h1 className="text-3xl font-bold mb-6">게시판</h1>

            {/* 카테고리 탭 */}
            <div className="mb-6">
                <div className="flex space-x-4">
                    {boardCategories.map((cat) => {
                        const isActive = cat.slug === currentCategory;
                        const href = `/board?page=1&category=${cat.slug}`;
                        return (
                            <Link
                                key={cat.id}
                                href={href}
                                className={`px-4 py-2 rounded-md ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                            >
                                {cat.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* 게시글 리스트 */}
            <div className="space-y-4">
                {posts.length > 0 ? (
                    posts.map((post: { id: number; title: string; createdAt: string }) => (
                        <Link
                            key={post.id}
                            href={`/board/${currentCategory}/${post.id}`}
                            className="block p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <h2 className="text-lg font-bold">{post.title}</h2>
                            <p className="text-gray-500 text-sm">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                        </Link>
                    ))
                ) : (
                    <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                        <p className="text-gray-500">아직 게시글이 없습니다.</p>
                        <p className="text-blue-600 mt-2">
                            <Link href={`/board/write?category=${currentCategory}`}>
                                첫 번째 글을 작성해보세요!
                            </Link>
                        </p>
                    </div>
                )}
            </div>

            {/* 글쓰기 버튼 */}
            <div className="flex justify-end mt-6">
                <Link
                    href={`/board/write?category=${currentCategory}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center"
                >
                    <Plus size={24} />
                    <span className="ml-2 hidden sm:inline">글쓰기</span>
                </Link>
            </div>

            {/* 페이지네이션 */}
            {pagination && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                    <Link
                        href={`/board?page=1&category=${currentCategory}`}
                        className={`p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 
              hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md ${currentPage === 1 ? "opacity-50 pointer-events-none" : ""
                            }`}
                    >
                        <ChevronsLeft size={16} />
                    </Link>
                    <Link
                        href={`/board?page=${currentPage - 1}&category=${currentCategory}`}
                        className={`p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300
              hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md ${currentPage === 1 ? "opacity-50 pointer-events-none" : ""
                            }`}
                    >
                        <ChevronLeft size={16} />
                    </Link>

                    {pageNumbers.map((pageNumber) => (
                        <Link
                            key={pageNumber}
                            href={`/board?page=${pageNumber}&category=${currentCategory}`}
                            className={`px-4 py-2 rounded-md ${pageNumber === currentPage
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                        >
                            {pageNumber}
                        </Link>
                    ))}

                    <Link
                        href={`/board?page=${currentPage + 1}&category=${currentCategory}`}
                        className={`p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 
              hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md ${currentPage === pagination.totalPages
                                ? "opacity-50 pointer-events-none"
                                : ""
                            }`}
                    >
                        <ChevronRight size={16} />
                    </Link>

                    <Link
                        href={`/board?page=${pagination.totalPages}&category=${currentCategory}`}
                        className={`p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 
              hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md ${currentPage === pagination.totalPages
                                ? "opacity-50 pointer-events-none"
                                : ""
                            }`}
                    >
                        <ChevronsRight size={16} />
                    </Link>
                </div>
            )}
        </div>
    );
}