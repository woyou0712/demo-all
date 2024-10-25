export declare const createElement: <K extends keyof HTMLElementTagNameMap>(type: K, { className, style, content }?: {
    className?: string;
    style?: {
        [key: string]: string;
    };
    content?: string | HTMLElement;
}) => HTMLElementTagNameMap[K];
/**
 * 判断一个标签是否为空标签
 */
export declare const isEmptyElement: (el: HTMLElement | Node) => boolean;
/**
 * 创建一个文本标签
 */
export declare const createTextTag: (content?: string) => HTMLElement;
/**
 * 创建一个行标签
 */
export declare const createRowTag: () => HTMLElement;
/**
 * 修正编辑器内容
 */
export declare const fixEditorContent: (editor: HTMLElement) => boolean;
/**
 * 修正行内容
 */
export declare const fixRowContent: (rowEl: HTMLElement) => void;
/**
 * 修正文本内容
 */
export declare const fixTextContent: (textEl: HTMLElement) => void;
export declare const createTextNode: (text?: string) => Text;
export declare const createDocumentFragment: (el?: HTMLElement | DocumentFragment) => DocumentFragment;
export declare const insertText: (text: string, range: Range) => boolean;
export declare const insertElement: (el: HTMLElement, range: Range) => boolean;
