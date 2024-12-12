"use client";

import { useState } from "react";
import { AiOutlineDown, AiOutlineRight } from "react-icons/ai";

export default function ExpandableSection({ content }: { content: string }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="bg-gray-100 p-4 rounded-md">
            <button
                onClick={() => setVisible(!visible)}
                className="flex items-center gap-2 text-gray-600"
            >
                {visible ? (
                    <AiOutlineDown className="text-lg" />
                ) : (
                    <AiOutlineRight className="text-lg" />
                )}
            </button>
            {visible && (
                <div className="mt-2 text-gray-700">
                    <p>{content}</p>
                </div>
            )}
        </div>
    );
}