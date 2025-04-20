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
    const [image, setImage] = useState<File | null>(null); // 🔹 단일 이미지 상태 추가
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status !== "loading" && !session?.user) {
            alert("로그인 후 이용해주세요.");
            router.back();
        }
    }, [session, status, router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImage(e.target.files[0]); // 🔹 단일 이미지 선택
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("category", category);
        if (image) {
            formData.append("image", image); // 🔹 단일 이미지 추가
        }

        try {
            const response = await fetch(`/api/boards`, {
                method: "POST",
                body: formData, // FormData 사용
            });

            if (response.ok) {
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

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (!session?.user) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">글쓰기</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">이미지 업로드</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                {image && (
                    <div className="mb-4">
                        <p>미리보기:</p>
                        <img src={URL.createObjectURL(image)} alt="Preview" className="w-32 h-32 rounded-md object-cover" />
                    </div>
                )}
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