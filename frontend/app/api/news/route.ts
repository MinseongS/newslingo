import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const news_id = searchParams.get("news_id");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const category = searchParams.get("category") || "all";

    if (news_id) {
      // 특정 뉴스 ID 가져오기
      const news = await prisma.news.findUnique({
        where: { news_id },
        include: {
          news_english: true,
          news_korean: true,
          tts: true,
        },
      });

      if (!news) {
        return NextResponse.json({ message: "News not found" }, { status: 404 });
      }

      // AUDIO_PATH prefix 붙이기
      const audioPathPrefix = process.env.AUDIO_PATH || "";
      if (news.tts) {
        const ttsArray = Array.isArray(news.tts) ? news.tts : [news.tts];
        (news as any).tts = ttsArray.map((ttsItem: any) => ({
          ...ttsItem,
          full_text_audio_path: ttsItem.full_text_audio_path
            ? audioPathPrefix + "/" + ttsItem.full_text_audio_path
            : "",
          sentences_audio_path: Array.isArray(ttsItem.sentences_audio_path)
            ? ttsItem.sentences_audio_path.map((path: string) => audioPathPrefix + "/" + path)
            : []
        }));
      }

      return NextResponse.json(news);
    } else {
      // 기본 where 조건 객체
      const whereCondition: any = {};

      // 카테고리가 'all'이 아니고 값이 존재하면 그 때만 필터 적용
      // (예: "Finance", "Technology" 등)
      if (category && category.toLowerCase() !== "all") {
        whereCondition.category = category;
      }
      // 만약 category 파라미터가 'all'이거나 없는 경우 => 필터 미적용
      // 즉, 전체 뉴스 가져옴

      whereCondition.news_english = {
        some: {
          content: { not: "" },
        }
      };

      // 뉴스 목록 가져오기
      const newsList = await prisma.news.findMany({
        where: whereCondition,
        orderBy: {
          id: "desc", // 최신순 정렬
        },
        skip: (page - 1) * pageSize, // 페이지 시작점 계산
        take: pageSize, // 한 번에 가져올 데이터 개수
        include: {
          news_english: true, // 관련된 영어 뉴스 데이터를 포함
        },
      });

      // 전체 데이터 개수 (카테고리 필터가 적용된 상태로 세기)
      const totalCount = await prisma.news.count({
        where: whereCondition,
      });

      // 페이지네이션 정보
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