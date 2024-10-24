import { defaultMentionOptions, EDITOR_CLASS, EMPTY_INPUT_CONTENT, P_TAG_CLASS } from "./const";
import UserSelector from "./UserSelector";
import { createElement, createTextNode, getCurrentP, getRangeAt, getSelection, isCursorAtEnd, isCursorAtStart, isEmptyElement, moveCursorToEnd, moveCursorToStart } from "./utils";
import { OnEvents, MentionOptions, UserInfo, EventsType } from "./types"

class Mention {
  private _rootEl: HTMLElement;
  private _editorBody = createElement("section", { className: "hi-mention-body" });
  private _editorEl = createElement("div", { className: EDITOR_CLASS });
  private _placeholderEl = createElement("div", { className: "hi-mention-placeholder" });
  private _events: OnEvents = {
    clicks: [],
    blurs: [],
    focuses: [],
    changes: [],
    inputs: [],
    keydowns: [],
    keyups: [],
    "mention-users": [],
  };

  private _changetimeout?: any;
  private _blurtimeout?: any;

  private _inputRange?: Range;
  private _inputSelection?: Selection;

  protected options: MentionOptions = defaultMentionOptions();

  userSelector?: UserSelector;

  private _queryStr = "";

  constructor(el: Element | HTMLElement | string, option: Partial<MentionOptions> = {}) {
    if (!el) {
      throw new Error("Mention: no element provided");
    }
    if (typeof el === "string") {
      const e = document.querySelector(el);
      if (!e) {
        throw new Error("Mention: no element provided");
      }
      this._rootEl = e as HTMLElement;
    } else {
      this._rootEl = el as HTMLElement;
    }
    this.options = Object.assign(this.options, option);

    this._initElement();
    this._initEvent();

    this.initUserSelector();
  }



  private _initElement() {
    this._rootEl.style.position = "relative";
    const body = this._editorBody;
    const editor = this._editorEl;
    editor.setAttribute("contenteditable", "true");
    editor.innerHTML = EMPTY_INPUT_CONTENT;

    const placeholderEl = this._placeholderEl;
    placeholderEl.innerText = this.options.placeholder;
    placeholderEl.style.color = this.options.placeholderColor;
    body.appendChild(editor);
    body.appendChild(placeholderEl);
    this._rootEl.appendChild(body);
  }

  private _initEvent() {
    this._editorEl.onclick = (e) => this._onclick(e);
    this._editorEl.onblur = (e) => this._onblur(e);
    this._editorEl.onfocus = (e) => this._onfocus(e);
    this._editorEl.onkeydown = (e) => this._onkeydown(e);
    this._editorEl.onkeyup = (e) => this._onkeyup(e);
    this._editorEl.oninput = (e) => this._oninput(e);
    this._editorEl.oncut = (e) => this._oncut(e);
    this._editorEl.onpaste = (e) => this._onpaste(e);
  }


  private _onclick(e: MouseEvent) {
    if (e.target === this._editorEl) {
      e.preventDefault();
      this._editorEl.focus();
    }
    this._events["clicks"].forEach((fn) => fn(e));
  }

  private _onblur(e: FocusEvent) {
    this._events["blurs"].forEach((fn) => fn(e));
    clearTimeout(this._blurtimeout);
    this._blurtimeout = setTimeout(() => {
      this.closeUserSelector();
    }, 200);
  }

  private _onfocus(e: FocusEvent) {
    this._events["focuses"].forEach((fn) => fn(e));
  }

  private _onkeydown(e: KeyboardEvent) {
    if (["Enter", "NumpadEnter"].includes(e.code)) {
      e.preventDefault();
      this._wordWrap();
      this._onchange(); // 不触发默认行为，需要手动触发change事件
      this._inputEvent();
    } else if (["Backspace", "Delete"].includes(e.code)) {
      const bool = this._wordDelete(e);
      if (bool) {
        e.preventDefault();
        this._onchange(); // 不触发默认行为，需要手动触发change事件
        this._inputEvent();
      }
    }
    this._events["keydowns"].forEach((fn) => fn(e));
  }
  private _onkeyup(e: KeyboardEvent) {
    this._events["keyups"].forEach((fn) => fn(e));
  }

  private _oninput(e: Event) {
    this._events["inputs"].forEach((fn) => fn(e));
    this._onchange();
    this._inputEvent();
  }

  private _oncut(e: ClipboardEvent) {
    this._inputEvent();
    this._onchange();
  }

