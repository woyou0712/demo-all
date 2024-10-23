import { EDITOR_CLASS, EMPTY_INPUT, P_TAG_CLASS } from "./const";
import { createElement, createEmptyNode, createTextNode, getCurrentP, getSelection, isCursorAtEnd, isEmptyElement } from "./utils";



class Mention {
  private _rootEl: HTMLElement;
  private _editorBody = createElement("section", { className: "hi-mention-body" });
  private _editorEl = createElement("div", { className: EDITOR_CLASS });
  private _userList = createElement("div", { className: "hi-mention-user-list" });
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

  private _idKey = "id";
  private _nameKey = "name";
  private _avatarKey = "avatar";
  private _pingyinKey = "pingyin";
  private _placeholder = "请输入";
  private _placeholderColor = "#aaa";

  private _trigger = "@";
  private _media: MediaType = "PC";

  private _usersWdith = "200px";
  private _usersHeight = "200px";
  private _mentionColor = "#0080FF";
  private _mentionUsers: MentionUser[] = [];
  private _users: UserInfo[] = [];

  private _queryStr = "";

  constructor(el: Element | HTMLElement | string, option: MentionOption = {}) {
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
    this._initOption(option);
    this._initElement();
    this._initEvent();
  }

  private _initOption(option: MentionOption) {
    const { users = [], placeholder = "请输入", placeholderColor = "#aaa", usersWdith = "200px", usersHeight = "200px", idKey = "id", nameKey = "name", avatarKey = "avatar", pingyinKey = "pingyin", trigger = "@", media = "PC" } = option;
    this._placeholder = placeholder;
    this._placeholderColor = placeholderColor;
    this._usersWdith = usersWdith;
    this._usersHeight = usersHeight;
    this._idKey = idKey;
    this._nameKey = nameKey;
    this._avatarKey = avatarKey;
    this._pingyinKey = pingyinKey;
    this._trigger = trigger;
    this._media = media;

    this.updateUsers(users);
  }

  private _initElement() {
    this._rootEl.setAttribute("style", `--hi-mention-user-list-width:${this._usersWdith};--hi-mention-user-list-height:${this._usersHeight};`);
    const body = this._editorBody;

    const editor = this._editorEl;
    editor.setAttribute("contenteditable", "true");
    editor.innerHTML = EMPTY_INPUT;

    const placeholderEl = this._placeholderEl;
    placeholderEl.innerText = this._placeholder;
    placeholderEl.style.color = this._placeholderColor;
    body.appendChild(editor);
    body.appendChild(placeholderEl);
    this._rootEl.appendChild(body);

    this.updateMedia(this._media);
  }

