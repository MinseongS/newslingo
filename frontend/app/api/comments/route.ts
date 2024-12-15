import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: 댓글 조회
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const newsId = searchParams.get("news_id");
    if (!newsId) {
        return NextResponse.json({ error: "news_id is required" }, { status: 400 });
    }

    try {
        const comments = await prisma.comment.findMany({
            where: { news_id: newsId },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true,
                    },
                },
            },
        });

        // 사용자 정보를 포함한 댓글 데이터 형식 변환
        const formattedComments = comments.map((comment) => ({
            id: comment.id,
            news_id: comment.news_id,
            content: comment.content,
            createdAt: comment.createdAt,
            userId: comment.userId,
            userName: comment.user?.name || "Anonymous",
            userImage: comment.user?.profilePicture || null,
        }));

        return NextResponse.json(formattedComments);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

// POST: 댓글 추가
// POST: 댓글 추가
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { newsId, content, userId } = body;

        if (!newsId || !content || !userId) {
            return NextResponse.json({ error: "newsId, content, and userId are required" }, { status: 400 });
        }

        // 댓글 생성
        const comment = await prisma.comment.create({
            data: {
                news_id: newsId,
                content,
                userId,
            },
        });

        // 생성된 댓글과 작성자 정보 가져오기
        const createdComment = await prisma.comment.findUnique({
            where: { id: comment.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true,
                    },
                },
            },
        });

        if (!createdComment) {
            return NextResponse.json({ error: "Failed to retrieve created comment" }, { status: 500 });
        }

        // 작성자 정보를 포함한 댓글 데이터 형식 변환
        const formattedComment = {
            id: createdComment.id,
            news_id: createdComment.news_id,
            content: createdComment.content,
            createdAt: createdComment.createdAt,
            userId: createdComment.userId,
            userName: createdComment.user?.name || "Anonymous",
            userImage: createdComment.user?.profilePicture || null,
        };

        return NextResponse.json(formattedComment, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }
}

// DELETE: 댓글 삭제
export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("id");

    if (!commentId) {
        return NextResponse.json({ error: "Comment ID is required" }, { status: 400 });
    }

    try {
        await prisma.comment.delete({
            where: { id: parseInt(commentId, 10) },
        });

        return NextResponse.json({ message: "Comment deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
    }
}