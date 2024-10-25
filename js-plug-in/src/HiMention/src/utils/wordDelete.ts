import { createDocumentFragment, fixEditorContent, isEmptyElement } from ".";
import { getRangeAt, moveRangeAtEditorEnd, rangeEls } from "./range";

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
/*
function onBackspace(range: Range, rowEl: HTMLElement) {
  // 删除文本内容使用默认行为
  if (range.commonAncestorContainer.nodeName === "#text" && range.startOffset > 0) {
    return false;
  }
  // 如果光标在开头，并且是第一个P标签，不执行操作
  if (isCursorAtStart(range, currentP) && !currentP.previousElementSibling) {
    return true;
  }
  // 获取当前光标所在P标签的上一个兄弟节点
  const previousP = currentP.previousElementSibling as HTMLElement;
  // 如果当前节点是空标签
  if (isEmptyElement(currentP)) {
    // 如果有上一个兄弟节点
    if (previousP) {
      currentP.remove();
      // 将光标移动到上一个P标签的末尾
      moveCursorToEnd(range, previousP);
    }
    return true;
  }
  // 如果光标在当前行开头，并且有上一个兄弟节点
  if (isCursorAtStart(range, currentP) && previousP) {
    // 选中当前p标签的所有内容
    range.setStart(currentP, 0);
    range.setEnd(currentP, currentP.childNodes.length);
    // 获取选中内容
    const selectedContent = range.extractContents();
    let endIndex = previousP.childNodes.length;
    if (isEmptyElement(previousP)) {
      endIndex = 0;
      previousP.innerHTML = "";
    }
    // 将光标移动到上一个P标签的末尾
    range.setStart(previousP, endIndex);
    range.setEnd(previousP, endIndex);
    // 将当前P标签的内容添加到上一个P标签中
    previousP.appendChild(selectedContent);
    currentP.remove();
    return true;
  }
  // 如果光标在当前行的末尾
  if (isCursorAtEnd(range, currentP)) {
    // 获取当前标签的最后一个节点
    let lastIndex = currentP.childNodes.length - 1;
    let lastChild = currentP.childNodes[lastIndex] as HTMLElement;
    // 如果最后一个节点是文本节点
    if (lastChild.nodeName === "#text") {
      // 有内容，则使用默认行为
      if (lastChild.textContent?.length) return false;
      // 没有内容，则删除最后一个节点
      currentP.removeChild(lastChild);
      lastIndex--;
      // 继续向上查找，找到有内容的节点为止
      for (; lastIndex >= 0; lastIndex--) {
        const node = currentP.childNodes[lastIndex] as HTMLElement;
        if (node.nodeName === "#text" && !node.textContent?.length) {
          currentP.removeChild(node);
          continue;
        }
        lastChild = node;
        break;
      }
    }
    currentP.removeChild(lastChild);
    if (isEmptyElement(currentP)) {
      currentP.appendChild(createElement("br"))
    }
    return true;
  }
  // 选中光标之前的内容
  range.setStart(currentP, 0);
  range.setEnd(range.endContainer, range.endOffset);
  // 获取选中内容，不从文本中删除
  const selectedContent = range.extractContents();
  // 删除末尾的空标签
  while (selectedContent.lastChild && selectedContent.lastChild.nodeName === "#text" && !selectedContent.lastChild.textContent) {
    selectedContent.removeChild(selectedContent.lastChild);
  }
  // 如果已经没有内容了，不做操作
  if (!selectedContent.lastChild) {
    return true;
  }
  // 如果是文本节点,删除最后一个文字
  if (selectedContent.lastChild.nodeName === "#text" && selectedContent.lastChild.textContent?.length) {
    selectedContent.lastChild.textContent = selectedContent.lastChild.textContent.slice(0, -1);
  } else {
    // 删除有内容的节点
    selectedContent.removeChild(selectedContent.lastChild);
  }

  const length = selectedContent.childNodes?.length || 0;
  let isContent = false;
  for (let i = 0; i < length; i++) {
    const node = selectedContent.childNodes[i] as HTMLElement;
    if (node.nodeName !== "#text" || node.textContent?.length) {
      isContent = true;
      break;
    }
  }
  if (!isContent && isEmptyElement(currentP)) {
    if (currentP.previousElementSibling) {
      const previousP = currentP.previousElementSibling as HTMLElement;
      // 如果有前一个P标签，则删除当前标签
      currentP.remove();
      // 将光标移动到前一个P标签的末尾
      moveCursorToEnd(range, previousP);
    } else if (currentP.innerText !== "\n") {
      // 没有前一个标签 又 没有换行符则添加换行符
      currentP.appendChild(createElement("br"));
    }
    return true;
  }
  if (!isContent) {
    return true;
  }
  range.insertNode(selectedContent);
  // 将光标移动到开始的位置
  range.setStart(currentP, length);
  range.setEnd(currentP, length);
  return true;

}
*/
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
    // 如果开始和结束P标签不一致，将结束标签中的剩余内容移动到开始标签中，并删除结束标签
    if (startP !== endP) {
      const fr = createDocumentFragment()
      for (let i = endP.childNodes.length - 1; i >= 0; i--) {
        const node = endP.childNodes[i];
        fr.insertBefore(node, fr.firstChild);
      }
      startP.appendChild(fr);
      const startIndex = Array.from(editorEl.childNodes).indexOf(startP);
      const endIndex = Array.from(editorEl.childNodes).indexOf(endP);
      for (let i = endIndex; i > startIndex; i--) {
        editorEl.removeChild(editorEl.childNodes[i]);
      }
    }
    // 修正光标位置
    range.setStart(startContainer, startOffset);
    range.setEnd(startContainer, startOffset);
    return true;
  }
  return false
  /*
  // 获取当前光标所在的P标签
  let els = rangeEls(range);
  if (!els) {
    this.focus(); // 恢复焦点
    return true;
  }
  if (e.code === "Backspace") {
    return this._onBackspace(range, els.rowEl);
  }
  if (e.code === "Delete") {
    return this._onDelete(range, els.rowEl);
  }*/
}