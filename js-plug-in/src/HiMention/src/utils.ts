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
export const getCurrentP = (range: Range, type: "start" | "end" | "common" = "common"): HTMLElement | null => {
  let currentP
  if (type === "start") {
    currentP = range.startContainer as HTMLElement;
  } else if (type === "end") {
    currentP = range.endContainer as HTMLElement;
  } else {
    currentP = range.commonAncestorContainer as HTMLElement;
  }
  if (!currentP) return null;
  // 如果当前光标所在节点为根节点，则向下寻找p标签
  if (currentP.className?.includes(EDITOR_CLASS)) {
    currentP = currentP.childNodes[range.endOffset > 0 ? range.endOffset - 1 : 0] as HTMLElement;
    if (currentP?.className !== P_TAG_CLASS) return null;
    // 修正光标位置
    let index = range.endOffset > currentP.childNodes.length ? currentP.childNodes.length : range.endOffset;
    if (type === "start") {
      index = range.startOffset > currentP.childNodes.length ? currentP.childNodes.length : range.startOffset;
      range.setStart(currentP, index);
    } else if (type === "end") {
      range.setEnd(currentP, index);
    } else {
      range.setStart(currentP, index);
      range.setEnd(currentP, index);
    }
  }
  for (let i = 0; i < 10 && currentP.className !== P_TAG_CLASS; i++) {
    currentP = currentP.parentElement as HTMLElement;
  }
  if (currentP?.className !== P_TAG_CLASS) return null;

  if (type === "common") {
    // 如果子节点大于1的情况下，删除所有BR子节点
    if (currentP.childNodes.length > 1) {
      const brs = currentP.querySelectorAll("br");
      brs.forEach((br) => br.remove());
    }
    if (isEmptyElement(currentP)) {
      currentP.innerHTML = "<br/>";
    }
  }
  return currentP;
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
export const createDocumentFragment = (el?: HTMLElement | DocumentFragment): DocumentFragment => {
  const fr = document.createDocumentFragment();
  if (el) {
    fr.appendChild(el);
  }
  return fr;
};


/**
 * 将光标移动到P标签的开头
 */
export const moveCursorToStart = (range: Range, currentP: HTMLElement | Element | Node): void => {
  const firstChild = currentP.firstChild;
  if (firstChild?.nodeName === "#text") {
    range.setStart(firstChild, 0);
    range.setEnd(firstChild, 0);
  } else {
    range.setStart(currentP, 0);
    range.setEnd(currentP, 0);
  }
}
/**
 * 将光标移动到P标签的末尾
 */
export const moveCursorToEnd = (range: Range, currentP: HTMLElement | Element | Node): void => {
  const lastChild = currentP.lastChild;
  if (lastChild?.nodeName === "#text") {
    range.setStart(lastChild, lastChild.textContent?.length || 0);
    range.setEnd(lastChild, lastChild.textContent?.length || 0);
  } else {
    range.setStart(currentP, currentP.childNodes.length);
    range.setEnd(currentP, currentP.childNodes.length);
  }
}

/**
 * 判断当前光标是否在p标签的末尾
 */
export const isCursorAtEnd = (range: Range, currentP: HTMLElement): boolean => {
  // 如果当前光标坐在P表示是空的，则认为光标在末尾
  if (isEmptyElement(currentP)) return true;
  // 获取当前P标签中的最后一个标签
  const lastChild = currentP.lastChild;
  if (!lastChild) return true;
  const endContainer = range.endContainer; // 获取光标所在标签
  if (endContainer === currentP) {
    // 如果光标直接在P标签上
    if (range.endOffset === currentP.childNodes.length) return true
    if (lastChild.nodeName === "#text" && !lastChild.textContent && range.endOffset === currentP.childNodes.length - 1) return true
  } else if (endContainer === lastChild) {
    // 如果光标在最后一个标签上
    if (lastChild.nodeName === "#text" && range.endOffset === Number(lastChild.textContent?.length)) return true
    if (lastChild.nodeName !== "#text" && range.endOffset === currentP.childNodes.length) return true
  }
  return false;
};

/**
 * 判断当前光标是否在p标签的开头
 */
export const isCursorAtStart = (range: Range, currentP: HTMLElement): boolean => {
  // 如果当前光标坐在P表示是空的，在开头
  if (isEmptyElement(currentP)) return true;
  // 获取当前P标签中的第一个标签
  const firstChild = currentP.firstChild;
  if (!firstChild) return true;
  const startContainer = range.startContainer; // 获取光标所在标签
  // 如果光标直接在P标签上
  if (startContainer === currentP && range.startOffset === 0) return true
  // 如果光标在第一个标签上
  if (startContainer === firstChild && range.startOffset === 0) return true
  return false
}
