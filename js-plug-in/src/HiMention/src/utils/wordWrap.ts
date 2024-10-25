import { ROW_TAG_CLASS } from "../const";
import { createElement, createRowTag, fixRowContent } from ".";
import { rangeEls, getRangeAt, moveRangeAtRowStart, getSelection, isRangeAtRowEnd } from "./range"

export default function wordWrap() {
  const selection = getSelection()
  const range = getRangeAt(0, selection);
  if (!range) return;
  if (!range.collapsed) {
    // 删除选中的内容
    range.deleteContents();
    // 获取开始位置所在的P标签
    const sEls = rangeEls(range, "start");
    const eEls = rangeEls(range, "end");
    if (!sEls?.rowEl || !eEls?.rowEl) return;
    // 修正开始行标签
    fixRowContent(sEls.rowEl);
    // 如果开始位置和结束位置不在同一行
    if (sEls.rowEl !== eEls.rowEl) {
      // 修正结束行标签
      fixRowContent(eEls.rowEl);
      // 将光标移动到结束P标签的开头
      moveRangeAtRowStart(range, eEls.rowEl);
      return;
    }
  }
  // 获取当前所在的标签
  let els = rangeEls(range);
  if (!els) return;
  // 如果光标在当前行末尾
  if (isRangeAtRowEnd(range, els.rowEl)) {
    // 在当前行后创建一个新行
    const newRow = createRowTag();
    els.rowEl.insertAdjacentElement("afterend", newRow);
    // 将光标设置到新创建的p标签中
    moveRangeAtRowStart(range, newRow);
    return;
  }
  // 选中当前行光标之前的内容
  range.setStart(els.rowEl, 0);
  // 获取光标选中的内容
  const selectedContent = range.extractContents();
  // 将内容插入到新创建的行中
  const newRow = createElement("p", { className: ROW_TAG_CLASS });
  newRow.appendChild(selectedContent);
  // 修正新的行
  fixRowContent(newRow);
  // 修正当前行
  fixRowContent(els.rowEl);
  // 插入创建的p标签在原P标签之前
  els.rowEl.insertAdjacentElement("beforebegin", newRow);
  // 将光标移动到原P标签开头
  moveRangeAtRowStart(range, els.rowEl);
}