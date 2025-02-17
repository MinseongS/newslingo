import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const whereCondition: any = {};
        whereCondition.news_english = {
            some: {
                content: { not: "" },
            }
        };
        // 모든 뉴스의 news_id만 가져오기
        const newsIds = await prisma.news.findMany({
            where: {
                news_english: {
                    some: {
                        content: { not: "" }, // 🔥 news_english 중 content가 빈 문자열이 아닌 데이터만 포함
                    },
                },
            },
            select: {
                news_id: true, // ✅ news_id 값만 가져오기
            },
            orderBy: {
                id: "desc", // ✅ 최신순 정렬
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