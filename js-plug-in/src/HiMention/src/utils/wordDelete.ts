import { NEW_LINE, PLACEHOLDER_TEXT, TEXT_TAG_CLASS } from "../const";
import { createTextTag, fixEditorContent, fixRowContent, isEmptyElement, transferElement } from ".";
import { fixTextContent, getRangeAt, isRangeAtRowEnd, isRangeAtRowStart, isRangeAtTextEnd, isRangeAtTextStart, moveRangeAtEditorEnd, moveRangeAtRowEnd, moveRangeAtRowStart, rangeEls, removeRangeContent } from "./range";

function onDelete(range: Range, { rowEl, textEl }: { rowEl: HTMLElement; textEl: HTMLElement }): true {
  const rangeNode = range.commonAncestorContainer;
  // 删除文本内容
  const isText = rangeNode.nodeName === "#text";
  const textLength = rangeNode.textContent?.length || 0;
  const isEmpty = rangeNode.textContent === PLACEHOLDER_TEXT;
  if (isText && !isEmpty && range.endOffset < textLength) {
    // 如果只有一个字符，则将节点内容设置为0宽占位符
    if (textLength === 1) {
      rangeNode.textContent = PLACEHOLDER_TEXT;
      return true;
    }
    // 否则删除光标位置之后的第一个文本内容
    let index = range.endOffset;
    // 找到要删除的内容
    let text = rangeNode.textContent?.[index];
    let sIndex = index;
    let eIndex = index + 1;
    if (text === PLACEHOLDER_TEXT) {
      index += 1;
      sIndex = index;
      eIndex = index + 1;
      text = rangeNode.textContent?.[index + 1];
    }
    // 如果要删除的是\r，则将连续的\r都删除
    if (text === "\r" && index < Number(rangeNode.textContent?.length)) {
      for (let i = index; i < Number(rangeNode.textContent?.length); i++) {
        if (rangeNode.textContent?.[i] === "\r") {
          index += 1;
          eIndex = index + 1;
        } else break;
      }
    }
    const text1 = rangeNode.textContent?.slice(0, sIndex) || "";
    const text2 = rangeNode.textContent?.slice(eIndex) || "";
    rangeNode.textContent = text1 + text2;
    index = Math.min(index, rangeNode.textContent.length);
    range.setStart(rangeNode, index);
    range.collapse(true);
    return true;
  }

  // 获取当前所在行的下一个兄弟节点
  const nextRow = rowEl.nextElementSibling as HTMLElement;

  // 如果当前节点是空标签
  if (isEmptyElement(rowEl)) {
    // 如果存在下一个兄弟节点
    if (nextRow) {
      rowEl.remove();
      // 将光标移动到下一个兄弟的起点
      moveRangeAtRowStart(range, nextRow);
    }
    return true;
  }

  // 没有下一个节点并且在当前行的末尾
  if (!nextRow && isRangeAtRowEnd(range, rowEl)) {
    return true;
  }

  // 如果光标在当前行的末尾并且有下一个兄弟节点
  if (isRangeAtRowEnd(range, rowEl) && nextRow) {
    // 如果下一个节点是空标签
    if (isEmptyElement(nextRow)) {
      nextRow.remove();
      return true;
    }
    // 将下一个兄弟节点的内容转移到当前节点
    transferElement(nextRow, rowEl);
    return true;
  }
  let delEl = textEl; // 要删除的内容
  // 如果当前是空节点或者光标在当前文本的末尾
  if (isEmptyElement(textEl) || isRangeAtTextEnd(range)) {
    const index = Array.from(rowEl.childNodes).indexOf(textEl);
    // 往后删除所有空节点
    const delIndexs: (Node | HTMLElement)[] = [];
    // 如果当前节点为空，则删除当前节点
    if (isEmptyElement(delEl)) delIndexs.push(delEl);
    for (let i = index + 1; i < rowEl.childNodes.length; i++) {
      let node = rowEl.childNodes[i] as HTMLElement;
      if (isEmptyElement(node)) {
        delIndexs.push(node);
      } else {
        delEl = node;
        break;
      }
    }
    // 删除所有空节点
    delIndexs.forEach((node) => {
      node.parentElement?.removeChild(node);
    });
  }

  // 如果是文本节点，则删除第一个字符并将光标移动到节点开头
  if (delEl.className === TEXT_TAG_CLASS) {
    delEl.textContent = delEl.textContent?.slice(1) || "";
    // 如果还有剩余内容，将光标移动到节点开头
    if (!isEmptyElement(delEl)) {
      const textNode = delEl.lastChild;
      range.setStart(textNode ? textNode : delEl, 0);
      range.collapse(true);
      return true;
    }
  }

  // 获取下一个节点
  const nextNode = delEl.nextElementSibling as HTMLElement;
  delEl.remove();
  if (isEmptyElement(rowEl)) {
    rowEl.innerHTML = createTextTag(NEW_LINE).outerHTML;
    moveRangeAtRowEnd(range, rowEl);
  } else if (nextNode) {
    // 下一个节点的第一个子节点
    const textNode = nextNode.firstChild;
    range.setStart(textNode ? textNode : nextNode, 0);
    range.collapse(true);
  }
  return true;
}

