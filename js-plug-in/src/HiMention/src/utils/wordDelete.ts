import { NEW_LINE, PLACEHOLDER_TEXT, TEXT_TAG_CLASS } from "../const";
import { createDocumentFragment, createTextTag, fixEditorContent, fixRowContent, isEmptyElement } from ".";
import { getRangeAt, isRangeAtRowEnd, isRangeAtRowStart, isRangeAtTextStart, moveRangeAtEditorEnd, moveRangeAtRowEnd, moveRangeAtRowStart, rangeEls } from "./range";


function onDelete(range: Range, { rowEl, textEl }: { rowEl: HTMLElement, textEl: HTMLElement }) {
  // 删除文本内容使用默认行为
  const isText = range.commonAncestorContainer.nodeName === "#text";
  const textLength = range.commonAncestorContainer.textContent?.length || 0;
  const isEmpty = range.commonAncestorContainer.textContent === PLACEHOLDER_TEXT
  if (isText && !isEmpty && range.endOffset < textLength) {
    return false;
  }

  // 获取当前所在行的下一个兄弟节点
  const nextRow = rowEl.nextElementSibling as HTMLElement;

  // 没有下一个节点并且在当前行的末尾
  if (!nextRow && isRangeAtRowEnd(range, rowEl)) {
    return true;
  }

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

  // 如果光标在当前行的末尾并且有下一个兄弟节点
  if (isRangeAtRowEnd(range, rowEl) && nextRow) {
    // 如果下一个节点是空标签
    if (isEmptyElement(nextRow)) {
      nextRow.remove();
      return true;
    }
    // 将下一个兄弟节点的内容复制到当前节点
    const fr = createDocumentFragment();
    nextRow.remove();
    nextRow.childNodes.forEach(node => {
      fr.appendChild(node.cloneNode(true));
    })

    rowEl.appendChild(fr);
    return true;
  }
  return false;
}

function onBackspace(range: Range, { rowEl, textEl }: { rowEl: HTMLElement, textEl: HTMLElement }) {
  // 删除文本内容使用默认行为
  const isText = range.commonAncestorContainer.nodeName === "#text";
  const isEmpty = range.commonAncestorContainer.textContent === PLACEHOLDER_TEXT
  if (isText && !isEmpty && range.startOffset > 0) {
    return false;
  }

  // 获取当前光标所在P标签的上一个兄弟节点
  const upRow = rowEl.previousElementSibling as HTMLElement;
  // 如果没有上级兄弟，并且光标在当前行开头，不执行操作
  if (!upRow && isRangeAtRowStart(range, rowEl)) {
    return true;
  }


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

  // 如果光标在当前行开头，并且有上一个兄弟节点
  if (isRangeAtRowStart(range, rowEl) && upRow) {
    // 如果上一个标签是空节点，直接删除上一个标签
    if (isEmptyElement(upRow)) {
      upRow.remove();
      return true;
    }
    // 将当前行中的所有内容转入到上一行
    const fr = createDocumentFragment();
    rowEl.remove();
    // 将当前行中的所有内容复制到文档片段中
    rowEl.childNodes.forEach(node => {
      fr.appendChild(node.cloneNode(true));
    })
    // 将光标移动到上一个P标签的末尾
    moveRangeAtRowEnd(range, upRow);
    // 将当前P标签的内容添加到上一个P标签中
    upRow.appendChild(fr);
    return true;
  }


  let delEl = textEl; // 要删除的内容
  // 如果当前是空节点或者光标在当前文本的开头
  if (isEmptyElement(textEl) || isRangeAtTextStart(range, rowEl)) {
    const index = Array.from(rowEl.childNodes).indexOf(textEl);
    // 如果为空，删除当前节点
    if (isEmptyElement(textEl)) textEl.remove();
    // 往前删除所有空节点
    for (let i = index - 1; i >= 0; i--) {
      const node = rowEl.childNodes[i] as HTMLElement;
      if (!isEmptyElement(node)) {
        delEl = node;
        break
      }
      node.remove();
    }
  }


  // 如果是文本节点，则删除最后一个文字
  if (delEl.className === TEXT_TAG_CLASS) {
    delEl.textContent = delEl.textContent?.slice(0, -1) || "";
    // 如果还有内容，则不进行后续操作
    if (!isEmptyElement(delEl)) {
      return true
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
    range.setEnd(nextChild, index);
  }
  return true
}


export default function wordDelete(e: KeyboardEvent, editorEl: HTMLElement) {
  const range = getRangeAt();
  if (!range) return;
  if (isEmptyElement(editorEl)) {
    fixEditorContent(editorEl);
    // 将光标移动到编辑器末尾
    moveRangeAtEditorEnd(range, editorEl)
    return true;
  }
  // 如果有选中内容
  if (!range.collapsed) {
    // 获取光标开始和结束的P标签
    const sEls = rangeEls(range, "start");
    const eEls = rangeEls(range, "end");
    if (!sEls?.rowEl || !eEls?.rowEl) return false;
    const [startP, endP] = [sEls.rowEl, eEls.rowEl];
    const startContainer = range.startContainer;
    const startOffset = range.startOffset;
    // 如果存在选中内容,删除选中内容
    range.deleteContents();
    // 如果开始和结束P标签不一致，将结束标签中的剩余内容复制到开始标签中，并删除结束标签
    if (startP !== endP) {
      const fr = createDocumentFragment()
      endP.remove();
      endP.childNodes.forEach((node) => {
        fr.appendChild(node.cloneNode(true))
      })
      startP.appendChild(fr);
    }
    // 修正光标位置
    range.setStart(startContainer, startOffset);
    range.setEnd(startContainer, startOffset);
    return true;
  }
  // 获取当前光标所在的P标签
  let els = rangeEls(range);
  if (!els) return true;

  if (e.code === "Backspace") {
    return onBackspace(range, els);
  }
  if (e.code === "Delete") {
    return onDelete(range, els);
  }
  return false
}