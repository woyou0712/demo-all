import { createDocumentFragment, createElement } from "./utils";

export interface UserSelectorOptions {
  users: UserInfo[];
  idKey: string;
  nameKey: string;
  avatarKey: string;
  pingyinKey: string;
  media: MediaType;
  usersWdith: string;
  usersHeight: string;
}

export const defaultUserSelectorOptions = (): UserSelectorOptions => ({
  users: [],
  idKey: "id",
  nameKey: "name",
  avatarKey: "avatar",
  pingyinKey: "pingyin",
  media: "PC",
  usersWdith: "200px",
  usersHeight: "200px",
});

interface UserSelectorPosition {
  H5: "bottom" | "top";
  PC: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    positionY: "top" | "bottom";
    positionX: "left" | "right";
  };
}

export default class UserSelector {
  private _rootEl: HTMLElement;
  element = createElement("div", { className: "hi-mention-user-selector" });

  options: UserSelectorOptions = defaultUserSelectorOptions();

  users: UserInfo[] = [];

  private _viewUsers: ViewUser[] = [];

  private onselecteds: ((user: UserInfo) => void)[] = [];

  constructor(el: Element | HTMLElement) {
    this._rootEl = el as HTMLElement;
    this._rootEl.appendChild(this.element);
  }

  setOptions(options: UserSelectorOptions) {
    this.options = { ...this.options, ...options };
    this.element.style.width = this.options.usersWdith;
    this.element.style.maxHeight = this.options.usersHeight;
    this.updateUsers(this.options.users);
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

  updateMedia(media: MediaType = this.options.media) {
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
    this.users = list;
    this._viewUsers = list.map((user) => {
      let element = user.element;
      if (!element) {
        element = this.createUserItem(user);
      }
      element.addEventListener("click", () => {
        this.onselecteds.forEach((fn) => fn(user));
      });
      return { ...user, element };
    });
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
  setPosition<T extends keyof UserSelectorPosition>(media: T, position: UserSelectorPosition[T]) {
    const element = this.element;
    if (media === "H5") {
      const positionY = position as UserSelectorPosition["H5"];
      if (positionY) {
        element.style[positionY] = "100%";
        if (positionY === "top") {
          element.style.bottom = "initial";
        } else {
          element.style.top = "initial";
        }
      }
    } else {
      const cursorPosition = position as UserSelectorPosition["PC"];
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

  open() {
    this.element.style.opacity = "1";
    this.element.style.transform = "scale(1) translateY(0)";
    this.element.style.pointerEvents = "auto";
  }

  close() {
    this.element.style.opacity = "0";
    this.element.style.transform = "scale(0.8) translateY(10%)";
    this.element.style.pointerEvents = "none";
  }

  onSelectUser(fn: (user: UserInfo) => void) {
    this.onselecteds.push(fn);
  }
}
