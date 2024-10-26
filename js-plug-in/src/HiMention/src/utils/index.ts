import { NEW_LINE, PLACEHOLDER_TEXT, ROW_TAG_CLASS, TEXT_TAG_CLASS } from "../const";
import { fixTextRange, getRangeAt, moveRangeAtRowEnd, moveRangeAtRowStart, rangeEls } from "./range";

export const createElement = <K extends keyof HTMLElementTagNameMap>(type: K, { className, style, content }: { className?: string; style?: { [key: string]: string }; content?: string | HTMLElement } = {}): HTMLElementTagNameMap[K] => {
  const element = document.createElement(type);
  if (className) element.className = className;
  if (style) {
    Object.keys(style).forEach((key) => (element.style[key as any] = style[key]));
  }
  if (content && typeof content === "string") element.innerHTML = content;
  else if (content && typeof content === "object") element.appendChild(content);
  return element;
};

/**
 * 判断一个标签是否为空标签
 */
export const isEmptyElement = (el: HTMLElement | Node): boolean => {
  let text = (el as HTMLElement).innerText;
  if (!text) text = el.textContent || "";
  const notContext = !text;
  const newLine = text === "\n";
  const isEmpty = text === PLACEHOLDER_TEXT;
  return Boolean(notContext || newLine || isEmpty);
};

/**
 * 创建一个文本标签
 */
export const createTextTag = (content: string = PLACEHOLDER_TEXT): HTMLElement => {
  return createElement("span", { className: TEXT_TAG_CLASS, content });
};

/**
 * 创建一个行标签
 */
export const createRowTag = (): HTMLElement => {
  return createElement("p", { className: ROW_TAG_CLASS, content: createTextTag(NEW_LINE) });
};

/**
 * 修正编辑器内容
 */
export const fixEditorContent = (editor: HTMLElement): boolean => {
  if (isEmptyElement(editor)) {
    editor.innerHTML = "";
    editor.appendChild(createElement("p", { className: ROW_TAG_CLASS, content: createTextTag(NEW_LINE) }));
    return true;
  }
  return false;
};

/**
 * 修正行内容
 */
export const fixRowContent = (rowEl: HTMLElement, rangeTextEl?: HTMLElement): void => {
  if (isEmptyElement(rowEl)) {
    rowEl.innerHTML = createTextTag(NEW_LINE).outerHTML;
    return;
  }
  if (rowEl.children[0]?.className !== TEXT_TAG_CLASS) {
    rowEl.insertBefore(createTextTag(), rowEl.firstChild);
  }
  if (rowEl.children[rowEl.children.length - 1]?.className !== TEXT_TAG_CLASS) {
    rowEl.appendChild(createTextTag(NEW_LINE));
  }
  // 将相邻的空节点合并
  for (let i = rowEl.childNodes.length - 1; i > 0; i--) {
    const prev = rowEl.childNodes[i - 1];
    const next = rowEl.childNodes[i];
    if (isEmptyElement(prev) && isEmptyElement(next)) {
      // 不改变光标标签
      if (rangeTextEl && next === rangeTextEl) {
        prev.remove();
      } else {
        next.remove();
      }
    }
  }
  // 删除br标签
  const brs = rowEl.querySelectorAll("br");
  brs.forEach((br) => br.remove());
};

export const createTextNode = (text = ""): Text => {
  return document.createTextNode(text);
};

/**
 * 创建一个空节点用来装载子元素
 * @returns
 */
export const createDocumentFragment = (): DocumentFragment => {
  const fr = document.createDocumentFragment();
  return fr;
};

/**
 * 插入文本
 * @param text 文本内容
 * @param range 光标位置
 * @returns
 */
export const insertText = (text: string, range: Range): boolean => {
  const commonEl = range.commonAncestorContainer as HTMLElement;
  if (!["BR", "#text"].includes(commonEl?.nodeName) && commonEl.className !== TEXT_TAG_CLASS) return false;
  if (commonEl.nodeName === "BR") {
    const els = rangeEls(range);
    if (!els) return false;
    fixTextRange(range, els.textEl);
    els.textEl.removeChild(range.commonAncestorContainer as HTMLElement);
    els.textEl.innerHTML = text;
    // 修正光标位置
    moveRangeAtRowEnd(range, els.rowEl);
    return true;
  }
  range.insertNode(createTextNode(text));
  return true;
};

/**
 * 在文本内容中插入元素
 * @param el 需要插入的元素
 * @param range 光标位置
 * @returns
 */
export const insertElement = (el: HTMLElement, range: Range): boolean => {
  const commonEl = range.commonAncestorContainer as HTMLElement;
  if (!["BR", "#text"].includes(commonEl?.nodeName) && commonEl.className !== TEXT_TAG_CLASS) return false;
  const els = rangeEls(range);
  if (!els) return false;
  fixTextRange(range, els.textEl);
  // 如果当前文本元素是个空元素
  if (!els.textEl.textContent) {
    const t = createTextNode(PLACEHOLDER_TEXT);
    els.textEl.appendChild(t);
    // 修正光标位置
    range.setStart(t, 0);
    range.collapse(true);
  }

  el.setAttribute("contenteditable", "false");

  // 如果当前光标在文本节点开头，则将元素插入到文本节点之前
  if (range.startOffset === 0) {
    // 获取当前textEL的前一个兄弟节点
    let prevEl = els.textEl.previousElementSibling;
    if (!prevEl || prevEl.className !== TEXT_TAG_CLASS) {
      els.textEl.insertAdjacentElement("beforebegin", createTextTag());
    }
    els.textEl.insertAdjacentElement("beforebegin", el);
    return true;
  } else if (range.endOffset === range.endContainer.textContent?.length) {
    // 获取当前textEL的下一个兄弟节点
    let nextEl = els.textEl.nextElementSibling;
    if (!nextEl || nextEl.className !== TEXT_TAG_CLASS) {
      nextEl = createTextTag();
      els.textEl.insertAdjacentElement("afterend", nextEl);
    }
    els.textEl.insertAdjacentElement("afterend", el);
    // 更新光标位置
    range.setStart(nextEl, 0);
    range.collapse(true);
    return true;
  }
  // 如果当前光标在文本节点中间，则将文本节点分割为两个，并将元素插入到中间
  const text1 = range.endContainer.textContent?.slice(0, range.endOffset) || PLACEHOLDER_TEXT;
  const text2 = range.endContainer.textContent?.slice(range.endOffset) || PLACEHOLDER_TEXT;
  range.endContainer.textContent = text1;

  const textEl2 = createTextTag(text2);
  els.textEl.insertAdjacentElement("afterend", textEl2);
  els.textEl.insertAdjacentElement("afterend", el);
  // 更新光标位置
  range.setStart(textEl2.childNodes[0], 0);
  range.collapse(true);
  return true;
};

/**
 * 将一个元素的内容转移到另外一个元素下面
 * @param el 需要移动的元素
 * @param target 目标元素
 */
export const transferElement = (el: Element | Node, target: HTMLElement | Node) => {
  const fr = createDocumentFragment();
  while (el.firstChild) {
    fr.appendChild(el.firstChild);
  }
  target.appendChild(fr);
};
