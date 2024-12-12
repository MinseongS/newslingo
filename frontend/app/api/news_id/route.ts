import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        // 모든 뉴스의 news_id만 가져오기
        const newsIds = await prisma.news.findMany({
            select: {
                news_id: true,
            },
            orderBy: {
                id: "desc",
            },
        });

        // news_id 값만 추출한 배열 생성
        const ids = newsIds.map((item) => item.news_id);

        return NextResponse.json(ids, { status: 200 });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}