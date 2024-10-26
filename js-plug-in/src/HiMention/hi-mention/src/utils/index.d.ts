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
export declare const fixRowContent: (rowEl: HTMLElement, rangeTextEl?: HTMLElement) => void;
export declare const createTextNode: (text?: string) => Text;
/**
 * 创建一个空节点用来装载子元素
 * @returns
 */
export declare const createDocumentFragment: () => DocumentFragment;
/**
 * 插入文本
 * @param text 文本内容
 * @param range 光标位置
 * @returns
 */
export declare const insertText: (text: string, range: Range) => boolean;
/**
 * 在文本内容中插入元素
 * @param el 需要插入的元素
 * @param range 光标位置
 * @returns
 */
export declare const insertElement: (el: HTMLElement, range: Range) => boolean;
/**
 * 将一个元素的内容转移到另外一个元素下面
 * @param el 需要移动的元素
 * @param target 目标元素
 */
export declare const transferElement: (el: Element | Node, target: HTMLElement | Node) => void;