  private _initEvent() {
    this._editorEl.onclick = (e) => this._onclick(e);
    this._editorEl.onblur = (e) => this._onblur(e);
    this._editorEl.onfocus = (e) => this._onfocus(e);
    this._editorEl.onkeydown = (e) => this._onkeydown(e);
    this._editorEl.onkeyup = (e) => this._onkeyup(e);
    this._editorEl.oninput = (e) => this._oninput(e);
    // 监听鼠标在用户列表中按下事件，防止鼠标点击用户列表时，触发编辑器失去焦点事件
    this._userList.onmousedown = () => setTimeout(() => clearTimeout(this._blurtimeout), 100);
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
      this._hideUserList();
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
    } else if (["Backspace", "Delete"].includes(e.code)) {
      const bool = this._wordDelete(e);
      console.log(bool);
      if (bool) {
        e.preventDefault();
        this._onchange(); // 不触发默认行为，需要手动触发change事件
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
    const selection = getSelection();
    if (!selection?.anchorNode?.textContent) return this._hideUserList();
    const text = selection.anchorNode.textContent.slice(0, selection.anchorOffset);
    const reg = new RegExp(`\\${this._trigger}[^\\s\\${this._trigger}]*$`);
    if (!reg.test(text)) return this._hideUserList();
    const t = reg.exec(text);
    if (!t) return this._hideUserList();
    this._inputSelection = selection;
    this._inputRange = selection.getRangeAt(0);
    if (this._inputRange.endContainer?.nodeName !== "#text") return this._hideUserList();
    const query = t[0]?.slice(1);
    this._queryStr = query;
    this.openUserList(query);
  }

  private _hideUserList() {
    this._userList.style.display = "none";
  }

  /**
 * 内容换行
 */
  private _wordWrap() {
    // 获取当前光标位置f
    const selection = getSelection();
    const range = selection?.getRangeAt(0);
    if (!range) return;
    // 删除选中的内容
    range.deleteContents();
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
      range.setStart(p, 0);
      range.setEnd(p, 0);
      return;
    }
    // 如果光标在当前行末尾
    if (isCursorAtEnd(range, currentP)) {
      p.innerHTML = "<br/>";
      // 将p标签插入到当前P标签之后
      currentP?.insertAdjacentElement("afterend", p);
      // 将光标设置到新创建的p标签中
      range.setStart(p, 0);
      range.setEnd(p, 0);
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
    range.setStart(currentP, 0);
    range.setEnd(currentP, 0);
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

    // 如果光标在末尾，并且是最后一个P标签，不执行操作
    const isEnd = isCursorAtEnd(range, currentP);
    // 如果光标在当前P标签的末尾，并且是最后一个P标签，不执行操作
    if (isEnd && !currentP.nextElementSibling) {
      return true;
    }
    // 如果光标在当前P标签的末尾，并且不是最后一个P标签，将下一个P标签的内容写入当前P标签中，并删除下一个P标签
    if (isEnd && currentP.nextElementSibling?.className === P_TAG_CLASS) {
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
      range.setStart(currentP, currentP.childNodes.length);
      range.setEnd(currentP, currentP.childNodes.length);
      // 将下一个P标签的内容添加到当前P标签中
      currentP.appendChild(selectedContent);
      nextP.remove();
      return true;
    }

    return false;
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
    if (range.startOffset === 0 && !currentP.previousElementSibling) {
      return true;
    }
    // 获取当前光标所在P标签的上一个兄弟节点
    const previousP = currentP.previousElementSibling as HTMLElement;
    // 如果当前节点是空标签
    if (isEmptyElement(currentP)) {
      // 如果有上一个兄弟节点，并且上一个节点是P标签
      if (previousP && previousP.className === P_TAG_CLASS) {
        currentP.remove();
        range.setStart(previousP, previousP.childNodes.length);
        range.setEnd(previousP, previousP.childNodes.length);
      }
      return true;
    }
    // 如果光标在当前行开头，并且有上一个兄弟节点，并且上一个节点是P标签
    if (range.startOffset === 0 && previousP && previousP.className === P_TAG_CLASS) {
      // 选中当前p标签的所有内容
      range.setStart(currentP, 0);
      range.setEnd(currentP, currentP.childNodes.length);
      // 获取选中内容
      const selectedContent = range.extractContents();
      let endIndex = previousP.childNodes.length
      if (isEmptyElement(previousP)) {
        endIndex = 0
        previousP.innerHTML = ""
      }
      // 将光标移动到上一个P标签的末尾
      range.setStart(previousP, endIndex);
      range.setEnd(previousP, endIndex);
      // 将当前P标签的内容添加到上一个P标签中
      previousP.appendChild(selectedContent);
      currentP.remove();
      return true
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
        currentP.removeChild(lastChild)
        lastIndex--
        // 继续向上查找，找到有内容的节点为止
        for (; lastIndex >= 0; lastIndex--) {
          const node = currentP.childNodes[lastIndex] as HTMLElement;
          if (node.nodeName === "#text" && !node.textContent?.length) {
            currentP.removeChild(node)
            continue
          }
          lastChild = node;
          break;
        }
      }
      currentP.removeChild(lastChild)
      return true
    }
    // 选中光标之后的内容
    range.setStart(currentP, 0);
    range.setEnd(range.endContainer, range.endOffset);
    // 获取选中内容，不从文本中删除
    const selectedContent = range.extractContents();
    // 删除末尾的空标签
    while (selectedContent.lastChild && selectedContent.lastChild.nodeName === "#text" && !selectedContent.lastChild.textContent) {
      selectedContent.removeChild(selectedContent.lastChild);
    }
    // 如果已经没有内容了，不做操作
    if (!selectedContent.lastChild) return true
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
    if (!isContent) return true;
    range.insertNode(selectedContent);
    // 将光标移动到P标签开头
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
      this._editorEl.innerHTML = EMPTY_INPUT;
      this.focus();
      return true;
    }
    const selection = getSelection();
    if (!selection) return false;
    const range = selection.getRangeAt(0);
    if (!range) return false;
    // 获取选中内容
    const selectedContent = range.extractContents();
    // 如果存在选中内容,删除选中内容
    if (selectedContent.childNodes.length) {
      range.deleteContents();
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


  private _getCursorPosition(): { left: number; top: number; right: number; bottom: number; positionY: "top" | "bottom"; positionX: "left" | "right" } | null {
    const selection = getSelection();
    if (!selection) return null;
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const { left, top, right, bottom } = this._editorBody.getBoundingClientRect();
      // 根据光标在屏幕上的位置
      const positionY = window.innerHeight - bottom > top ? "top" : "bottom";
      const positionX = right - rect.right > rect.left - left ? "left" : "right";
      // 返回坐标
      const l = rect.left - left;
      const t = rect.top - top;
      const r = right - rect.right;
      const b = bottom - rect.bottom;
      return { left: l, top: t + 22, bottom: b + 22, right: r, positionY, positionX };
    }
    return null;
  }

