import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import logger from "@/lib/logger";
import { getCurrentKSTTime } from "./utils/utils";

export async function middleware(request: NextRequest) {
  // 요청 정보 가져오기
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0] || "Unknown IP";

  // 요청 URL과 메서드
  const requestUrl = request.nextUrl.pathname;
  const method = request.method;

  // 로깅
  if (!requestUrl.startsWith("/api")) {
    logger.info(`[${getCurrentKSTTime()}] [${method}] ${requestUrl} - Client IP: ${clientIp}`);
  }

  // 기존 세션 업데이트 로직 유지
  return await updateSession(request);
}

// matcher 설정 유지
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};