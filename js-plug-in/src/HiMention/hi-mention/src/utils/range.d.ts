export declare function getSelection(): Selection | null;
/**
 * 获取光标位置
 * @param index
 * @returns
 */
export declare function getRangeAt(index?: number, selection?: Selection | null): Range | null;
/**
 * 将光标移动到编辑器末尾
 */
export declare function moveRangeAtEditorEnd(range: Range, editorEl: HTMLElement): void;
/**
 * 将光标位置移动到当前行的末尾
 */
export declare function moveRangeAtRowEnd(range: Range, rowEl: HTMLElement): void;
/**
 * 将光标位置移动到当前行的开头
 */
export declare function moveRangeAtRowStart(range: Range, rowEl: HTMLElement): void;
/**
 * 修正光标位置,并获取当前光标所在的编辑器/行/文本
 */
export declare function rangeEls(range: Range, which?: "end" | "start" | "common"): {
    editorEl: HTMLElement;
    rowEl: HTMLElement;
    textEl: HTMLElement;
} | null;
/**
 * 判断光标是否在当前行的末尾
 */
export declare function isRangeAtRowEnd(range: Range, rowEl: HTMLElement): boolean;
/**
 * 判断光标是否在当前文本元素末尾
 */
export declare function isRangeAtTextEnd(range: Range): boolean;
/**
 * 判断光标是否在当前行的开头
 */
export declare function isRangeAtRowStart(range: Range, rowEl: HTMLElement): boolean;
/**
 * 判断光标是否在当前文本元素开头
 */
export declare function isRangeAtTextStart(range: Range): boolean;
/**
 * 修正文本标签光标
 */
export declare function fixTextRange(range: Range, textEl: HTMLElement): void;
