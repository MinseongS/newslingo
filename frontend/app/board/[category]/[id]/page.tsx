import Link from "next/link";
import { Post } from "@/types/types";
import { formatDateKST } from "@/utils/utils";
import Comments from "@/components/Comments";
import DeleteButton from "./DeleteButton";
import { notFound } from "next/navigation";


async function fetchBoardPost(id: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000";
    const res = await fetch(`${baseUrl}/api/boards?id=${id}`);
    if (!res.ok) {
        notFound();
    }
    return res.json() as Promise<Post>;
}

export default async function PostPage({ params }: { params: Promise<{ category: string, id: string }> }) {
    const { category, id } = await params;
    const post = await fetchBoardPost(id);

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto p-4 text-center">
                <p className="text-lg text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <p className="text-sm mb-4">
                <Link href={`/board/${post.board.code}`}>
                    <span className="font-medium">{post.board.name}</span>
                </Link>
            </p>
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

            {/* 글쓴이 정보와 시간 정보 */}
            {post.author && (
                <div className="flex items-center justify-between mb-4">
                    {/* 글쓴이 정보 */}
                    <div className="flex items-center">
                        {post.author.profilePicture && (
                            <img
                                src={post.author.profilePicture}
                                alt={`${post.author.name}'s profile`}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                        )}
                        <p className="text-sm">
                            <span className="font-medium">{post.author.name || "Unknown"}</span>
                        </p>
                    </div>

                    {/* 시간 정보 */}
                    <p className="text-sm text-gray-500">
                        {formatDateKST(post.createdAt)}
                    </p>
                </div>
            )}

            <div className="text-lg">{post.content}</div>
            <Comments resourceType="board" resourceId={String(id)} />
            <div className="mt-4">
                <DeleteButton resourceId={String(id)} resourceType={category} post={post} />
            </div>
        </div>
    );
}