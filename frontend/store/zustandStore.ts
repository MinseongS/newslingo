import { create } from "zustand";

type SplitMode = "sentence" | "paragraph";

interface AppState {
    splitMode: SplitMode;
    setSplitMode: (mode: SplitMode) => void;
}

const useAppStore = create<AppState>((set) => ({
    splitMode: "sentence",
    setSplitMode: (mode) => set({ splitMode: mode }),
}));

export default useAppStore;