function onBackspace(range: Range, { rowEl, textEl }: { rowEl: HTMLElement; textEl: HTMLElement }): true {
  const rangeNode = range.commonAncestorContainer as HTMLElement;
  // 删除文本内容
  const isText = rangeNode.nodeName === "#text";
  const isEmpty = rangeNode.textContent === PLACEHOLDER_TEXT;
  if (isText && !isEmpty && range.startOffset > 0) {
    // 如果只有一个字符，则将节点内容设置为0宽占位符
    if (range.startContainer.textContent?.length === 1) {
      rangeNode.textContent = PLACEHOLDER_TEXT;
      return true;
    }
    // 否则删除光标位置之前的第一个文本内容
    let index = range.startOffset;
    // 找到要删除的内容
    let text = rangeNode.textContent?.[index - 1];
    let sIndex = index - 1;
    let eIndex = index;
    if (text === PLACEHOLDER_TEXT) {
      index -= 1;
      sIndex = index - 1;
      eIndex = index;
      text = rangeNode.textContent?.[index - 1];
    }
    // 如果要删除的是\r，则将连续的\r都删除
    if (text === "\r" && index > 1) {
      for (let i = index - 1; i >= 0; i--) {
        if (rangeNode.textContent?.[i] === "\r") {
          index -= 1;
          sIndex = index - 1;
        } else break;
      }
    }

    const text1 = rangeNode.textContent?.slice(0, sIndex) || "";
    const text2 = rangeNode.textContent?.slice(eIndex) || "";
    rangeNode.textContent = text1 + text2;
    index = Math.max(0, index - 1);
    index = Math.min(index, rangeNode.textContent.length);
    range.setStart(rangeNode, index);
    range.collapse(true);
    return true;
  }
  // 获取当前光标所在P标签的上一个兄弟节点
  const upRow = rowEl.previousElementSibling as HTMLElement;

  // 如果当前节点是空标签
  if (isEmptyElement(rowEl)) {
    // 如果有上一个兄弟节点
    if (upRow) {
      rowEl.remove();
      // 将光标移动到上一个P标签的末尾
      moveRangeAtRowEnd(range, upRow);
    }
    // 如果没有兄弟不执行操作
    return true;
  }

  // 如果没有上级兄弟，并且光标在当前行开头，不执行操作
  if (!upRow && isRangeAtRowStart(range, rowEl)) {
    return true;
  }

  // 如果光标在当前行开头，并且有上一个兄弟节点
  if (isRangeAtRowStart(range, rowEl) && upRow) {
    // 如果上一个标签是空节点，直接删除上一个标签
    if (isEmptyElement(upRow)) {
      upRow.remove();
      return true;
    }
    // 将光标移动到上一个P标签的末尾
    moveRangeAtRowEnd(range, upRow);
    rowEl.remove();
    // 将当前行的内容添加到上一行中
    transferElement(rowEl, upRow);
    return true;
  }

  let delEl = textEl; // 要删除的内容
  // 如果当前是空节点或者光标在当前文本的开头
  if (isEmptyElement(textEl) || isRangeAtTextStart(range)) {
    const index = Array.from(rowEl.childNodes).indexOf(textEl);
    // 如果为空，删除当前节点
    if (isEmptyElement(textEl)) textEl.remove();
    // 往前删除所有空节点
    for (let i = index - 1; i >= 0; i--) {
      const node = rowEl.childNodes[i] as HTMLElement;
      if (!isEmptyElement(node)) {
        delEl = node;
        break;
      }
      node.remove();
    }
  }

  // 如果是文本节点，则删除最后一个文字
  if (delEl.className === TEXT_TAG_CLASS) {
    delEl.textContent = delEl.textContent?.slice(0, -1) || "";
    // 如果还有内容，将光标移动到文本末尾
    if (!isEmptyElement(delEl)) {
      const textNode = delEl.lastChild;
      const textLength = delEl.textContent?.length || 0;
      range.setStart(textNode ? textNode : delEl, textNode ? textLength : delEl.childNodes.length);
      range.collapse(true);
      return true;
    }
  }
  // 获取上一个节点
  const upNode = delEl.previousElementSibling as HTMLElement;
  delEl.remove();
  // 修正光标位置
  if (isEmptyElement(rowEl)) {
    rowEl.innerHTML = createTextTag(NEW_LINE).outerHTML;
    moveRangeAtRowEnd(range, rowEl);
  } else if (upNode) {
    const childLength = upNode.childNodes.length;
    const nextChild = upNode.childNodes[childLength - 1];
    const index = isEmptyElement(upNode) ? 0 : nextChild.textContent?.length || 0;
    range.setStart(nextChild, index);
    range.collapse(true);
  }
  return true;
}

export default function wordDelete(e: KeyboardEvent, editorEl: HTMLElement) {
  const range = getRangeAt();
  if (!range) return false;
  if (fixEditorContent(editorEl)) {
    // 将光标移动到编辑器末尾
    moveRangeAtEditorEnd(range, editorEl);
    return true;
  }
  // 如果有选中内容
  if (!range.collapsed) {
    // 获取光标开始和结束的P标签
    const sEls = rangeEls(range, "start");
    const eEls = rangeEls(range, "end");
    if (!sEls?.rowEl || !eEls?.rowEl) return false;
    removeRangeContent(range, { startEls: sEls, endEls: eEls, mergeRow: true });
    return true;
  }
  // 获取当前光标所在的P标签
  let els = rangeEls(range);
  if (!els) return true;
  let bool = false;
  fixTextContent(range, els);
  if (e.code === "Backspace") {
    bool = onBackspace(range, els);
  }
  if (e.code === "Delete") {
    bool = onDelete(range, els);
  }

  if (bool) {
    // 修正当前行标签
    fixRowContent(els.rowEl);
  }

  return bool;
}
