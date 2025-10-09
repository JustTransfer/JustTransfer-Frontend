/// <reference types="react-scripts" />

// File System Access API declarations
interface FilePickerAcceptType {
    description?: string;
    accept: Record<string, string[]>;
}

interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: FilePickerAcceptType[];
}

interface FileSystemWritableFileStream extends WritableStream {
    write(data: BufferSource | Blob | string): Promise<void>;
    close(): Promise<void>;
}

interface FileSystemFileHandle {
    createWritable(): Promise<FileSystemWritableFileStream>;
}

declare global {
    interface Window {
        showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
    }
}
