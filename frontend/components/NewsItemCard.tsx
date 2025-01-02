"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface NewsItemProps {
    id: number;
    newsId: string;
    title: string;
    content: string;
    thumbUrl: string;
    broadcastDate: string;
}

function SkeletonLoader() {
    return (
        <div className="w-32 h-32 bg-gray-200 animate-pulse rounded-md"></div>
    );
}

export default function NewsItemCard({
    id,
    newsId,
    title,
    content,
    thumbUrl,
    broadcastDate,
}: NewsItemProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <Link
            key={id}
            href={`/news/${newsId}`}
            className="flex gap-4 border-b pb-4"
        >
            <div className="w-32 h-32 rounded-md flex-shrink-0 overflow-hidden relative">
                {!isLoaded && <SkeletonLoader />}
                {thumbUrl && (
                    <Image
                        src={thumbUrl}
                        alt={title}
                        width={128}
                        height={128}
                        onLoad={() => setIsLoaded(true)}
                        className={`object-cover w-full h-full rounded-md transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
                    />
                )}
            </div>
            <div>
                <p className="text-xl font-semibold">{title}</p>
                <p className="text-sm text-gray-500 mt-2">{broadcastDate}</p>
                <p className="text-gray-700 mt-2 line-clamp-2">{content}</p>
            </div>
        </Link>
    );
}