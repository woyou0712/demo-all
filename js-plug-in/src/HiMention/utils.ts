import { P_TAG_CLASS } from "./const";

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
 * 判断当前光标是否在p标签的末尾
 * @param currentP 当前光标所在的p标签
 */
export const isCursorAtEnd = (range: Range, currentP: HTMLElement): boolean => {
  // 格式化P标签，不许存在子元素的情况下出现BR标签
  if (currentP.className === P_TAG_CLASS && currentP.childNodes.length > 1) {
    // 删除所有的BR标签
    const brs = currentP.querySelectorAll("br");
    brs.forEach((br) => currentP.removeChild(br));
  }

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
    isEnd = true
  } else if (currentP.childNodes.length && currentP.childNodes.length === range.endOffset) {
    isEnd = true
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
}

export const createTextNode = (text = ""): Text => {
  return document.createTextNode(text);
}

// 创建一个空节点用来装载子元素
export const createEmptyNode = (): DocumentFragment => {
  return document.createDocumentFragment();
}