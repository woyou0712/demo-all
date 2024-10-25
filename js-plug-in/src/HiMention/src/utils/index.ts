import { NEW_LINE, PLACEHOLDER_TEXT, ROW_TAG_CLASS, TEXT_TAG_CLASS } from "../const";
import { moveRangeAtRowEnd, moveRangeAtRowStart, rangeEls } from "./range";

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
export const isEmptyElement = (el: HTMLElement): boolean => {
  return Boolean(!el.textContent || el.textContent === "\n" || el.textContent === PLACEHOLDER_TEXT);
};

/**
 * 创建一个文本标签
 */
export const createTextTag = (content: string = PLACEHOLDER_TEXT): HTMLElement => {
  return createElement("span", { className: TEXT_TAG_CLASS, content });
}

/**
 * 创建一个行标签
 */
export const createRowTag = (): HTMLElement => {
  return createElement("p", { className: ROW_TAG_CLASS, content: createTextTag(NEW_LINE) });
}

/**
 * 修正编辑器内容
 */
export const fixEditorContent = (editor: HTMLElement): void => {
  if (!editor.innerText || editor.innerText === "\n") {
    editor.innerHTML = "";
    const textTag = createTextTag(NEW_LINE);
    editor.appendChild(createElement("p", { className: ROW_TAG_CLASS, content: textTag }));
  }
}

/**
 * 修正行内容
 */
export const fixRowContent = (rowEl: HTMLElement): void => {
  if (rowEl.childNodes.length > 1) {
    const brs = rowEl.querySelectorAll("br");
    brs.forEach((br) => br.remove());
  }
  if (isEmptyElement(rowEl)) {
    rowEl.innerHTML = createTextTag(NEW_LINE).outerHTML;
  } else if (rowEl.children[rowEl.children.length - 1].className !== TEXT_TAG_CLASS) {
    rowEl.appendChild(createTextTag());
  }
}

export const createTextNode = (text = ""): Text => {
  return document.createTextNode(text);
};

// 创建一个空节点用来装载子元素
export const createDocumentFragment = (el?: HTMLElement | DocumentFragment): DocumentFragment => {
  const fr = document.createDocumentFragment();
  if (el) {
    fr.appendChild(el);
  }
  return fr;
};

// 插入文本
export const insertText = (text: string, range: Range): boolean => {
  const commonEl = range.commonAncestorContainer as HTMLElement;
  if (!["BR", "#text"].includes(commonEl?.nodeName) && commonEl.className !== TEXT_TAG_CLASS) return false
  if (commonEl.nodeName === "BR") {
    const els = rangeEls(range);
    if (!els) return false;
    els.textEl.removeChild(range.commonAncestorContainer as HTMLElement);
    els.textEl.innerHTML = text
    // 修正光标位置
    moveRangeAtRowEnd(range, els.rowEl)
    return true
  }
  range.insertNode(createTextNode(text));
  return true;
}

// 在文本内容中插入元素
export const insertElement = (el: HTMLElement, range: Range): boolean => {
  const commonEl = range.commonAncestorContainer as HTMLElement;
  if (!["BR", "#text"].includes(commonEl?.nodeName) && commonEl.className !== TEXT_TAG_CLASS) return false
  const els = rangeEls(range);
  if (!els) return false;
  // 如果光标在BR标签上
  const brs = els.textEl.querySelectorAll("br");
  if (brs.length) {
    brs.forEach((br) => br.remove());
  }
  // 如果当前文本元素是个空元素
  if (!els.textEl.textContent) {
    const t = createTextNode(PLACEHOLDER_TEXT)
    els.textEl.appendChild(t);
    // 修正光标位置
    range.setStart(t, 0);
    range.setEnd(t, 0);
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
    return true
  } else if (range.endOffset === range.endContainer.textContent?.length) {
    // 获取当前textEL的下一个兄弟节点
    let nextEl = els.textEl.nextElementSibling;
    if (!nextEl || nextEl.className !== TEXT_TAG_CLASS) {
      nextEl = createTextTag()
      els.textEl.insertAdjacentElement("afterend", nextEl);
    }
    els.textEl.insertAdjacentElement("afterend", el);
    // 更新光标位置
    range.setStart(nextEl, 0);
    range.setEnd(nextEl, 0);
    return true
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
  range.setEnd(textEl2.childNodes[0], 0);
  return true;
}