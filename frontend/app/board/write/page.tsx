"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default async function WritePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; category?: string }>;
}) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const router = useRouter();
    const params = await searchParams;
    const category = params.category || "free"; // 쿼리 파라미터 가져오기

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/boards`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, category }),
            });

            if (response.ok) {
                // 성공 시 해당 카테고리 페이지로 이동
                router.push(`/board?category=${category}`);
            } else {
                const errorData = await response.json();
                alert(`글 작성 실패: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error submitting post:", error);
            alert("글 작성 중 문제가 발생했습니다.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">글쓰기</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">제목</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">내용</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-md p-2"
                        rows={6}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    작성하기
                </button>
            </form>
        </div>
    );
}