  private _onpaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain");
    if (!text) return;
    const selection = getSelection();
    if (!selection) return;
    const range = getRangeAt(selection);
    if (!range) return;
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    // 修正光标位置
    range.setStart(range.endContainer, range.endOffset);
    range.setEnd(range.endContainer, range.endOffset);
    this._inputEvent();
    this._onchange();
  }

  private _onchange() {
    const text = this._editorEl.innerText;
    if (!text || /^\n*$/.test(text)) {
      this._placeholderEl.style.display = "block";
    } else {
      this._placeholderEl.style.display = "none";
    }
    clearTimeout(this._changetimeout);
    this._changetimeout = setTimeout(() => {
      this._events["changes"].forEach((fn) => fn({ text: this._editorEl.innerText, html: this._editorEl.innerHTML }));
    }, 300);
  }

  private _inputEvent() {
    if (isEmptyElement(this._editorEl)) {
      this._editorEl.innerHTML = EMPTY_INPUT_CONTENT
    }
    const selection = getSelection();
    if (!selection?.anchorNode?.textContent) return this.closeUserSelector();
    const text = selection.anchorNode.textContent.slice(0, selection.anchorOffset);
    const trigger = this.options.trigger;
    const reg = new RegExp(`\\${trigger}[^\\s\\${trigger}]*$`);
    if (!reg.test(text)) return this.closeUserSelector();
    const t = reg.exec(text);
    if (!t) return this.closeUserSelector();
    this._inputSelection = selection;
    const range = getRangeAt(selection);
    if (!range) return;
    this._inputRange = range;
    if (this._inputRange.endContainer?.nodeName !== "#text") return this.closeUserSelector();
    const query = t[0]?.slice(1);
    this._queryStr = query;
    this.openUserSelector(query);
  }


  /**
   * 内容换行
   */
  private _wordWrap() {
    // 获取当前光标位置f
    const selection = getSelection();
    const range = selection?.getRangeAt(0);
    if (!range) return;
    // 判断是否有选中内容
    const bool = range.startOffset !== range.endOffset || range.startContainer !== range.endContainer;
    if (bool) {
      // 删除选中的内容
      range.deleteContents();
      // 获取开始位置所在的P标签
      const currentP = getCurrentP(range, "start");
      // 获取结束位置所在P标签
      const nextP = getCurrentP(range, "end");
      if (!currentP || !nextP) return;
      // 如果开始位置和结束位置不在同一个P标签中
      if (currentP !== nextP) {
        // 将光标移动到结束P标签的开头
        moveCursorToStart(range, nextP);
        return;
      }
    }
    // 获取当前所在的p标签
    let currentP = getCurrentP(range);
    if (!currentP) return;
    // 创建一个换行的P标签
    const p = createElement("p", { className: P_TAG_CLASS });
    // 如果光标所在标签为编辑器根标签，则直接在编辑器标签中插入换行
    if (!currentP) {
      p.innerHTML = "<br/>";
      // 在光标位置插入新创建的p标签
      range.insertNode(p);
      // 将光标设置到新创建的p标签中
      moveCursorToStart(range, p);
      return;
    }
    // 如果光标在当前行末尾
    if (isCursorAtEnd(range, currentP)) {
      p.innerHTML = "<br/>";
      // 将p标签插入到当前P标签之后
      currentP?.insertAdjacentElement("afterend", p);
      // 将光标设置到新创建的p标签中
      moveCursorToStart(range, p);
      return;
    }
    // 将光标设置到当前所在P标签中并选中光标之前的内容
    range.setStart(currentP, 0);
    range.setEnd(range.endContainer, range.endOffset);
    // // 获取光标选中的内容
    const selectedContent = range.extractContents();
    // // 将内容插入到新创建的p标签中
    p.appendChild(selectedContent);
    if (!p.innerText) {
      p.innerHTML = "<br/>";
    }
    if (!currentP.innerText) {
      currentP.innerHTML = "<br/>";
    }
    // 插入创建的p标签在原P标签之前
    currentP?.insertAdjacentElement("beforebegin", p);
    // 将光标移动到原P标签开头
    moveCursorToStart(range, currentP);
  }

  /**
   * 删除键
   * @param range 当前光标位置
   * @param currentP 当前光标所在的P标签
   * @returns
   */
  private _onDelete(range: Range, currentP: HTMLElement) {
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

  /**
   * 退格键
   * @param range 当前光标位置
   * @param currentP 当前光标所在的P标签
   * @returns
   */
  private _onBackspace(range: Range, currentP: HTMLElement) {
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

  /**
   * 删除内容
   * @param e 键盘事件
   * @returns
   */
  private _wordDelete(e: KeyboardEvent) {
    if (isEmptyElement(this._editorEl)) {
      this._editorEl.innerHTML = EMPTY_INPUT_CONTENT;
      this.focus();
      return true;
    }
    const selection = getSelection();
    if (!selection) return false;
    const range = selection.getRangeAt(0);
    if (!range) return false;
    // 如果开始光标和结束光标不一致，则删除选中内容
    if (range.startOffset !== range.endOffset || range.startContainer !== range.endContainer) {
      // 获取光标开始和结束的P标签
      const startP = getCurrentP(range, "start");
      const startContainer = range.startContainer;
      const startOffset = range.startOffset;
      const endP = getCurrentP(range, "end");
      if (!startP || !endP) return false;
      // 如果存在选中内容,删除选中内容
      range.deleteContents();
      // 如果开始和结束P标签不一致，将结束标签中的剩余内容移动到开始标签中，并删除开始到结束标签中的所有标签（包括结束标签）
      if (startP !== endP) {
        endP.childNodes.forEach(node => {
          startP.appendChild(node);
        })
        const startIndex = Array.from(this._editorEl.childNodes).indexOf(startP);
        const endIndex = Array.from(this._editorEl.childNodes).indexOf(endP);
        for (let i = endIndex; i > startIndex; i--) {
          this._editorEl.removeChild(this._editorEl.childNodes[i]);
        }
      }
      // 修正光标位置
      range.setStart(startContainer, startOffset);
      range.setEnd(startContainer, startOffset);
      return true;
    }
    // 获取当前光标所在的P标签
    let currentP = getCurrentP(range);
    if (!currentP) {
      this.focus(); // 恢复焦点
      return true;
    }
    if (e.code === "Backspace") {
      return this._onBackspace(range, currentP);
    }
    if (e.code === "Delete") {
      return this._onDelete(range, currentP);
    }
  }

  private _isCursorInEditor() {
    const selection = getSelection();
    if (!selection?.anchorNode) return false;
    const range = selection.getRangeAt(0);
    if (!range.commonAncestorContainer) return false;
    return range.commonAncestorContainer === this._editorEl || this._editorEl.contains(range.commonAncestorContainer);
  }

  /**
   * 创建用户选项元素
   * @param user 用户信息
   * @returns 用户列表中的选项元素
   */
  protected createUserElement(user: UserInfo): HTMLElement {
    if (user.element) return user.element;
    const element = createElement("div", { className: "hi-mention-user-item" });
    const { nameKey, avatarKey } = this.options;
    const [name = "", avatar = ""] = [user[nameKey], user[avatarKey]];
    const left = createElement("div", { className: "hi-mention-user-item-left" });
    if (avatar) {
      const img = createElement("img");
      img.src = avatar;
      left.appendChild(img);
    }
    const right = createElement("div", { className: "hi-mention-user-item-right" });
    right.innerText = name;
    element.appendChild(left);
    element.appendChild(right);
    return element;
  }

  setOptions(options: Partial<MentionOptions>): this {
    this.options = { ...this.options, ...options };
    const { trigger, placeholder, placeholderColor, mentionColor, users, idKey, nameKey, avatarKey, pingyinKey, media, usersWdith, usersHeight, } = options;
    if (placeholder) this._placeholderEl.innerText = placeholder;
    if (placeholderColor) this._placeholderEl.style.color = placeholderColor;

    return this;
  }

  getOptions(): MentionOptions {
    return { ...this.options };
  }

  /**
   * 事件监听器
   * @param key 监听的事件名称
   * @param fn 事件回调函数
   * @returns 返回当前实例
   */
  on<T extends keyof EventsType>(key: T, fn: EventsType[T]): this {
    switch (key) {
      case "blur":
        this._events["blurs"].push(fn as any);
        break;
      case "change":
        this._events["changes"].push(fn as any);
        break;
      case "focus":
        this._events["focuses"].push(fn as any);
        break;
      case "mention-user":
        this._events["mention-users"].push(fn as any);
        break;
      case "input":
        this._events["inputs"].push(fn as any);
        break;
      case "keydown":
        this._events["keydowns"].push(fn as any);
        break;
      case "keyup":
        this._events["keyups"].push(fn as any);
        break;
    }
    return this;
  }

  /**
   * 提及用户
   * @param user 用户信息
   * @returns
   */
  mentionUser(user: UserInfo): this {
    if (!this._inputRange) return this;
    const { nameKey, idKey } = this.options;
    // 创建一个span元素来表示用户
    const span = createElement("span", {
      className: "hi-mention-at-user",
      content: `@${user[nameKey]}`,
      style: {
        color: this.options.mentionColor,
        cursor: "pointer",
      },
    });
    span.setAttribute("data-user-id", user[idKey]);
    span.setAttribute("contenteditable", "false");
    const range = this._inputRange;
    // 设置光标选中@符号之后的内容
    range.setStart(range.endContainer, range.endOffset - (this._queryStr.length + 1));
    range.setEnd(range.endContainer, range.endOffset);
    // 删除选中的内容
    range.deleteContents();
    // 如果输入框没有内容，则直接完整替换内容
    if (isEmptyElement(this._editorEl)) {
      const div = createElement("div");
      const p = createElement("p", { className: P_TAG_CLASS });
      p.appendChild(span);
      div.appendChild(p);
      this._editorEl.innerHTML = div.innerHTML;
      this.focus(); // 将光标移动到末尾
    } else {
      // 否则将span元素插入到光标位置
      range.insertNode(span);
      const selection = this._inputSelection;
      if (selection) {
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    this._events["mention-users"].forEach((fn) => fn(user));
    this._onchange();
    this.closeUserSelector();
    return this;
  }

  /**
   * 清空输入框内容
   * @returns 返回当前实例
   */
  clear(): this {
    this._editorEl.innerHTML = EMPTY_INPUT_CONTENT;
    this._onchange();
    this.focus();
    return this;
  }

  /**
   * 在当前位置插入文本内容
   * @param text 文本内容
   * @returns 返回当前实例
   */
  insertText(text: string): this {
    if (!this._isCursorInEditor()) return this;
    const selection = getSelection();
    if (!selection) return this;
    const range = selection.getRangeAt(0);
    range.insertNode(createTextNode(text));
    this._onchange();
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    return this;
  }

  /**
   * 在当前位置插入html内容
   * @param html html内容
   * @returns 返回当前实例
   */
  insertHtml(html: Element): this {
    if (!this._isCursorInEditor()) return this;
    const selection = getSelection();
    if (!selection) return this;
    const range = selection.getRangeAt(0);
    html.setAttribute("contenteditable", "false");
    range.insertNode(html);
    this._onchange();
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    return this;
  }

  /**
   * 获取焦点
   * @returns 返回当前实例
   */
  focus(): this {
    // 获取焦点
    const selection = getSelection();
    if (!selection) return this;
    const range = document.createRange();
    range.selectNodeContents(this._editorEl);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    // 找到最后一行P标签
    let lastP = this._editorEl.lastElementChild;
    if (!lastP) {
      lastP = createElement("p", { className: P_TAG_CLASS, content: "<br/>" });
      this._editorEl.appendChild(lastP);
    }
    moveCursorToEnd(range, lastP);
    return this;
  }
  /**
   * 获取输入框内容
   * @returns 输入框内容
   */
  getData(): { text: string; html: string } {
    return {
      text: this._editorEl.innerText,
      html: this._editorEl.innerHTML,
    };
  }

  /**
   * 获取@提及的用户列表
   * @returns 用户列表
   */
  getMentions(): UserInfo[] {
    const nodes = this._editorEl.querySelectorAll(".hi-mention-at-user");
    const { users, idKey } = this.options;
    return Array.from(nodes)
      .map((node) => {
        const id = node.getAttribute("data-user-id");
        return users.find((user) => String(user[idKey]) === String(id));
      })
      .filter(Boolean) as UserInfo[];
  }

  protected initUserSelector() {
    this.userSelector = new UserSelector(this._rootEl, this.options);
    // 监听鼠标在用户列表中按下事件，防止鼠标点击用户列表时，触发编辑器失去焦点事件
    this.userSelector.element.onmousedown = () => setTimeout(() => clearTimeout(this._blurtimeout), 100);
    this.userSelector.onSelectUser((user) => {
      this.mentionUser(user);
    });
  }

  protected closeUserSelector() {
    this.userSelector?.close();
  }

  /**
 * 打开用户选择器
 * @param query 查询字符串
 * @returns
 */
  protected openUserSelector(query: string) {
    this.userSelector?.open(query);
  }

}

export default Mention;
