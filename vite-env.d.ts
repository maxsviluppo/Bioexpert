/// <reference types="vite/client" />

interface Window {
    aistudio?: {
        openSelectKey: () => void;
    };
}

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
