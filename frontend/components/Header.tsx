"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
    const { data: session, status } = useSession();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <nav className="sticky top-0 w-full h-16 px-5 border-b border-b-foreground/10 bg-background z-50">
            {/* 전체 컨테이너 */}
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* 왼쪽(로고) */}
                <Link href="/" className="text-xl font-bold">
                    Newslingo
                </Link>

                {/* 햄버거 버튼 (작은 화면에서만 보임) */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden text-xl focus:outline-none"
                    aria-label="Toggle menu"
                >
                    ☰
                </button>

                {/* 중앙(메뉴 - 큰 화면에서만 보임) */}
                <div className="hidden lg:flex gap-8">
                    <Link href="/news" className="text-sm font-medium hover:underline">
                        영어뉴스
                    </Link>
                    <Link href="/board" className="text-sm font-medium hover:underline">
                        게시판
                    </Link>
                </div>

                {/* 오른쪽(사용자 정보 또는 로그인 - 큰 화면에서만 보임) */}
                <div className="hidden lg:flex items-center gap-4">
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

            {/* 사이드바 */}
            <div
                className={`fixed top-0 left-0 w-64 h-full bg-background border-r border-gray-200 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } transition-transform duration-300 z-50`}
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={toggleSidebar}
                    className="absolute top-4 right-4 text-xl focus:outline-none"
                >
                    ✕
                </button>

                {/* 메뉴 */}
                <div className="mt-16 px-4 flex flex-col gap-4">
                    <Link
                        href="/news"
                        onClick={toggleSidebar}
                        className="text-sm font-medium hover:underline"
                    >
                        영어뉴스
                    </Link>
                    <Link
                        href="/board"
                        onClick={toggleSidebar}
                        className="text-sm font-medium hover:underline"
                    >
                        게시판
                    </Link>
                </div>

                {/* 하단 사용자 정보 */}
                <div className="absolute bottom-4 left-4 w-full">
                    {status === "loading" ? (
                        <p className="text-sm font-medium text-gray-500">Loading...</p>
                    ) : session ? (
                        <div className="flex items-center gap-4">
                            <img
                                src={session.user?.image || "/default-avatar.png"}
                                alt="User Avatar"
                                className="w-12 h-12 rounded-full border"
                            />
                            <div className="flex flex-col">
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
                        </div>
                    ) : (
                        <Link
                            href="/api/auth/signin"
                            onClick={toggleSidebar}
                            className="text-sm font-semibold hover:underline"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* 사이드바 배경 (닫기용) */}
            {isSidebarOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black opacity-30 z-40"
                />
            )}
        </nav>
    );
}