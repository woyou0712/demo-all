import { EDITOR_CLASS, P_TAG_CLASS } from "./const";

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
 * 获取当前光标所在的p标签
 */
export const getCurrentP = (range: Range): HTMLElement | null => {
  let currentP = range.commonAncestorContainer as HTMLElement;
  if (!currentP) return null;
  // 如果当前光标所在节点为根节点，则向下寻找p标签
  if (currentP.className?.includes(EDITOR_CLASS)) {
    currentP = currentP.childNodes[range.endOffset > 0 ? range.endOffset - 1 : 0] as HTMLElement;
    if (currentP?.className !== P_TAG_CLASS) return null;
    // 修正光标位置
    range.setStart(currentP, range.startOffset);
    range.setEnd(currentP, range.endOffset);
  }
  for (let i = 0; i < 10 && currentP.className !== P_TAG_CLASS; i++) {
    currentP = currentP.parentElement as HTMLElement;
  }
  if (currentP?.className !== P_TAG_CLASS) return null;
  // 如果子节点大于1的情况下，删除所有BR子节点
  if (currentP.childNodes.length > 1) {
    const brs = currentP.querySelectorAll("br");
    brs.forEach((br) => br.remove());
  }
  return currentP;
};

/**
 * 判断当前光标是否在p标签的末尾
 * @param currentP 当前光标所在的p标签
 */
export const isCursorAtEnd = (range: Range, currentP: HTMLElement): boolean => {
  // 如果当前光标坐在P表示是空的，则认为光标在末尾
  if (isEmptyElement(currentP)) return true;
  // 判断光标是否在当前P元素末尾
  let isEnd = false;
  // 获取当前P标签中的最后一个标签
  const lastChild = currentP.lastChild as HTMLElement;
  // 最后一个元素是有文本内容的文本节点，并且当前光标在文本节点末尾
  if (lastChild?.nodeName === "#text" && lastChild?.textContent && lastChild === range.endContainer && range.endOffset === lastChild.textContent?.length) {
    isEnd = true;
  } else if (lastChild?.nodeName === "#text" && !lastChild?.textContent && currentP.childNodes.length - 1 === range.endOffset) {
    // 最后一个标签为没有文本内容的文本节点，并且当前光标在最后一个标签之后
    isEnd = true;
  } else if (lastChild?.nodeName !== "#text" && currentP.childNodes.length === range.endOffset) {
    // 如果最后一个标签不是文本节点
    isEnd = true;
  } else if (currentP.childNodes.length <= 1 && currentP.childNodes[0]?.nodeName === "BR") {
    // 如果只有一个换行符则认为光标在末尾
    isEnd = true;
  } else if (currentP.childNodes.length && lastChild === range.endContainer && currentP.childNodes.length === range.endOffset) {
    isEnd = true;
  }
  return isEnd;
};

/**
 * 判断一个标签是否为空标签
 */
export const isEmptyElement = (element: HTMLElement): boolean => {
  return Boolean(!element.innerText || element.innerText === "\n");
};

export const getSelection = (): Selection | null => {
  return window.getSelection();
};

export const getRangeAt = (selection: Selection | null, index = 0): Range | null => {
  if (!selection) return null;
  const range = selection.getRangeAt(index);
  if (!range) return null;
  // 如果当前光标不在P标签中，则将光标移动到P标签中
  const currentP = getCurrentP(range);
  if (currentP) {
    return range;
  }
  return null;
};

export const createTextNode = (text = ""): Text => {
  return document.createTextNode(text);
};

// 创建一个空节点用来装载子元素
export const createEmptyNode = (el?: HTMLElement | DocumentFragment): DocumentFragment => {
  const fr = document.createDocumentFragment();
  if (el) {
    fr.appendChild(el);
  }
  return fr;
};
