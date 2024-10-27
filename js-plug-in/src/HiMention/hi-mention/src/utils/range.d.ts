import { RangeElsType } from "../types";
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
export declare function moveRangeAtRowEnd(range: Range, rowEl: HTMLElement, merge?: boolean): void;
/**
 * 将光标位置移动到当前行的开头
 */
export declare function moveRangeAtRowStart(range: Range, rowEl: HTMLElement, merge?: boolean): void;
/**
 * 修正光标位置,并获取当前光标所在的编辑器/行/文本
 */
export declare function rangeEls(range: Range, which?: "end" | "start" | "common"): RangeElsType | null;
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
 * 修正文本标签内容
 */
export declare function fixTextContent(range: Range, els?: RangeElsType): void;
/**
 * 删除选中区域内的所有元素
 */
export declare function removeRangeContent(range: Range, { startEls, endEls, mergeRow }?: {
    startEls?: RangeElsType;
    endEls?: RangeElsType;
    mergeRow?: boolean;
}): string;
/**
 * 在光标位置插入文本
 * @param text 文本内容
 * @param range 光标位置
 * @returns
 */
export declare function insertText(text: string, range: Range): boolean;
/**
 * 在文本内容中插入元素
 * @param el 需要插入的元素
 * @param range 光标位置
 * @returns
 */
export declare function insertElement(el: HTMLElement, range: Range): boolean;
