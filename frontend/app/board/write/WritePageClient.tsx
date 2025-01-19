"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface WritePageProps {
    category: string;
}

export default function WritePageClient({ category }: WritePageProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const router = useRouter();
    const { data: session, status } = useSession();

    // 로그인 여부 확인
    useEffect(() => {
        // 세션이 로딩 중이 아니고, 로그인되어 있지 않다면 뒤로 가기
        if (status !== "loading" && !session?.user) {
            alert("로그인 후 이용해주세요.");
            router.back();
        }
    }, [session, status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/boards`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, category, userId: session?.user?.id }),
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

    // 세션 로딩이 끝나기 전에는 UI를 보여주지 않음
    if (status === "loading") {
        return <div>Loading...</div>;
    }

    // 세션 로딩이 끝났는데 user가 없으면(로그인 안됨), 이미 뒤로 갔으므로 UI 안보여줌
    if (!session?.user) {
        return null;
    }

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