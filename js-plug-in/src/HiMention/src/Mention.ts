import { defaultMentionOptions, EDITOR_CLASS, NEW_LINE, PLACEHOLDER_TEXT, ROW_TAG_CLASS, TEXT_TAG_CLASS } from "./const";
import UserSelector from "./UserSelector";
import { createElement, createRowTag, createTextNode, fixEditorContent, insertElement, insertText, isEmptyElement } from "./utils/index";
import { OnEvents, MentionOptions, UserInfo, EventsType } from "./types";
import { getRangeAt, getSelection, moveRangeAtEditorEnd } from "./utils/range";
import wordWrap from "./utils/wordWrap";
import wordDelete from "./utils/wordDelete";

class Mention {
  private _rootEl: HTMLElement;
  private _editorBody = createElement("section", { className: "hi-mention-body" });
  private _editorEl = createElement("div", { className: EDITOR_CLASS });
  private _placeholderEl = createElement("div", { className: "hi-mention-placeholder" });
  private _events: OnEvents = {
    blurs: [],
    focuses: [],
    changes: [],
    inputs: [],
    keydowns: [],
    keyups: [],
    "mention-users": [],
  };

  private _changetimeout?: any;

  protected blurtimeout?: any;

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
    fixEditorContent(editor);
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
      const range = getRangeAt();
      // 没有选中内容，并且光标不在_editorEl内
      if (range?.collapsed && range.commonAncestorContainer.nodeName !== "#text") {
        e.preventDefault();
        this.focus();
      }
    }
  }

  private _onblur(e: FocusEvent) {
    this._events["blurs"].forEach((fn) => fn(e));
    clearTimeout(this.blurtimeout);
    this.blurtimeout = setTimeout(() => {
      this.closeUserSelector();
    }, 200);
  }

  private _onfocus(e: FocusEvent) {
    this._events["focuses"].forEach((fn) => fn(e));
  }

  private _onkeydown(e: KeyboardEvent) {
    let bool = this.onWordWrap(e);
    if (bool) {
      e.preventDefault();
      this._inputEvent();
      this._onchange(); // 不触发默认行为，需要手动触发change事件
      return;
    }
    bool = this.onWordDelete(e);
    if (bool) {
      e.preventDefault();
      this._inputEvent();
      this._onchange(); // 不触发默认行为，需要手动触发change事件
      return;
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
    const range = getRangeAt();
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
    const reg = new RegExp(`^${PLACEHOLDER_TEXT}*$`);
    if (!text || /^\n*$/.test(text) || reg.test(text)) {
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
    if (fixEditorContent(this._editorEl)) {
      this.focus();
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
    const range = getRangeAt(0, selection);
    if (!range) return;
    this._inputRange = range;
    if (this._inputRange.endContainer?.nodeName !== "#text") return this.closeUserSelector();
    const query = t[0]?.slice(1);
    this._queryStr = query;
    this.openUserSelector(query);
  }

  private _isCursorInEditor() {
    const range = getRangeAt();
    if (!range?.commonAncestorContainer) return false;
    return range?.commonAncestorContainer === this._editorEl || this._editorEl.contains(range.commonAncestorContainer);
  }

  protected wordDelete(e: KeyboardEvent) {
    return wordDelete(e, this._editorEl);
  }

  protected onWordDelete(e: KeyboardEvent) {
    if (["Backspace", "Delete"].includes(e.code)) {
      return this.wordDelete(e);
    }
    return false;
  }

  protected wordWrap() {
    return wordWrap();
  }

  protected onWordWrap(e: KeyboardEvent) {
    if (["Enter", "NumpadEnter"].includes(e.code)) {
      this.wordWrap();
      return true;
    }
    return false;
  }

  setOptions(options: Partial<MentionOptions>): this {
    this.options = { ...this.options, ...options };
    const { trigger, placeholder, placeholderColor, mentionColor, users, idKey, nameKey, avatarKey, pingyinKey, media, usersWdith, usersHeight } = options;
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
    const range = this._inputRange;
    // 将光标重新设置到输入框中
    range.collapse(false);
    this._inputSelection?.removeAllRanges();
    this._inputSelection?.addRange(range);

    // 设置光标选中@符号之后的内容
    range.setStart(range.endContainer, range.endOffset - (this._queryStr.length + 1));
    range.setEnd(range.endContainer, range.endOffset);
    // 删除选中的内容
    range.deleteContents();
    // 插入span元素
    insertElement(span, range);
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
    this._editorEl.innerHTML = "";
    fixEditorContent(this._editorEl);
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
    const range = getRangeAt(0, selection);
    if (!range) return this;
    insertText(text, range);
    this._onchange();
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
    return this;
  }

  /**
   * 在当前位置插入html内容
   * @param html html内容
   * @returns 返回当前实例
   */
  insertHtml(html: HTMLElement): this {
    if (!this._isCursorInEditor()) return this;
    const selection = getSelection();
    const range = getRangeAt(0, selection);
    if (!range) return this;
    insertElement(html, range);
    this._onchange();
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
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
    moveRangeAtEditorEnd(range, this._editorEl);
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
    this.userSelector.element.onmousedown = () => setTimeout(() => clearTimeout(this.blurtimeout), 100);
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
