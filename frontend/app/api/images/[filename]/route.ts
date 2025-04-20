import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";
import fs from "fs";

export async function GET(req: NextRequest) {
    try {
        // 🔹 URL에서 파일명 추출
        const urlParts = req.nextUrl.pathname.split("/");
        const filename = urlParts[urlParts.length - 1];

        const mountPath = process.env.MOUNT_PATH || "/mnt/uploads"; // 원하는 디렉토리 마운트
        const filePath = join(mountPath, filename);

        // 파일 존재 여부 확인
        if (!fs.existsSync(filePath)) {
            return new NextResponse("File not found", { status: 404 });
        }

        const file = await readFile(filePath);
        return new NextResponse(file, {
            headers: {
                "Content-Type": "image/jpeg", // 🔹 파일 확장자에 맞게 변경 가능
            },
        });
    } catch (error) {
        console.error("Error serving image:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}