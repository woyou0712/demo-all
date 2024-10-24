export declare const createElement: <K extends keyof HTMLElementTagNameMap>(type: K, { className, style, content }?: {
    className?: string;
    style?: {
        [key: string]: string;
    };
    content?: string | HTMLElement;
}) => HTMLElementTagNameMap[K];
/**
 * 获取当前光标所在的p标签
 */
export declare const getCurrentP: (range: Range, type?: "start" | "end" | "common") => HTMLElement | null;
/**
 * 判断一个标签是否为空标签
 */
export declare const isEmptyElement: (element: HTMLElement) => boolean;
export declare const getSelection: () => Selection | null;
export declare const getRangeAt: (selection: Selection | null, index?: number) => Range | null;
export declare const createTextNode: (text?: string) => Text;
export declare const createDocumentFragment: (el?: HTMLElement | DocumentFragment) => DocumentFragment;
/**
 * 将光标移动到P标签的开头
 */
export declare const moveCursorToStart: (range: Range, currentP: HTMLElement | Element | Node) => void;
/**
 * 将光标移动到P标签的末尾
 */
export declare const moveCursorToEnd: (range: Range, currentP: HTMLElement | Element | Node) => void;
/**
 * 判断当前光标是否在p标签的末尾
 */
export declare const isCursorAtEnd: (range: Range, currentP: HTMLElement) => boolean;
/**
 * 判断当前光标是否在p标签的开头
 */
export declare const isCursorAtStart: (range: Range, currentP: HTMLElement) => boolean;
