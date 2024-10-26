import { PLACEHOLDER_TEXT, TEXT_TAG_CLASS } from "../const";
import { isEmptyElement } from ".";
import { fixTextContent, getRangeAt, isRangeAtRowEnd, isRangeAtRowStart, moveRangeAtRowEnd, moveRangeAtRowStart, rangeEls } from "./range";

export default function moveCursor(type: "ArrowLeft" | "ArrowRight") {
  const range = getRangeAt();
  if (!range) return;
  const els = rangeEls(range);
  if (!els) return;
  fixTextContent(range, els);

  // 判断是否需要换行
  if (type === "ArrowLeft" && isRangeAtRowStart(range, els.rowEl)) {
    const newCol = els.rowEl.previousElementSibling as HTMLElement;
    if (newCol) moveRangeAtRowEnd(range, newCol);
    return;
  }
  if (type === "ArrowRight" && isRangeAtRowEnd(range, els.rowEl)) {
    const newCol = els.rowEl.nextElementSibling as HTMLElement;
    if (newCol) moveRangeAtRowStart(range, newCol);
    return;
  }

  if (type === "ArrowLeft") {
    // 如果当前是个空节点，则向前移动到一个有内容的节点
    if (isEmptyElement(els.textEl) || range.startOffset === 0) {
      let preNode = els.textEl.previousElementSibling;
      while (preNode && isEmptyElement(preNode)) {
        preNode = preNode.previousElementSibling;
      }
      while (preNode && preNode.className !== TEXT_TAG_CLASS) {
        preNode = preNode.previousElementSibling;
      }
      if (!preNode) return;
      const lastChild = preNode.lastChild;
      const index = lastChild ? Number(lastChild.textContent?.length) : preNode.childNodes.length;
      range.setStart(lastChild ? lastChild : preNode, index);
      range.collapse(true);
      return;
    }
    let upIndex = Math.max(0, range.startOffset - 1);
    let text = range.startContainer.textContent?.[upIndex];
    while (text === PLACEHOLDER_TEXT || text === "\n") {
      upIndex -= 1;
      text = range.startContainer.textContent?.[upIndex];
    }
    if (text === "\r") {
      let upText = range.startContainer.textContent?.[upIndex - 1];
      while (upText === "\r") {
        upIndex -= 1;
        upText = range.startContainer.textContent?.[upIndex - 1];
      }
    }
    range.setStart(range.startContainer, Math.max(0, upIndex));
    range.collapse(true);
    return;
  }

  if (type === "ArrowRight") {
    // 如果当前是个空节点，则向后移动到一个有内容的节点
    if (isEmptyElement(els.textEl) || range.startOffset == Number(range.startContainer.textContent?.length)) {
      let nextNode = els.textEl.nextElementSibling;
      while (nextNode && isEmptyElement(nextNode)) {
        nextNode = nextNode.nextElementSibling;
      }
      while (nextNode && nextNode.className !== TEXT_TAG_CLASS) {
        nextNode = nextNode.nextElementSibling;
      }
      if (!nextNode) return;
      const prev = nextNode.firstChild;
      range.setStart(prev ? prev : nextNode, 0);
      range.collapse(true);
      return;
    }
    let nextIndex = Math.min(range.startContainer.textContent?.length || 0, range.startOffset + 1);
    let text = range.startContainer.textContent?.[nextIndex];
    while (text === PLACEHOLDER_TEXT || text === "\n") {
      nextIndex += 1;
      text = range.startContainer.textContent?.[nextIndex];
    }
    if (text === "\r") {
      let nextText = range.startContainer.textContent?.[nextIndex + 1];
      while (nextText === "\r") {
        nextIndex += 1;
        nextText = range.startContainer.textContent?.[nextIndex + 1];
      }
    }

    nextIndex = Math.min(range.startContainer.textContent?.length || 0, nextIndex);
    range.setStart(range.startContainer, nextIndex);
    range.collapse(true);
    return;
  }
}
