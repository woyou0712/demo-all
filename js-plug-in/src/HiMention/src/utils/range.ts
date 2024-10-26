import { createElement, createTextNode, createTextTag, isEmptyElement } from ".";
import { EDITOR_CLASS, NEW_LINE, PLACEHOLDER_TEXT, ROW_TAG_CLASS, TEXT_TAG_CLASS } from "../const";

export function getSelection() {
  if (window.getSelection) {
    return window.getSelection();
  }
  return null;
}

/**
 * 获取光标位置
 * @param index
 * @returns
 */
export function getRangeAt(index: number = 0, selection = getSelection()) {
  try {
    let range = selection?.getRangeAt(index);
    if (!range) {
      range = document.createRange();
      range.selectNodeContents(document.body);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    // 如果光标没有选中内容，修正光标位置
    if (range.collapsed) {
      rangeEls(range);
    }
    return range;
  } catch (error) {
    console.error("编辑器未获取焦点");
    return null;
  }
}

/**
 * 将光标移动到编辑器末尾
 */
export function moveRangeAtEditorEnd(range: Range, editorEl: HTMLElement) {
  // 获取最后一行
  let lastLine = editorEl.children[editorEl.children.length - 1] as HTMLElement;
  // 如果不是行元素
  if (!lastLine || lastLine.className !== ROW_TAG_CLASS) {
    // 修正标签
    lastLine = createElement("p", { className: ROW_TAG_CLASS, content: createElement("span", { className: TEXT_TAG_CLASS, content: NEW_LINE }) });
    // 添加到编辑器末尾
    editorEl.appendChild(lastLine);
  }
  moveRangeAtRowEnd(range, lastLine);
}

/**
 * 将光标位置移动到当前行的末尾
 */
export function moveRangeAtRowEnd(range: Range, rowEl: HTMLElement) {
  // 获取最后一个文本标签
  let lastText = rowEl.children[rowEl.children.length - 1];
  if (!lastText || lastText.className !== TEXT_TAG_CLASS) {
    // 修正标签
    lastText = createElement("span", { className: TEXT_TAG_CLASS, content: rowEl.children.length > 0 ? PLACEHOLDER_TEXT : NEW_LINE });
    // 添加到行末尾
    rowEl.appendChild(lastText);
  }
  // 获取最后一个文本标签的长度
  const textNode = lastText.lastChild;
  let lastTextLength = (textNode ? textNode.textContent?.length : lastText.textContent?.length) || 0;
  // 设置光标位置
  range.setStart(textNode ? textNode : lastText, lastTextLength);
  range.collapse(true);
}

/**
 * 将光标位置移动到当前行的开头
 */
export function moveRangeAtRowStart(range: Range, rowEl: HTMLElement) {
  // 获取第一个文本标签
  let firstText = rowEl.children[0];
  if (!firstText || firstText.className !== TEXT_TAG_CLASS) {
    // 修正标签
    firstText = createTextTag(rowEl.children.length > 0 ? PLACEHOLDER_TEXT : NEW_LINE);
    // 添加到行开头
    rowEl.prepend(firstText);
  }
  // 设置光标位置
  const textNode = firstText.firstChild;
  range.setStart(textNode ? textNode : firstText, 0);
  range.collapse(true);
}

/**
 * 修正光标位置,并获取当前光标所在的编辑器/行/文本
 */
export function rangeEls(range: Range, which: "end" | "start" | "common" = "common"): { editorEl: HTMLElement; rowEl: HTMLElement; textEl: HTMLElement } | null {
  // 光标所在的编辑器
  let editorEl: HTMLElement | null = null;
  // 光标所在的行
  let rowEl: HTMLElement | null = null;
  // 光标所在的文本
  let textEl: HTMLElement | null = null;
  let el: HTMLElement;
  if (which === "end") {
    el = range.endContainer as HTMLElement;
  } else if (which === "start") {
    el = range.startContainer as HTMLElement;
  } else {
    el = range.commonAncestorContainer as HTMLElement;
  }
  if (!el) return null;
  // 向上找节点，最多找10层
  for (let i = 0; i < 10 && !editorEl; i++) {
    if (el.className === TEXT_TAG_CLASS) {
      textEl = el;
    } else if (el.className === ROW_TAG_CLASS) {
      rowEl = el;
    } else if (el.className === EDITOR_CLASS) {
      editorEl = el;
      break;
    }
    el = el.parentElement as HTMLElement;
  }
  if (!editorEl) return null;
  if (textEl && rowEl) return { editorEl, rowEl, textEl };

  if (which !== "common") return null;

  // 查找当前光标，如果光标不在文本标签中，修正光标位置
  if (!rowEl) {
    const index = range.startOffset > editorEl.childNodes.length - 1 ? editorEl.childNodes.length - 1 : range.startOffset;
    rowEl = editorEl.childNodes[index] as HTMLElement;
    if (!rowEl || rowEl.className !== ROW_TAG_CLASS) {
      textEl = createTextTag(NEW_LINE);
      rowEl = createElement("p", { className: ROW_TAG_CLASS, content: textEl });
      editorEl.appendChild(rowEl);
    }
  }
  textEl = rowEl.children[rowEl.children.length - 1] as HTMLElement;
  if (!textEl || textEl.className !== TEXT_TAG_CLASS) {
    textEl = createTextTag(rowEl.children.length > 0 ? PLACEHOLDER_TEXT : NEW_LINE);
    rowEl.appendChild(textEl);
  }
  // 如果光标位置不在TEXT节点上，修正光标位置
  if (range.commonAncestorContainer.nodeName !== "#text") {
    const tNode = textEl.firstChild;
    // 设置光标位置
    range.setStart(tNode ? tNode : textEl, 0);
    range.collapse(true);
  }

  return { editorEl, rowEl, textEl };
}

/**
 * 判断光标是否在当前行的末尾
 */
export function isRangeAtRowEnd(range: Range, rowEl: HTMLElement) {
  const els = rangeEls(range);
  if (!els) return false;
  if (els.rowEl !== rowEl) return false;
  if (els.textEl !== rowEl.children[rowEl.children.length - 1]) return false;
  if (range.endContainer === rowEl && range.endOffset === rowEl.childNodes.length) return true;
  return isRangeAtTextEnd(range);
}

/**
 * 判断光标是否在当前文本元素末尾
 */
export function isRangeAtTextEnd(range: Range) {
  const textEl = range.endContainer as HTMLElement;
  if (textEl.textContent?.[textEl.textContent?.length - 1] === PLACEHOLDER_TEXT && range.endOffset === textEl.textContent?.length - 1) return true;
  return range.endOffset === textEl.textContent?.length;
}

/**
 * 判断光标是否在当前行的开头
 */
export function isRangeAtRowStart(range: Range, rowEl: HTMLElement) {
  // 如果不是0宽占位符就必须是0
  if (range.commonAncestorContainer.textContent !== PLACEHOLDER_TEXT && range.startOffset !== 0) return false;
  const els = rangeEls(range);
  if (!els) return false;
  if (els.rowEl !== rowEl) return false;
  if (els.textEl !== rowEl.children[0]) return false;
  if (range.startContainer === rowEl && range.startOffset === 0) return true;
  return isRangeAtTextStart(range);
}

/**
 * 判断光标是否在当前文本元素开头
 */
export function isRangeAtTextStart(range: Range) {
  const textEl = range.startContainer as HTMLElement;
  if (textEl.textContent?.[0] === PLACEHOLDER_TEXT && range.startOffset === 1) return true;
  return range.startOffset === 0;
}

/**
 * 修正文本标签光标
 */
export function fixTextRange(range: Range, textEl: HTMLElement): void {
  if (range.startContainer.nodeName === "BR") {
    const text = createTextNode();
    textEl.appendChild(text);
    range.setStart(text, 0);
    range.collapse(true);
    return;
  }
  if (textEl.childNodes.length <= 1) return;
  if (range.startContainer.nodeName !== "#text" && range.startContainer !== textEl) return;
  let rangeEl = range.startContainer as HTMLElement;
  let rangeIndex = range.startOffset;
  if (rangeEl === textEl) {
    rangeEl = textEl.childNodes[range.startOffset - 1] as HTMLElement;
    rangeIndex = rangeEl.textContent?.length || 0;
  }

  for (let i = 0; i < textEl.childNodes.length; i++) {
    if (rangeEl === textEl.childNodes[i]) {
      break;
    } else {
      rangeIndex += textEl.childNodes[i].textContent?.length || 0;
    }
  }

  let text = textEl.textContent || "";
  // 清除所有的占位符和换行符
  for (let i = 0; i < text.length; i++) {
    if (i > rangeIndex) break;
    const t = text[i];
    if (t === PLACEHOLDER_TEXT || t === "\n") {
      rangeIndex -= 1;
    }
  }
  rangeIndex = Math.max(rangeIndex, 0);
  text = text.replace(new RegExp(PLACEHOLDER_TEXT, "g"), "");
  text = text.replace(/\n/g, "");
  if (!text) {
    text = PLACEHOLDER_TEXT;
    rangeIndex = 1;
  }
  textEl.innerHTML = "";
  const textNode = createTextNode(text);
  textEl.appendChild(textNode);
  range.setStart(textNode, rangeIndex <= text.length ? rangeIndex : text.length);
  range.collapse(true);
}
