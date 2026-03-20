import { create } from 'zustand';

interface AppStateDB{
    scriptText: string;
    scriptLine: string[];
    setScriptText:(text:string) => void;

    videoUrl: string | null;
    setVideoUrl: (url: string | null) => void;
};


export const useStore = create<AppStateDB>()((set) => ({
    scriptText: "",
    scriptLine: [],

    videoUrl: null,
    setVideoUrl: (url) => set({ videoUrl: url}),

    setScriptText:(newText) => {
        // console.log("check point A (raw test)", newText);
        const slicedLines = newText.split(/(?<=[.?!)]\s+)(?=[A-Z]{2,}\b)/).filter((line) => line.trim() !== "");
        // console.log("Check point b (sliced array):", slicedLines );

        set({
            scriptText: newText,
            scriptLine: slicedLines,
        });
    },
}))