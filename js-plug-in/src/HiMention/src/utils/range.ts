import { RangeElsType } from "../types";
import { createElement, createTextNode, createTextTag, formatString, isNeedFix, transferElement } from ".";
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
export function moveRangeAtRowEnd(range: Range, rowEl: HTMLElement, merge: boolean = true) {
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
  let lastTextLength = (textNode ? textNode.textContent?.length : lastText.childNodes.length) || 0;
  // 设置光标位置
  range.setEnd(textNode ? textNode : lastText, lastTextLength);
  if (merge) range.collapse();
}

/**
 * 将光标位置移动到当前行的开头
 */
export function moveRangeAtRowStart(range: Range, rowEl: HTMLElement, merge: boolean = true) {
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
  if (merge) range.collapse(true);
}

/**
 * 修正光标位置,并获取当前光标所在的编辑器/行/文本
 */
export function rangeEls(range: Range, which: "end" | "start" | "common" = "common"): RangeElsType | null {
  // 光标所在的编辑器
  let editorEl: HTMLElement | null = null;
  // 光标所在的行
  let rowEl: HTMLElement | null = null;
  // 光标所在的文本
  let textEl: HTMLElement | null = null;
  let rangeEl: HTMLElement;
  let rangeIndex = which === "start" ? range.startOffset : range.endOffset;
  if (which === "end") {
    rangeEl = range.endContainer as HTMLElement;
  } else if (which === "start") {
    rangeEl = range.startContainer as HTMLElement;
  } else {
    rangeEl = range.commonAncestorContainer as HTMLElement;
  }
  if (!rangeEl) return null;
  // 向上找节点，最多找10层
  for (let i = 0, el = rangeEl; i < 10 && !editorEl; i++) {
    if (el.className === TEXT_TAG_CLASS || el.parentElement?.className === ROW_TAG_CLASS) {
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

  if (!rowEl) {
    const index = rangeIndex > editorEl.childNodes.length - 1 ? editorEl.childNodes.length - 1 : rangeIndex;
    rowEl = editorEl.childNodes[index] as HTMLElement;
    if (!rowEl || rowEl.className !== ROW_TAG_CLASS) {
      textEl = createTextTag(NEW_LINE);
      rowEl = createElement("p", { className: ROW_TAG_CLASS });
      editorEl.appendChild(rowEl);
    }
    if (!textEl) {
      textEl = rowEl.children[rowEl.children.length - 1] as HTMLElement;
      if (textEl.className !== TEXT_TAG_CLASS) {
        textEl = createTextTag(NEW_LINE);
        rowEl.appendChild(textEl);
      }
    }
    rangeIndex = which === "start" ? 0 : rowEl.childNodes.length;
  }
  if (!textEl) {
    textEl = createTextTag(rowEl.children.length > 0 ? PLACEHOLDER_TEXT : NEW_LINE);
    rowEl.appendChild(textEl);
    rangeIndex = which === "start" ? 0 : rowEl.childNodes.length;
  }
  let _while = 0; // 防止死循环
  while (textEl.className !== TEXT_TAG_CLASS && _while < 10) {
    if (which === "start") {
      textEl = textEl.previousElementSibling as HTMLElement;
      const textNode = textEl.lastChild;
      range.setStart(textNode ? textNode : textEl, (textNode ? textNode.textContent?.length : textEl.childNodes.length) || 0);
    } else {
      textEl = textEl.nextElementSibling as HTMLElement;
      const textNode = textEl.firstChild;
      range.setEnd(textNode ? textNode : textEl, 0);
    }
    _while++;
  }
  if (_while) {
    rangeIndex = which === "start" ? 0 : rowEl.childNodes.length;
  }
  // 查找当前光标，如果光标不在文本标签中，修正光标位置
  let textNode: HTMLElement | null = null;
  let index = 0;
  if (rangeEl === rowEl) {
    let _textEl = (which === "start" ? rowEl.childNodes[0] : rowEl.childNodes[rangeIndex - 1]) as HTMLElement;
    if (_textEl?.className !== TEXT_TAG_CLASS) {
      _textEl = (which === "start" ? rowEl.firstElementChild : rowEl.lastElementChild) as HTMLElement;
    }
    textNode = (which === "start" ? _textEl.firstElementChild : _textEl.lastElementChild) as HTMLElement;
  } else if (rangeEl === textEl) {
    textNode = (which === "start" ? textEl.firstElementChild : textEl.lastElementChild) as HTMLElement;
  }
  if (textNode) {
    index = which === "start" ? 0 : textNode.textContent?.length || 0;
    if (which === "start") {
      range.setStart(textNode, index);
    } else {
      range.setEnd(textNode, index);
    }
    if (which === "common") range.collapse(false);
  }

  return { editorEl, rowEl, textEl };
}

/**
 * 判断光标是否在当前行的末尾
 */
export function isRangeAtRowEnd(range: Range, rowEl: HTMLElement) {
  if (range.startContainer === rowEl && range.startOffset === rowEl.childNodes.length) return true;
  const els = rangeEls(range);
  if (!els) return false;
  if (els.rowEl !== rowEl) return false;
  if (els.textEl !== rowEl.children[rowEl.children.length - 1]) return false;
  return isRangeAtTextEnd(range);
}

/**
 * 判断光标是否在当前文本元素末尾
 */
export function isRangeAtTextEnd(range: Range) {
  const rangeEl = range.endContainer as HTMLElement;
  let textEl: HTMLElement = rangeEl;
  if (textEl.className !== TEXT_TAG_CLASS && textEl.parentElement) {
    textEl = textEl.parentElement as HTMLElement;
  }
  if (rangeEl.className === TEXT_TAG_CLASS && range.endOffset === rangeEl.childNodes.length) return true;
  if (Number(textEl.textContent?.length) === 0) return true;
  if (Number(textEl.textContent?.length) === 1) {
    if (textEl.textContent === PLACEHOLDER_TEXT) return true;
    if (textEl.textContent === "\n") return true;
    if (rangeEl.nodeName === "BR") return true;
  }
  if (rangeEl.nodeName === "#text") {
    if (range.endOffset < Number(rangeEl.textContent?.length)) return false;
    const nodeIndex = Array.from(rangeEl.parentElement?.childNodes || []).indexOf(rangeEl);
    for (let i = nodeIndex + 1; i < textEl.childNodes.length; i++) {
      if (textEl.childNodes[i].textContent?.trim()) return false;
    }
    return true;
  }
  return false;
}

/**
 * 判断光标是否在当前行的开头
 */
export function isRangeAtRowStart(range: Range, rowEl: HTMLElement) {
  // 如果不是0宽占位符就必须是0
  if (range.startContainer === rowEl && range.startOffset === 0) return true;
  if (range.commonAncestorContainer.textContent !== PLACEHOLDER_TEXT && range.startOffset !== 0) return false;
  const els = rangeEls(range);
  if (!els) return false;
  if (els.rowEl !== rowEl) return false;
  if (els.textEl !== rowEl.children[0]) return false;
  return isRangeAtTextStart(range);
}

/**
 * 判断光标是否在当前文本元素开头
 */
export function isRangeAtTextStart(range: Range) {
  const rangeEl = range.startContainer as HTMLElement;
  let textEl: HTMLElement = rangeEl;
  if (textEl.className !== TEXT_TAG_CLASS && textEl.parentElement) {
    textEl = textEl.parentElement as HTMLElement;
  }
  if (rangeEl.className === TEXT_TAG_CLASS && range.endOffset === 0) return true;
  if (Number(textEl.textContent?.length) === 0) return true;
  if (Number(textEl.textContent?.length) === 1) {
    if (textEl.textContent === PLACEHOLDER_TEXT) return true;
    if (textEl.textContent === "\n") return true;
    if (rangeEl.nodeName === "BR") return true;
  }

  if (range.startOffset > 0) return false;

  if (rangeEl.nodeName === "#text") {
    const nodeIndex = Array.from(rangeEl.parentElement?.childNodes || []).indexOf(rangeEl);
    for (let i = 0; i < nodeIndex; i++) {
      if (textEl.childNodes[i].textContent?.trim()) return false;
    }
    return true;
  }

  return false;
}

/**
 * 修正文本标签内容
 */
export function fixTextContent(range: Range, els?: RangeElsType): void {
  const _els = els || rangeEls(range);
  if (!_els) return;
  const { rowEl, textEl } = _els;
  if (range.startContainer.nodeName === "BR") {
    const br = range.startContainer as HTMLElement;
    const text = createTextNode();
    // 将text内容插入到range.startContainer标签之前
    br.parentElement?.insertBefore(text, br);
    range.setStart(text, 0);
    range.collapse(true);
    const content = textEl.textContent || "";
    if (content && content !== "\n") {
      br.parentElement?.removeChild(br);
    }
    return;
  }
  let br = rowEl.querySelector("br");
  while (Number(rowEl.textContent?.trim().length) > 1 && br) {
    br.remove();
    br = rowEl.querySelector("br");
  }

  if (!isNeedFix(textEl)) return;

  if (textEl.className !== TEXT_TAG_CLASS) return;

  if (Number(textEl.textContent?.length) <= 1) return;

  const rangeEl = range.startContainer as HTMLElement;
  let rangeIndex = range.startOffset;
  let nodeIndex = 0;
  if (rangeEl === textEl) {
    nodeIndex = rangeIndex - 1;
    rangeIndex = 0;
  } else if (rangeEl.nodeName === "#text") {
    nodeIndex = Array.from(textEl.childNodes).indexOf(rangeEl);
  }
  // 获取光标两边的内容
  let prevText = "";
  let nextText = "";
  textEl.childNodes.forEach((node, index) => {
    if (index < nodeIndex) {
      prevText += node.textContent || "";
    } else if (index > nodeIndex) {
      nextText += node.textContent || "";
    } else {
      prevText += node.textContent?.slice(0, rangeIndex) || "";
      nextText += node.textContent?.slice(rangeIndex) || "";
    }
  });
  prevText = formatString(prevText);
  nextText = formatString(nextText);
  const textNode = createTextNode(prevText + nextText);
  textEl.innerHTML = "";
  textEl.appendChild(textNode);
  range.setStart(textNode, prevText.length);
  range.collapse(true);
}

/**
 * 删除选中区域内的所有元素
 */
export function removeRangeContent(range: Range, { startEls, endEls, mergeRow }: { startEls?: RangeElsType; endEls?: RangeElsType; mergeRow?: boolean } = {}) {
  if (range.collapsed) return ""; // 没有选中内容
  const sEls = startEls ? startEls : rangeEls(range, "start");
  const eEls = endEls ? endEls : rangeEls(range, "end");
  if (!sEls || !eEls) return "";
  // 不在同一个编辑器内
  if (sEls.editorEl !== eEls.editorEl) return "";
  // 如果是同一个文本标签
  if (sEls.textEl === eEls.textEl) {
    // 是标准文本标签
    if (sEls.textEl.className === TEXT_TAG_CLASS) {
      const rangeEl = range.startContainer as HTMLElement;
      const rangeIndex = range.startOffset;
      // 获取选中内容
      const content = range.extractContents().textContent || "";
      // 删除选中内容
      range.deleteContents();
      range.setStart(rangeEl, rangeIndex);
      range.collapse(true);
      return content;
    }
    const content = sEls.textEl.textContent || "";
    // 删除标签
    sEls.textEl.remove();
    return content;
  }
  let startContent = ""; // 前面删除的内容
  // 获取开始标签下标
  let sIndex = Array.from(sEls.rowEl.children).indexOf(sEls.textEl);
  // 如果开始标签是标准文本标签
  if (sEls.textEl.className === TEXT_TAG_CLASS) {
    startContent += sEls.textEl.textContent?.slice(range.startOffset) || "";
    // 保留光标之前的内容
    let context = sEls.textEl.textContent?.slice(0, range.startOffset);
    context = formatString(context);
    if (context) {
      sIndex += 1; // 如果还有内容，要删除的开始标签往后移一位
      sEls.textEl.textContent = context;
      const textNode = sEls.textEl.lastChild;
      range.setStart(textNode ? textNode : sEls.textEl, textNode ? context.length : sEls.textEl.childNodes.length);
    }
  }
  // 获取结束标签下标
  let eIndex = Array.from(eEls.rowEl.children).indexOf(eEls.textEl);
  // 如果结束标签是标准文本标签
  let endContent = ""; // 后面的内容
  if (eEls.textEl.className === TEXT_TAG_CLASS) {
    endContent += eEls.textEl.textContent?.slice(0, range.endOffset) || "";
    // 保留光标之后的内容
    let context = eEls.textEl.textContent?.slice(range.endOffset);
    context = formatString(context);
    if (context) {
      eIndex -= 1; // 如果还有内容，要删除的结束标签往前移一位
      eEls.textEl.textContent = context;
      range.setEnd(eEls.textEl, 0);
    }
  }

  // 如果是同一行
  if (sEls.rowEl === eEls.rowEl) {
    // 删除包括开始和结束的所有内容
    for (let i = eIndex; i >= sIndex; i--) {
      endContent = (sEls.rowEl.children[i].textContent || "") + endContent;
      sEls.rowEl.children[i].remove();
    }
    range.collapse(true);
    return startContent + endContent;
  }

  // 删除开始行和结束行之间的所有行
  const swIndex = Array.from(sEls.editorEl.children).indexOf(sEls.rowEl);
  const ewIndex = Array.from(eEls.editorEl.children).indexOf(eEls.rowEl);
  let centerContent = ""; // 中间的内容
  for (let i = ewIndex - 1; i > swIndex; i--) {
    centerContent = (sEls.editorEl.children[i].textContent || "") + centerContent;
    sEls.editorEl.children[i].remove();
  }
  // 从开始文本标签开始删除开始行的所有内容
  for (let i = sEls.rowEl.children.length - 1; i >= sIndex; i--) {
    centerContent = (sEls.rowEl.children[i].textContent || "") + centerContent;
    sEls.rowEl.children[i].remove();
  }
  // 删除结束行的从头到结束标签之前的内容
  for (let i = eIndex; i >= 0; i--) {
    endContent = (eEls.rowEl.children[i].textContent || "") + endContent;
    eEls.rowEl.children[i].remove();
  }

  if (mergeRow) {
    // 将光标移动到开始标签的末尾
    moveRangeAtRowEnd(range, sEls.rowEl);
    // 将结束行的所有内容添加到开始行的末尾
    transferElement(eEls.rowEl, sEls.rowEl);
    // 删除结束标签
    eEls.rowEl.remove();
  }

  range.collapse(true);
  return startContent + centerContent + endContent;
}

/**
 * 在光标位置插入文本
 * @param text 文本内容
 * @param range 光标位置
 * @returns
 */
export function insertText(text: string, range: Range): boolean {
  const commonEl = range.commonAncestorContainer as HTMLElement;
  if (!["BR", "#text"].includes(commonEl?.nodeName) && commonEl.className !== TEXT_TAG_CLASS) return false;
  if (commonEl.nodeName === "BR") {
    const els = rangeEls(range);
    if (!els) return false;
    commonEl.parentElement?.removeChild(commonEl);
    els.textEl.innerHTML = text;
    fixTextContent(range, els);
    return true;
  }
  range.insertNode(createTextNode(text));
  return true;
}

/**
 * 在文本内容中插入元素
 * @param el 需要插入的元素
 * @param range 光标位置
 * @returns
 */
export function insertElement(el: HTMLElement, range: Range): boolean {
  const commonEl = range.commonAncestorContainer as HTMLElement;
  if (!["BR", "#text"].includes(commonEl?.nodeName) && commonEl.className !== TEXT_TAG_CLASS) return false;
  const els = rangeEls(range);
  if (!els) return false;
  fixTextContent(range, els);
  // 如果当前文本元素是个空元素
  if (!els.textEl.textContent) {
    const t = createTextNode(PLACEHOLDER_TEXT);
    els.textEl.innerHTML = "";
    els.textEl.appendChild(t);
    // 修正光标位置
    range.setStart(t, 0);
    range.collapse(true);
  }

  el.setAttribute("contenteditable", "false");

  // 如果当前光标在文本节点开头，则将元素插入到文本节点之前
  if (isRangeAtTextStart(range)) {
    // 获取当前textEL的前一个兄弟节点
    let prevEl = els.textEl.previousElementSibling;
    if (!prevEl || prevEl.className !== TEXT_TAG_CLASS) {
      els.textEl.insertAdjacentElement("beforebegin", createTextTag());
    }
    els.textEl.insertAdjacentElement("beforebegin", el);
    return true;
  } else if (isRangeAtTextEnd(range)) {
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
}
