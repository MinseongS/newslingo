"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/types/types";
import { useSession } from "next-auth/react"; // useSession 가져오기
import { formatDateKST } from "@/utils/utils";

async function fetchComments(newsId: string): Promise<Comment[]> {
    const res = await fetch(`/api/comments?news_id=${newsId}`);
    if (!res.ok) {
        throw new Error("Failed to fetch comments");
    }
    return res.json();
}

async function addComment(newsId: string, content: string, userId: string): Promise<Comment> {
    const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ newsId, content, userId }),
    });
    if (!res.ok) {
        throw new Error("Failed to add comment");
    }
    return res.json();
}

async function deleteComment(commentId: number): Promise<void> {
    const res = await fetch(`/api/comments?id=${commentId}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        throw new Error("Failed to delete comment");
    }
}

export default function Comments({ newsId }: { newsId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const { data: session } = useSession(); // 현재 세션 가져오기

    useEffect(() => {
        const loadComments = async () => {
            try {
                const fetchedComments = await fetchComments(newsId);
                setComments(fetchedComments);
            } catch (error) {
                console.error("Failed to load comments:", error);
            }
        };
        loadComments();
    }, [newsId]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id) {
            console.error("User is not logged in");
            return;
        }
        try {
            const addedComment = await addComment(newsId, newComment, session.user.id);
            setComments([...comments, addedComment]);
            setNewComment("");
        } catch (error) {
            console.error("Failed to submit comment:", error);
        }
    };

    const handleDelete = async (commentId: number) => {
        if (!session?.user?.id) {
            console.error("User is not logged in");
            return;
        }
        try {
            await deleteComment(commentId);
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
                    <div key={comment.id} className="border-b border-gray-200 pb-4 flex items-start space-x-4">
                        {comment.userImage ? (
                            <img
                                src={comment.userImage}
                                alt={`${comment.userName}'s profile`}
                                className="w-10 h-10 rounded-full"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-500">?</span>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-bold">{comment.userName || "Anonymous"}</p>
                            <p className="text-xs text-gray-500">
                                {formatDateKST(comment.createdAt)}
                            </p>
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
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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