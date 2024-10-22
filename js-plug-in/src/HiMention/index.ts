interface UserInfo {
  id?: string | number;
  name?: string;
  avatar?: string;
  pingyin?: string;
  element?: HTMLElement;
  [key: string]: any;
}

type MediaType = "H5" | "PC";

interface MentionOption {
  idKey?: string; // id字段
  nameKey?: string; // 名称字段
  avatarKey?: string; // 头像字段
  pingyinKey?: string; // 拼音字段

  trigger?: string; // 触发字符
  media?: MediaType; // 媒体类型
  placeholder?: string;
  placeholderColor?: string;
  usersWdith?: string;
  usersHeight?: string;

  users?: UserInfo[];
}

interface MentionUser extends UserInfo {
  element: HTMLElement;
}

interface EventsType {
  input?: (e?: Event) => void;
  focus?: (e?: FocusEvent) => void;
  blur?: (e?: FocusEvent) => void;
  keydown?: (e?: KeyboardEvent) => void;
  keyup?: (e?: KeyboardEvent) => void;
  change?: (data?: { text: string; html: string }) => void;
  "mention-user"?: (user?: UserInfo) => void;
}

interface OnEvents {
  inputs: ((e?: Event) => void)[];
  focuses: ((e?: FocusEvent) => void)[];
  blurs: ((e?: FocusEvent) => void)[];
  keydowns: ((e?: KeyboardEvent) => void)[];
  keyups: ((e?: KeyboardEvent) => void)[];
  changes: ((data?: { text: string; html: string }) => void)[];
  "mention-users": ((user?: UserInfo) => void)[];
}

class Mention {
  private _rootEl: HTMLElement;
  private _editorBody = document.createElement("section");
  private _editorEl = document.createElement("div");
  private _userList = document.createElement("div");
  private _placeholderEl = document.createElement("div");
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
    body.classList.add("hi-mention-body");

    const editor = this._editorEl;
    editor.classList.add("hi-mention-editor");
    editor.setAttribute("contenteditable", "true");

    const placeholderEl = this._placeholderEl;
    placeholderEl.classList.add("hi-mention-placeholder");
    placeholderEl.innerText = this._placeholder;
    placeholderEl.style.color = this._placeholderColor;
    body.appendChild(editor);
    body.appendChild(placeholderEl);
    this._rootEl.appendChild(body);

    this.updateMedia(this._media);
  }

  private _initEvent() {
    this._editorEl.onblur = (e) => this._onblur(e);
    this._editorEl.onfocus = (e) => this._onfocus(e);
    this._editorEl.onkeydown = (e) => this._onkeydown(e);
    this._editorEl.onkeyup = (e) => this._onkeyup(e);
    this._editorEl.oninput = (e) => this._oninput(e);
    // 监听鼠标在用户列表中按下事件，防止鼠标点击用户列表时，触发编辑器失去焦点事件
    this._userList.onmousedown = () => setTimeout(() => clearTimeout(this._blurtimeout), 100);
  }

  private _getSelection() {
    return window.getSelection();
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
    if (text) {
      this._placeholderEl.style.display = "none";
    } else {
      this._placeholderEl.style.display = "block";
    }
    clearTimeout(this._changetimeout);
    this._changetimeout = setTimeout(() => {
      this._events["changes"].forEach((fn) => fn({ text: this._editorEl.innerText, html: this._editorEl.innerHTML }));
    }, 300);
  }

  private _inputEvent() {
    const selection = this._getSelection();
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

  private _getCursorPosition(): { left: number; top: number; right: number; bottom: number; positionY: "top" | "bottom"; positionX: "left" | "right" } | null {
    const selection = this._getSelection();
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
    const selection = this._getSelection();
    if (!selection) return null;
    const { top, bottom } = this._rootEl.getBoundingClientRect();
    const positionY = window.innerHeight - bottom > top ? "top" : "bottom";
    return positionY;
  }

  private _isCursorInEditor() {
    const selection = this._getSelection();
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
    const element = document.createElement("div");
    element.classList.add("hi-mention-user-item");
    const [name = "", avatar = ""] = [user[this._nameKey], user[this._avatarKey]];
    const left = document.createElement("div");
    left.classList.add("hi-mention-user-item-left");
    if (avatar) {
      const img = document.createElement("img");
      img.src = avatar;
      left.appendChild(img);
    }
    const right = document.createElement("div");
    right.classList.add("hi-mention-user-item-right");
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
    const span = document.createElement("span");
    span.setAttribute("data-id", user[this._idKey]);
    span.setAttribute("contenteditable", "false");
    span.setAttribute("style", `color:${this._mentionColor}; cursor: pointer;`);
    span.classList.add("hi-mention-at-user");

    span.innerHTML = `&nbsp;@${user[this._nameKey]}&nbsp;`;
    // 设置光标选中范围
    this._inputRange.setStart(this._inputRange.endContainer, this._inputRange.endOffset - (this._queryStr.length + 1));
    this._inputRange.setEnd(this._inputRange.endContainer, this._inputRange.endOffset);
    // 删除选中范围的内容
    this._inputRange.deleteContents();
    // 将span元素插入到光标位置
    this._inputRange.insertNode(span);

    this._events["mention-users"].forEach((fn) => fn(user));
    this._onchange();
    this._hideUserList();
    const selection = this._inputSelection;
    if (!selection) return this;
    this._inputRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(this._inputRange);
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
      users.className = "hi-mention-user-list h5";
      users.style.left = "0";
      this._rootEl.appendChild(users);
      this._rootEl.style.position = "relative";
    } else {
      users.className = "hi-mention-user-list";
      this._editorBody.appendChild(users);
    }
    return this;
  }

  /**
   * 清空输入框内容
   * @returns 返回当前实例
   */
  clear(): this {
    this._editorEl.innerHTML = "";
    this._events["changes"].forEach((fn) => fn({ text: "", html: "" }));
    return this;
  }

  /**
   * 在当前位置插入文本内容
   * @param text 文本内容
   * @returns 返回当前实例
   */
  insertText(text: string): this {
    if (!this._isCursorInEditor()) return this;
    const selection = this._getSelection();
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
    const selection = this._getSelection();
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
    // 将光标移动到编辑器末尾
    this._editorEl.focus();
    const range = document.createRange();
    range.selectNodeContents(this._editorEl);
    range.collapse(false);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

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
