import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const news_id = searchParams.get("news_id");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    if (news_id) {
      // 특정 뉴스 ID 가져오기
      const news = await prisma.news.findUnique({
        where: { news_id },
        include: {
          news_english: true,
          news_korean: true,
        },
      });

      if (!news) {
        return NextResponse.json({ message: "News not found" }, { status: 404 });
      }

      return NextResponse.json(news);
    } else {
      const newsList = await prisma.news.findMany({
        orderBy: {
          id: "desc", // 최신순 정렬
        },
        skip: (page - 1) * pageSize, // 페이지 시작점 계산
        take: pageSize, // 한 번에 가져올 데이터 개수
        include: {
          news_english: true, // 관련된 원본 뉴스 데이터를 포함
        },
      });

      // 전체 데이터 개수
      const totalCount = await prisma.news_english.count();

      return NextResponse.json({
        data: newsList,
        pagination: {
          currentPage: page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}