export declare function createElement<K extends keyof HTMLElementTagNameMap>(type: K, { className, style, content }?: {
    className?: string;
    style?: {
        [key: string]: string;
    };
    content?: string | HTMLElement | Text | Node | Element;
}): HTMLElementTagNameMap[K];
/**
 * 判断一个标签是否为空标签
 */
export declare function isEmptyElement(el: HTMLElement | Node): boolean;
/**
 * 创建一个文本标签
 */
export declare function createTextTag(content?: string | Text): HTMLElement;
/**
 * 创建一个行标签
 */
export declare function createRowTag(): HTMLElement;
/**
 * 修正编辑器内容
 */
export declare function fixEditorContent(editor: HTMLElement): boolean;
/**
 * 修正行内容
 */
export declare function fixRowContent(rowEl: HTMLElement, rangeTextEl?: HTMLElement): void;
export declare function createTextNode(text?: string): Text;
/**
 * 创建一个空节点用来装载子元素
 * @returns
 */
export declare function createDocumentFragment(): DocumentFragment;
/**
 * 将一个元素的内容转移到另外一个元素下面
 * @param el 需要移动的元素
 * @param target 目标元素
 */
export declare function transferElement(el: Element | Node, target: HTMLElement | Node): void;
/**
 * 判断文本内容是否需要修正
 */
export declare function isNeedFix(textEl: HTMLElement): boolean;
/**
 * 格式化字符串，删除字符串中的\n和连续的\r
 */
export declare function formatString(str?: string, isPlaceholder?: boolean): string;
