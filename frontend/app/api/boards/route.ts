import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 게시판 이름 매핑
const categoryMap = {
    free: "자유게시판",
    study: "공부인증",
    questions: "질문게시판",
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id"); // 게시글 ID 확인
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
        const categorySlug = (searchParams.get("category") || "free") as keyof typeof categoryMap;

        if (id) {
            // 특정 ID로 게시글 조회
            const post = await prisma.post.findUnique({
                where: { id: parseInt(id, 10) },
                include: {
                    board: true,
                    author: true,
                },
            });

            if (!post) {
                return NextResponse.json({ message: "Post not found" }, { status: 404 });
            }

            return NextResponse.json(post);
        }

        // 카테고리별 게시글 조회
        const boardName = categoryMap[categorySlug];

        if (!boardName) {
            return NextResponse.json({ message: "Invalid category" }, { status: 400 });
        }

        const posts = await prisma.post.findMany({
            where: {
                board: { name: boardName },
            },
            orderBy: {
                id: "desc",
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                board: true,
            },
        });

        const totalCount = await prisma.post.count({
            where: {
                board: { name: boardName },
            },
        });

        return NextResponse.json({
            data: posts,
            pagination: {
                currentPage: page,
                pageSize,
                totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { title, content, category, userId }: {
            title: string;
            content: string;
            category: keyof typeof categoryMap;
            userId: number
        } = await req.json();


        const boardName = categoryMap[category];

        if (!boardName) {
            return NextResponse.json({ message: "Invalid category" }, { status: 400 });
        }

        // 유효한 userId인지 확인
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
        }

        // 게시글 데이터 생성
        const post = await prisma.post.create({
            data: {
                title,
                content,
                board: {
                    connect: { name: boardName },
                },
                author: {
                    connect: { id: userId }, // userId를 통해 author 관계 설정
                },
            },
        });


        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("id");

    if (!postId) {
        return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    try {
        await prisma.post.delete({
            where: { id: parseInt(postId, 10) },
        });

        return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete Post" }, { status: 500 });
    }
}