  private _getH5Position(): "top" | "bottom" | null {
    const selection = getSelection();
    if (!selection) return null;
    const { top, bottom } = this._rootEl.getBoundingClientRect();
    const positionY = window.innerHeight - bottom > top ? "top" : "bottom";
    return positionY;
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
    const [name = "", avatar = ""] = [user[this._nameKey], user[this._avatarKey]];
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

  /**
   * 打开用户列表
   * @param query 查询字符串
   * @returns
   */
  protected openUserList(query: string) {
    const userList = this._userList;
    userList.innerHTML = "";
    const box = document.createDocumentFragment();
    this._mentionUsers.forEach((user) => {
      const [id = 0, name = "", pingyin = ""] = [user[this._idKey], user[this._nameKey], user[this._avatarKey], user[this._pingyinKey]];
      const text = `${id}${name}${pingyin}`;
      if (!query) box.appendChild(user.element);
      else if (text.includes(query)) box.appendChild(user.element);
    });
    if (!box.hasChildNodes()) return this._hideUserList();
    userList.appendChild(box);
    if (this._media === "H5") {
      const positionY = this._getH5Position();
      if (positionY) {
        userList.style[positionY] = "100%";
        if (positionY === "top") {
          userList.style.bottom = "initial";
        } else {
          userList.style.top = "initial";
        }
      }
    } else {
      const cursorPosition = this._getCursorPosition();
      if (cursorPosition) {
        userList.style[cursorPosition.positionY] = `${cursorPosition[cursorPosition.positionY]}px`;
        userList.style[cursorPosition.positionX] = `${cursorPosition[cursorPosition.positionX]}px`;
        if (cursorPosition.positionY === "bottom") userList.style.top = "initial";
        if (cursorPosition.positionY === "top") userList.style.bottom = "initial";
        if (cursorPosition.positionX === "right") userList.style.left = "initial";
        if (cursorPosition.positionX === "left") userList.style.right = "initial";
      }
    }
    this._userList.style.display = "block";
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

    // 创建一个span元素来表示用户
    const span = createElement("span", {
      className: "hi-mention-at-user",
      content: `@${user[this._nameKey]}`,
      style: {
        color: this._mentionColor,
        cursor: "pointer",
      },
    });
    span.setAttribute("data-id", user[this._idKey]);
    span.setAttribute("contenteditable", "false");
    const range = this._inputRange
    // 设置光标选中@符号之后的内容
    range.setStart(range.endContainer, range.endOffset - (this._queryStr.length + 1));
    range.setEnd(range.endContainer, range.endOffset);
    // 删除选中的内容
    range.deleteContents();
    // 如果输入框没有内容，则直接完整替换内容
    if (isEmptyElement(this._editorEl)) {
      const div = createElement("div")
      const p = createElement("p", { className: P_TAG_CLASS })
      p.appendChild(span)
      div.appendChild(p)
      this._editorEl.innerHTML = div.innerHTML
      this.focus()
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
    this._hideUserList();
    return this;
  }

  /**
   * 更新用户列表
   * @param list 用户列表
   * @returns 返回当前实例
   */
  updateUsers(list: UserInfo[]): this {
    this._users = list;
    this._mentionUsers = list.map((user) => {
      let element = user.element;
      if (!element) {
        element = this.createUserElement(user);
      }
      element.addEventListener("click", () => {
        this.mentionUser(user);
      });
      return { ...user, element };
    });
    return this;
  }

  /**
   * 跟新媒体类型
   * @param type 媒体类型
   * @returns 返回当前实例
   */
  updateMedia(type: MediaType): this {
    this._media = type;
    const users = this._userList;
    if (users.parentNode) users.parentNode.removeChild(users);
    if (this._media === "H5") {
      users.classList.add("h5");
      users.style.left = "0";
      this._rootEl.appendChild(users);
      this._rootEl.style.position = "relative";
    } else {
      users.classList.remove("h5");
      this._editorBody.appendChild(users);
    }
    return this;
  }

  /**
   * 清空输入框内容
   * @returns 返回当前实例
   */
  clear(): this {
    this._editorEl.innerHTML = EMPTY_INPUT;
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
    range.insertNode(document.createTextNode(text));
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
    let lastP = this._editorEl.lastElementChild
    if (!lastP) {
      lastP = createElement('p', { className: P_TAG_CLASS, content: "<br/>" });
      this._editorEl.appendChild(lastP);
    }
    range.setStart(lastP, lastP.childNodes.length);
    range.setEnd(lastP, lastP.childNodes.length);
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
    return Array.from(nodes)
      .map((node) => {
        const id = node.getAttribute("data-id");
        return this._users.find((user) => String(user[this._idKey]) === String(id));
      })
      .filter(Boolean) as UserInfo[];
  }
}

export default Mention;
