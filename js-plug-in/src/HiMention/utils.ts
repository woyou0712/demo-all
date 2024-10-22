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
  // 判断光标是否在当前P元素末尾
  let isEnd = false;
  // 获取当前P标签中的最后一个标签
  const lastChild = currentP.lastChild as HTMLElement;
  console.log(currentP.childNodes);
  // 如果是当前光标所在的标签(文本标签),则判断是否在末尾
  if (lastChild?.textContent && lastChild === range.endContainer && range.endOffset === lastChild.textContent.length) {
    isEnd = true;
  }
  // 如果是当前光标所在的标签(非文本标签),则判断是否在末尾
  if (!lastChild?.textContent && (currentP.childNodes.length === range.endOffset || currentP.childNodes.length - 1 === range.endOffset)) {
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
