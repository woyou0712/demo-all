import { NEW_LINE, PLACEHOLDER_TEXT, TEXT_TAG_CLASS } from "../const";
import { createDocumentFragment, createTextTag, fixEditorContent, fixRowContent, isEmptyElement } from ".";
import { getRangeAt, isRangeAtRowStart, isRangeAtTextStart, moveRangeAtEditorEnd, moveRangeAtRowEnd, rangeEls } from "./range";

/**
 * 
function onDelete(range: Range, rowEl: HTMLElement){
    // 如果光标所在为text节点，并且不在当前节点的末尾，则使用默认行为
    if (range.commonAncestorContainer?.nodeName === "#text" && range.endOffset < Number(range.commonAncestorContainer.textContent?.length)) {
      return false;
    }
    // 如果当前节点是个空标签，并且有后面还有兄弟节点
    if (isEmptyElement(currentP) && currentP.nextElementSibling) {
      currentP.remove();
      return true;
    }

    // 如果光标在末尾，并且是最后一个P标签，不执行操作
    const isEnd = isCursorAtEnd(range, currentP);
    // 如果光标在当前P标签的末尾，并且是最后一个P标签，不执行操作
    if (isEnd && !currentP.nextElementSibling) {
      return true;
    }
    // 如果光标在当前P标签的末尾，并且不是最后一个P标签，将下一个P标签的内容写入当前P标签中，并删除下一个P标签
    if (isEnd && currentP.nextElementSibling) {
      const nextP = currentP.nextElementSibling as HTMLElement;
      // 如果下一个P标签为空标签，则直接删除
      if (isEmptyElement(nextP)) {
        nextP.remove();
        return true;
      }
      // 选中下一个P标签的所有内容
      range.setStart(nextP, 0);
      range.setEnd(nextP, nextP.childNodes.length);
      // 获取选中内容
      const selectedContent = range.extractContents();
      // 将光标移动到当前P标签的末尾
      moveCursorToEnd(range, currentP);
      // 将下一个P标签的内容添加到当前P标签中
      currentP.appendChild(selectedContent);
      nextP.remove();
      return true;
    }

    // 记录光标开始位置
    const startContainer = range.startContainer;
    const startOffset = range.startOffset;
    // 选中当前P标签下光标开始之后的内容
    range.setStart(range.startContainer, range.startOffset);
    range.setEnd(currentP, currentP.childNodes.length);
    // 获取选中内容
    const selectedContent = range.extractContents();
    // 如果选中内容为空，则不执行操作
    if (!selectedContent?.childNodes?.length) {
      return true;
    }
    // 删除第一个有内容的子节点
    let count = 0; // 计算开头空的文本节点数量
    for (; count < selectedContent.childNodes.length;) {
      const node = selectedContent.childNodes[count];
      if (node.nodeName === "#text" && !node.textContent) {
        count++;
      } else {
        break;
      }
    }
    // 删除所有的空节点
    for (; count > 0; count--) {
      selectedContent.removeChild(selectedContent.childNodes[count - 1]);
    }
    // 再删除内容
    const firstNode = selectedContent.childNodes[0];
    if (firstNode) {
      // 如果是文本节点，删除文本节点第一个文本
      if (firstNode.nodeName === "#text" && firstNode.textContent) {
        firstNode.textContent = firstNode.textContent?.substring(1);
      } else {
        selectedContent.removeChild(selectedContent.childNodes[0]);
      }
    }
    // 判断是否还有剩余内容
    let isContent = false;
    for (let i = 0; i < selectedContent.childNodes.length; i++) {
      const node = selectedContent.childNodes[i];
      if (node.nodeName !== "#text" || node.textContent?.length) {
        isContent = true;
        break;
      }
    }
    // 如果没有内容，并且P标签中也没有剩余内容
    if (!isContent && isEmptyElement(currentP)) {
      if (currentP.nextElementSibling) {
        const nextP = currentP.nextElementSibling as HTMLElement;
        // 如果存在下一行则删除当前行
        currentP.remove();
        // 将光标移动到下一个P标签的开始位置
        moveCursorToStart(range, nextP);
      } else if (currentP.innerText !== "\n") {
        // 如果不存在下一行 又没有换行符 添加一个换行符
        currentP.appendChild(createElement("br"));
      }
      return true;
    }
    // 将剩余内容添加到当前P标签中
    currentP.appendChild(isContent ? selectedContent : createElement("br"));
    // 将光标移动到初始位置
    range.setStart(startContainer, startOffset);
    range.setEnd(startContainer, startOffset);
    return true;
}
 */

function onBackspace(range: Range, { rowEl, textEl, editorEl }: { rowEl: HTMLElement, textEl: HTMLElement, editorEl: HTMLElement }) {
  // 删除文本内容使用默认行为
  const isText = range.commonAncestorContainer.nodeName === "#text";
  const isEmpty = range.commonAncestorContainer.textContent === PLACEHOLDER_TEXT
  if (isText && range.startOffset > 0 && !isEmpty) {
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
    for (let i = 0; i < rowEl.childNodes.length; i++) {
      fr.appendChild(rowEl.childNodes[i].cloneNode(true));
    }
    // 将光标移动到上一个P标签的末尾
    moveRangeAtRowEnd(range, upRow);
    // 将当前P标签的内容添加到上一个P标签中
    upRow.appendChild(fr);
    return true;
  }


  let delEl = textEl; // 要删除的内容
  // 判断光标所在文本节点是否为空，
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
  return true;
  /*
if (e.code === "Delete") {
return this._onDelete(range, els.rowEl);
}*/
}