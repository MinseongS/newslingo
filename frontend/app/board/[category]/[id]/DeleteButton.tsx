"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/types/types";

interface DeleteButtonProps {
    resourceId: string;
    resourceType: string;
    post: Post;
}

export default function DeleteButton({ resourceId, resourceType, post }: DeleteButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const confirmed = confirm("정말 삭제하시겠습니까?");
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/boards?id=${resourceId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete the post.");
            }

            router.push(`/board?category=${resourceType}`);
        } catch (error) {
            console.error(error);
            alert("An error occurred while deleting the post.");
        } finally {
            setIsDeleting(false);
        }
    };
    return (
        <>
            {session?.user?.id === post.author?.id ? (
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                    {isDeleting ? "Deleting..." : "Delete"}
                </button>
            ) : (
                <p className="text-gray-500 mt-6">You must be logged in to delete this post.</p>
            )}
        </>
    );
}