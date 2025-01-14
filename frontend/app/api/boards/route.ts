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
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
        const categorySlug = (searchParams.get("category") || "free") as keyof typeof categoryMap;

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
            userId?: number
        } = await req.json();

        const boardName = categoryMap[category];

        if (!boardName) {
            return NextResponse.json({ message: "Invalid category" }, { status: 400 });
        }

        const postData: any = {
            title,
            content,
            board: {
                connect: { name: boardName },
            },
        };

        if (userId) {
            postData.userId = userId;
        }
        console.log("Creating post with data:", postData);
        const post = await prisma.post.create({
            data: postData,
        });

        console.log("Created post:", post);

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}