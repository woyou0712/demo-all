import { defaultUserSelectorOptions } from "./const";
import { createDocumentFragment, createElement } from "./utils";


export default class UserSelector {
  private _rootEl: HTMLElement;
  element = createElement("div", { className: "hi-mention-user-selector" });

  private _status: "open" | "close" = "close";

  get status() {
    return this._status;
  }

  set status(status: "open" | "close") {
    this._status = status;
    if (status === "open") {
      this.element.classList.add("open");
    } else {
      this.element.classList.remove("open");
    }
  }

  options: UserSelectorOptions = defaultUserSelectorOptions();


  private _viewUsers: ViewUser[] = [];

  private onselecteds: ((user: UserInfo) => void)[] = [];

  constructor(el: Element | HTMLElement, options: Partial<UserSelectorOptions>) {
    this._rootEl = el as HTMLElement;
    this.options = Object.assign(this.options, options);
    this.initUsersEl()
    this.setMedia()
    this._rootEl.appendChild(this.element);
  }

  private initUsersEl() {
    this._viewUsers = this.options.users.map((user) => {
      let element = user.element;
      if (!element) {
        element = this.createUserItem(user);
      }
      element.addEventListener("click", () => {
        this.onselecteds.forEach((fn) => fn(user));
      });
      return { ...user, element };
    });
  }

  /**
   * 创建用户选项元素
   * @param user 用户信息
   * @returns 用户列表中的选项元素
   */
  protected createUserItem(user: UserInfo): HTMLElement {
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

  protected getCursorPosition(): { left: number; top: number; right: number; bottom: number; positionY: "top" | "bottom"; positionX: "left" | "right" } | null {
    const selection = getSelection();
    if (!selection) return null;
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const { left, top, right, bottom } = this._rootEl.getBoundingClientRect();
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

  protected getH5Position(): "top" | "bottom" {
    const { top, bottom } = this._rootEl.getBoundingClientRect();
    const positionY = window.innerHeight - bottom < top ? "bottom" : "top";
    return positionY;
  }


  setMedia(media: MediaType = this.options.media) {
    this.options.media = media;
    const element = this.element;
    if (media === "H5") {
      element.classList.add("h5");
      element.style.left = "0";
    } else {
      element.classList.remove("h5");
    }
  }



  /**
   * 更新用户列表
   * @param list 用户列表
   * @returns 返回当前实例
   */
  updateUsers(list: UserInfo[]): this {
    this.options.users = list;
    this.initUsersEl();
    return this;
  }
  /**
   * 根据查询字符串显示用户列表项
   * @param query
   * @returns
   */
  viewUserItems(query: string) {
    const element = this.element;
    element.innerHTML = "";
    const box = createDocumentFragment();
    const { idKey, nameKey, avatarKey, pingyinKey } = this.options;
    this._viewUsers.forEach((user) => {
      const [id = 0, name = "", pingyin = ""] = [user[idKey], user[nameKey], user[avatarKey], user[pingyinKey]];
      const text = `${id}${name}${pingyin}`;
      if (!query) box.appendChild(user.element);
      else if (text.includes(query)) box.appendChild(user.element);
    });
    // 如果没有用户，则不显示
    if (!box.hasChildNodes()) {
      this.close();
      return false;
    }
    element.appendChild(box);
    return true;
  }

  /**
   * 设置用户选择器的位置
   */
  setPosition() {
    const element = this.element;
    if (this.options.media === "H5") {
      const positionY = this.getH5Position()
      if (positionY) {
        element.style[positionY] = "100%";
        if (positionY === "top") {
          element.style.bottom = "initial";
        } else {
          element.style.top = "initial";
        }
      }
    } else {
      const cursorPosition = this.getCursorPosition()
      if (cursorPosition) {
        element.style[cursorPosition.positionY] = `${cursorPosition[cursorPosition.positionY]}px`;
        element.style[cursorPosition.positionX] = `${cursorPosition[cursorPosition.positionX]}px`;
        if (cursorPosition.positionY === "bottom") element.style.top = "initial";
        if (cursorPosition.positionY === "top") element.style.bottom = "initial";
        if (cursorPosition.positionX === "right") element.style.left = "initial";
        if (cursorPosition.positionX === "left") element.style.right = "initial";
      }
    }
  }

  open(query: string) {
    const bool = this.viewUserItems(query);
    if (!bool) return
    this.setPosition();
    if (this.status === "open") return
    this.status = "open";
  }

  close() {
    if (this.status === "close") return
    this.status = "close";
  }

  onSelectUser(fn: (user: UserInfo) => void) {
    this.onselecteds.push(fn);
  }
}
