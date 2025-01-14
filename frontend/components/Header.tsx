"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
    const { data: session, status } = useSession();

    return (
        <nav className="sticky top-0 w-full h-16  px-5 border-b border-b-foreground/10 bg-background z-50">
            {/* 전체 컨테이너 */}
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
                {/* 왼쪽(로고) */}
                <div className="flex-1">
                    <Link href="/" className="text-xl font-bold">
                        Newslingo
                    </Link>
                </div>

                {/* 중앙(메뉴) */}
                <div className="flex-1 flex justify-center items-center gap-8">
                    <Link href="/news" className="text-sm font-medium hover:underline">
                        영어뉴스
                    </Link>
                    {/* <Link href="/board" className="text-sm font-medium hover:underline">
                        게시판
                    </Link> */}
                </div>

                {/* 오른쪽(사용자 정보 또는 로그인) */}
                <div className="flex-1 flex justify-end items-center gap-4">
                    {status === "loading" ? (
                        <span className="text-sm font-medium text-gray-500">Loading...</span>
                    ) : session ? (
                        <div className="flex items-center gap-2">
                            <img
                                src={session.user?.image || "/default-avatar.png"}
                                alt="User Avatar"
                                className="w-8 h-8 rounded-full border"
                            />
                            <span className="text-sm font-medium">
                                {session.user?.name || "User"}
                            </span>
                            <button
                                onClick={() => signOut()}
                                className="text-sm font-semibold hover:underline"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/api/auth/signin"
                            className="text-sm font-semibold hover:underline"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}