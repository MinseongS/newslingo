"use client";

import useAppStore from "@/store/zustandStore";
import ExpandableSection from "./ExpandableSection";

function cleanParts(parts: string[]): string[] {
    return parts.map(part => part.trim()).filter(Boolean);
}

export default function SplitContent({ english, korean }: { english: string; korean: string }) {
    const { splitMode } = useAppStore();

    let englishParts = splitMode === "sentence"
        ? cleanParts(english.split("\n"))
        : cleanParts(english.split("\n\n"));

    let koreanParts = splitMode === "sentence"
        ? cleanParts(korean.split("\n"))
        : cleanParts(korean.split("\n\n"));

    const isMatchingLength = englishParts.length === koreanParts.length;
    const combinedContent = [];

    if (isMatchingLength) {
        for (let i = 0; i < englishParts.length; i++) {
            combinedContent.push({ type: "english", content: englishParts[i] });
            if (koreanParts[i]) {
                combinedContent.push({ type: "korean", content: koreanParts[i] });
            }
        }
    } else {
        combinedContent.push(
            { type: "english", content: english },
            { type: "korean", content: korean }
        );
    }

    return (
        <div className="space-y-4">
            {combinedContent.map((section, index) => (
                <div key={index}>
                    {section.type === "english" ? (
                        <div>
                            <p>{section.content}</p>
                        </div>
                    ) : (
                        <ExpandableSection content={section.content} />
                    )}
                </div>
            ))}
        </div>
    );
}