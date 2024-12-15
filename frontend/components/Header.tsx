"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
    const { data: session, status } = useSession();
    return (
        <nav className="sticky top-0 w-full h-16 flex items-center justify-between px-5 border-b border-b-foreground/10 bg-background z-50">
            <Link href="/" className="text-lg font-semibold">
                Newslingo
            </Link>
            <div>
                {status === "loading" ? (
                    <span className="text-sm">Loading...</span>
                ) : session ? (
                    <div className="flex items-center gap-2">
                        <img
                            src={session.user?.image || "/default-avatar.png"}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm font-medium">{session.user?.name || "User"}</span>
                        <button
                            onClick={() => signOut()}
                            className="text-sm font-semibold hover:underline"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link href="/api/auth/signin" className="text-sm font-semibold hover:underline">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}