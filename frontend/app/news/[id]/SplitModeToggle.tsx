"use client";

import useAppStore from "@/store/zustandStore";

export default function SplitModeToggle() {
    const { splitMode, setSplitMode } = useAppStore();

    const isSentenceMode = splitMode === "sentence";

    return (
        <div className="mb-4 flex items-center gap-4">
            <span className="text-sm font-medium">
                Sentences Mode
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={isSentenceMode}
                    onChange={() => setSplitMode(isSentenceMode ? "paragraph" : "sentence")}
                    className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 
                    peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] 
                    after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border 
                    after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 
                    peer-checked:bg-blue-600"></div>
            </label>
        </div>
    );
}