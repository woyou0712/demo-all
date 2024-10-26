import { NEW_LINE, PLACEHOLDER_TEXT, ROW_TAG_CLASS, TEXT_TAG_CLASS } from "../const";

export function createElement<K extends keyof HTMLElementTagNameMap>(type: K, { className, style, content }: { className?: string; style?: { [key: string]: string }; content?: string | HTMLElement } = {}): HTMLElementTagNameMap[K] {
  const element = document.createElement(type);
  if (className) element.className = className;
  if (style) {
    Object.keys(style).forEach((key) => (element.style[key as any] = style[key]));
  }
  if (content && typeof content === "string") element.innerHTML = content;
  else if (content && typeof content === "object") element.appendChild(content);
  return element;
}

/**
 * 判断一个标签是否为空标签
 */
export function isEmptyElement(el: HTMLElement | Node): boolean {
  let text = (el as HTMLElement).innerText;
  if (!text) text = el.textContent || "";
  const notContext = !text;
  const newLine = text === "\n";
  const isEmpty = new RegExp(`^${PLACEHOLDER_TEXT}+$`).test(text);
  return Boolean(notContext || newLine || isEmpty);
}

/**
 * 创建一个文本标签
 */
export function createTextTag(content: string = PLACEHOLDER_TEXT): HTMLElement {
  return createElement("span", { className: TEXT_TAG_CLASS, content });
}

/**
 * 创建一个行标签
 */
export function createRowTag(): HTMLElement {
  return createElement("p", { className: ROW_TAG_CLASS, content: createTextTag(NEW_LINE) });
}

/**
 * 修正编辑器内容
 */
export function fixEditorContent(editor: HTMLElement): boolean {
  if (isEmptyElement(editor)) {
    editor.innerHTML = "";
    editor.appendChild(createElement("p", { className: ROW_TAG_CLASS, content: createTextTag(NEW_LINE) }));
    return true;
  }
  return false;
}

/**
 * 修正行内容
 */
export function fixRowContent(rowEl: HTMLElement, rangeTextEl?: HTMLElement): void {
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
}

export function createTextNode(text = ""): Text {
  return document.createTextNode(text);
}

/**
 * 创建一个空节点用来装载子元素
 * @returns
 */
export function createDocumentFragment(): DocumentFragment {
  const fr = document.createDocumentFragment();
  return fr;
}

/**
 * 将一个元素的内容转移到另外一个元素下面
 * @param el 需要移动的元素
 * @param target 目标元素
 */
export function transferElement(el: Element | Node, target: HTMLElement | Node) {
  // 先合并紧挨着的相同的元素（text元素和text文本）
  let children: Node[] = [];
  for (let i = el.childNodes.length - 1; i >= 0; i--) {
    const child = el.childNodes[i] as HTMLElement;
    if (child.nodeName === "#text" || child.className === TEXT_TAG_CLASS) {
      let content = child.textContent || "";
      const prevChild = el.childNodes[i - 1] as HTMLElement;
      if (prevChild && (prevChild.nodeName === "#text" || prevChild.className === TEXT_TAG_CLASS)) {
        content = (child.textContent || "") + (prevChild.textContent || "");
        el.removeChild(prevChild);
        i--;
      }
      content = formatString(content, true);
      child.textContent = content;
    }

    children.unshift(child);
  }
  const fr = createDocumentFragment();
  const targetIsRow = (target as HTMLElement).className === ROW_TAG_CLASS;
  children.forEach((node) => {
    let el = targetIsRow && node.nodeName === "#text" ? createTextTag(node.textContent || PLACEHOLDER_TEXT) : node;
    fr.appendChild(el);
  });
  target.appendChild(fr);
}

/**
 * 判断文本内容是否需要修正
 */
export function isNeedFix(textEl: HTMLElement): boolean {
  const text = textEl.textContent || "";
  if (!text) return false;
  let textNodeNum = 0;
  for (let i = 0; i < textEl.childNodes.length; i++) {
    if (textEl.childNodes[i].textContent) textNodeNum++;
    if (textNodeNum > 1) return true;
  }
  const br = textEl.querySelector("br");
  return Boolean(br || new RegExp(`\n|${PLACEHOLDER_TEXT}|\r`).test(text));
}

/**
 * 格式化字符串，删除字符串中的\n和连续的\r
 */
export function formatString(str?: string, isPlaceholder = false) {
  if (!str) return isPlaceholder ? PLACEHOLDER_TEXT : "";
  const result = str.replace(/\r+/g, "\r").replace(/\n+/g, "").replace(new RegExp(PLACEHOLDER_TEXT, "g"), "");
  return result ? result : isPlaceholder ? PLACEHOLDER_TEXT : "";
}
