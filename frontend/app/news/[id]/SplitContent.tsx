"use client";

import useAppStore from "@/store/zustandStore";
import ExpandableSection from "./ExpandableSection";
import React, { useRef, useState, useEffect } from "react";

function cleanParts(parts: string[]): string[] {
    return parts.map(part => part.trim()).filter(Boolean);
}

export default function SplitContent({ english, korean, tts }: { english: string; korean: string; tts: any[] }) {
    const { splitMode } = useAppStore();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentAudioPath, setCurrentAudioPath] = useState<string | null>(null);

    let englishParts = splitMode === "sentence"
        ? cleanParts(english.split("\n"))
        : cleanParts([english]);

    let koreanParts = splitMode === "sentence"
        ? cleanParts(korean.split("\n"))
        : cleanParts([korean]);

    // 문장별 오디오 경로: 이제 배열로 바로 전달됨
    const sentenceAudioPaths = tts && tts.length > 0 && Array.isArray(tts[0].sentences_audio_path)
        ? tts[0].sentences_audio_path
        : [];

    const minLength = Math.min(englishParts.length, sentenceAudioPaths.length);
    const isMatchingLength = englishParts.length === koreanParts.length;
    const combinedContent = [];

    if (isMatchingLength) {
        for (let i = 0; i < englishParts.length; i++) {
            combinedContent.push({ type: "english", content: englishParts[i], audio: sentenceAudioPaths[i] });
            if (koreanParts[i]) {
                combinedContent.push({ type: "korean", content: koreanParts[i] });
            }
        }
    } else {
        combinedContent.push(
            { type: "english", content: english, audio: sentenceAudioPaths[0] },
            { type: "korean", content: korean }
        );
    }

    const fullAudioPath = tts && tts.length > 0 ? tts[0].full_text_audio_path : undefined;

    // 오디오 재생 핸들러
    const playAudio = (audioPath: string | undefined) => {
        if (!audioPath) return;
        // 같은 오디오가 이미 재생 중이면 정지(토글)
        if (audioRef.current && currentAudioPath === audioPath && !audioRef.current.paused) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
            setCurrentAudioPath(null);
            return;
        }
        // 기존 오디오가 있으면 정지
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        const audio = new Audio(audioPath);
        audioRef.current = audio;
        setCurrentAudioPath(audioPath);
        audio.play();
        audio.onended = () => {
            if (audioRef.current === audio) {
                audioRef.current = null;
                setCurrentAudioPath(null);
            }
        };
    };

    useEffect(() => {
        return () => {
            // 언마운트 시 오디오 정지
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
            setCurrentAudioPath(null);
        };
    }, []);

    return (
        <div className="space-y-4 pl-10">
            {fullAudioPath && (
                <div className="flex items-center mb-2">
                    <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => playAudio(fullAudioPath)}
                        aria-label="전체 오디오 재생"
                    >
                        🔊 전체 듣기
                    </button>
                </div>
            )}
            {combinedContent.map((section, index) => (
                <div key={index} className="flex items-start">
                    {section.type === "english" ? (
                        <>
                            {splitMode === "sentence" && section.audio ? (
                                <div className="w-8 flex-shrink-0 flex justify-end pt-1">
                                    <button
                                        className="text-blue-500 hover:text-blue-700"
                                        onClick={() => playAudio(section.audio)}
                                        aria-label="문장 오디오 재생"
                                    >
                                        🔊
                                    </button>
                                </div>
                            ) : (
                                <div className="w-8 flex-shrink-0" />
                            )}
                            <p className="ml-2 flex-1">{section.content}</p>
                        </>
                    ) : (
                        <ExpandableSection content={section.content} />
                    )}
                </div>
            ))}
        </div>
    );
}