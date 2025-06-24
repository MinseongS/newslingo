import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: 댓글 조회
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const Id = searchParams.get("id");
    if (!Id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
        const board_comments = await prisma.board_comment.findMany({
            where: { postId: Number(Id) },
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
        const formattedComments = board_comments.map((board_comment) => ({
            id: board_comment.id,
            postid: board_comment.postId,
            content: board_comment.content,
            createdAt: board_comment.createdAt,
            userId: board_comment.userId,
            userName: board_comment.user?.name || "Anonymous",
            userImage: board_comment.user?.profilePicture || null,
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
        const { id, content, userId } = body;
        if (!id || !content || !userId) {
            return NextResponse.json({ error: "Id, content, and userId are required" }, { status: 400 });
        }
        // 댓글 생성
        const board_comment = await prisma.board_comment.create({
            data: {
                postId: Number(id),
                content,
                userId,
                updatedAt: new Date(),
            },
        });
        // 생성된 댓글과 작성자 정보 가져오기
        const createdComment = await prisma.board_comment.findUnique({
            where: { id: board_comment.id },
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
            post_id: createdComment.postId,
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
        await prisma.board_comment.delete({
            where: { id: parseInt(commentId, 10) },
        });

        return NextResponse.json({ message: "Comment deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
    }
}