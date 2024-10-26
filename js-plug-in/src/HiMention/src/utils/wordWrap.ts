import { ROW_TAG_CLASS, TEXT_TAG_CLASS } from "../const";
import { createElement, createRowTag, fixRowContent, isEmptyElement, transferElement } from ".";
import { rangeEls, getRangeAt, moveRangeAtRowStart, getSelection, isRangeAtRowEnd, fixTextContent, removeRangeContent } from "./range";

export default function wordWrap() {
  const selection = getSelection();
  const range = getRangeAt(0, selection);
  if (!range) return;
  if (!range.collapsed) {
    // 获取开始位置所在的P标签
    const sEls = rangeEls(range, "start");
    const eEls = rangeEls(range, "end");
    if (!sEls?.rowEl || !eEls?.rowEl) return;
    // 删除选中内容
    removeRangeContent(range, { startEls: sEls, endEls: eEls });
    // 如果不是同一行，将光标移动到结束行的开头位置
    if (sEls.rowEl !== eEls.rowEl) {
      moveRangeAtRowStart(range, eEls.rowEl);
      return;
    }
  }
  // 获取光标当前所在的标签
  let els = rangeEls(range);
  if (!els) return;
  fixTextContent(range, els);
  // 如果光标在当前行末尾
  if (isEmptyElement(els.rowEl) || isRangeAtRowEnd(range, els.rowEl)) {
    // 在当前行后创建一个新行
    const newRow = createRowTag();
    els.rowEl.insertAdjacentElement("afterend", newRow);
    // 将光标设置到新创建的p标签中
    moveRangeAtRowStart(range, newRow);
    return;
  }
  // 选中当前行光标之前的内容
  // 获取当前行的第一个元素
  let firstChild = els.rowEl.firstChild as HTMLElement;
  if (firstChild?.className === TEXT_TAG_CLASS) {
    firstChild = firstChild.firstChild as HTMLElement;
  }
  range.setStart(firstChild ? firstChild : els.rowEl, 0);
  range.setEnd(range.endContainer, range.endOffset);
  // 获取光标选中的内容
  const selectedContent = range.extractContents();
  // 清除当前行开头的空标签
  const emptyEls: Node[] = [];
  for (let i = 0; i < els.rowEl.childNodes.length; i++) {
    const child = els.rowEl.childNodes[i];
    if (!child.textContent) {
      emptyEls.push(child);
    } else {
      break;
    }
  }
  emptyEls.forEach((el) => el.parentElement?.removeChild(el));
  const newRow = createElement("p", { className: ROW_TAG_CLASS });
  // 将内容插入到新创建的行中
  transferElement(selectedContent, newRow);
  // 修正新的行
  fixRowContent(newRow);
  // 修正当前行
  fixRowContent(els.rowEl);
  // 插入创建的p标签在原P标签之前
  els.rowEl.insertAdjacentElement("beforebegin", newRow);
  // 将光标移动到原P标签开头
  moveRangeAtRowStart(range, els.rowEl);
}
