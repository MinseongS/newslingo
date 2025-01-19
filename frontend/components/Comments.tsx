"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatDateKST } from "@/utils/utils";

interface CommentType {
    id: number;
    content: string;
    userId: string;
    userImage?: string;
    userName?: string;
    createdAt: string;
}

interface CommentsProps {
    resourceType: "board" | "news";  // 게시판 or 뉴스
    resourceId: string;             // 게시글 ID 혹은 뉴스 ID
}

export default function Comments({ resourceType, resourceId }: CommentsProps) {
    const [comments, setComments] = useState<CommentType[]>([]);
    const [newComment, setNewComment] = useState("");
    const { data: session } = useSession();

    // API URL 결정
    const getFetchUrl = () => {
        return resourceType === "board"
            ? `/api/boards/comments?id=${resourceId}`
            : `/api/comments?news_id=${resourceId}`;
    };
    const getPostUrl = () => {
        return resourceType === "board"
            ? `/api/boards/comments`
            : `/api/comments`;
    };
    const getDeleteUrl = (commentId: number) => {
        return resourceType === "board"
            ? `/api/boards/comments?id=${commentId}`
            : `/api/comments?id=${commentId}`;
    };

    // 댓글 불러오기
    useEffect(() => {
        const loadComments = async () => {
            try {
                const res = await fetch(getFetchUrl());
                if (!res.ok) {
                    throw new Error("Failed to fetch comments");
                }
                const fetchedComments: CommentType[] = await res.json();
                setComments(fetchedComments);
            } catch (error) {
                console.error("Failed to load comments:", error);
            }
        };
        loadComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resourceId, resourceType]);

    // 댓글 추가
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id) {
            console.error("User is not logged in");
            return;
        }

        // 댓글이 비어있는지 검사
        if (!newComment.trim()) {
            alert("댓글을 작성해주세요.");
            return;
        }

        try {
            const res = await fetch(getPostUrl(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // 게시판과 뉴스에서 서버가 받는 파라미터 이름이 다를 수 있으므로 분기 처리
                body: JSON.stringify(
                    resourceType === "board"
                        ? { id: resourceId, content: newComment, userId: session.user.id }
                        : { newsId: resourceId, content: newComment, userId: session.user.id }
                ),
            });
            if (!res.ok) {
                throw new Error("Failed to add comment");
            }
            const addedComment: CommentType = await res.json();
            setComments([...comments, addedComment]);
            setNewComment("");
        } catch (error) {
            console.error("Failed to submit comment:", error);
        }
    };

    // 댓글 삭제
    const handleDelete = async (commentId: number) => {
        if (!session?.user?.id) {
            console.error("User is not logged in");
            return;
        }
        try {
            const res = await fetch(getDeleteUrl(commentId), {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error("Failed to delete comment");
            }
            setComments(comments.filter((comment) => comment.id !== commentId));
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    };

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Comments</h2>
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div
                        key={comment.id}
                        className="border-b border-gray-200 pb-4 flex items-start space-x-4"
                    >
                        {comment.userImage ? (
                            <img
                                src={comment.userImage}
                                alt={`${comment.userName || "User"}'s profile`}
                                className="w-10 h-10 rounded-full"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-500">?</span>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-bold">{comment.userName || "Anonymous"}</p>
                            <p className="text-xs text-gray-500">{formatDateKST(comment.createdAt)}</p>
                            <p className="text-gray-700">{comment.content}</p>
                            {comment.userId === session?.user?.id && (
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="text-red-500 text-sm hover:underline mt-2"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {session?.user ? (
                <form onSubmit={handleCommentSubmit} className="mt-6">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Add a comment..."
                    />
                    <button
                        type="submit"
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Submit
                    </button>
                </form>
            ) : (
                <p className="text-gray-500 mt-6">You must be logged in to add a comment.</p>
            )}
        </div>
    );
}