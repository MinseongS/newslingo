import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

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
        // 🔹 세션 확인 (로그인 여부)
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized: 로그인 필요" }, { status: 401 });
        }

        // 🔹 FormData에서 데이터 가져오기 (이미지 포함)
        const formData = await req.formData();
        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        const category = formData.get("category") as keyof typeof categoryMap;
        const imageFile = formData.get("image") as File | null;
        const userId = parseInt(session.user.id, 10);
        const boardName = categoryMap[category];
        if (!boardName) {
            return NextResponse.json({ message: "Invalid category" }, { status: 400 });
        }

        // 🔹 이미지 저장
        const mountPath = process.env.MOUNT_PATH || "public/uploads";
        let imageUrl = null;
        if (imageFile) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // 🔹 UUID 생성 및 원본 확장자 유지
            const ext = imageFile.name.split(".").pop(); // 확장자 추출
            const uniqueFileName = `${randomUUID()}.${ext}`; // UUID + 원본 확장자

            const filePath = join(mountPath, uniqueFileName);
            await writeFile(filePath, buffer);

            imageUrl = `/api/images/${uniqueFileName}`; // 저장된 파일의 URL 반환
        }
        // 🔹 게시글 데이터 저장 (이미지 URL 포함)
        const postData: any = {
            title,
            content,
            board: {
                connect: { name: boardName },
            },
            author: {
                connect: { id: userId },
            },
        };

        if (imageUrl) {
            postData.imageUrl = imageUrl;
        }

        const post = await prisma.post.create({
            data: postData,
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

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized: 로그인 필요" }, { status: 401 });
    }

    try {
        const post = await prisma.post.findUnique({
            where: { id: parseInt(postId, 10) },
            select: { userId: true },
        });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        if (post.userId !== parseInt(session.user.id, 10)) {
            return NextResponse.json({ error: "Forbidden: 작성자만 삭제 가능" }, { status: 403 });
        }

        await prisma.post.delete({
            where: { id: parseInt(postId, 10) },
        });

        return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json({ error: "Failed to delete Post" }, { status: 500 });
    }
}