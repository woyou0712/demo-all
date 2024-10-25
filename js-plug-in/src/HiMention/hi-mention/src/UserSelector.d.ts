import { UserInfo, UserSelectorOptions } from "./types";
export default class UserSelector {
    private _rootEl;
    element: HTMLDivElement;
    private _status;
    get status(): "open" | "close";
    set status(status: "open" | "close");
    options: UserSelectorOptions;
    private _viewUsers;
    private onselecteds;
    constructor(el: Element | HTMLElement, options: Partial<UserSelectorOptions>);
    private initUsersEl;
    /**
     * 创建用户选项元素
     * @param user 用户信息
     * @returns 用户列表中的选项元素
     */
    protected createUserItem(user: UserInfo): HTMLElement;
    protected getCursorPosition(): {
        left: number;
        top: number;
        right: number;
        bottom: number;
        positionY: "top" | "bottom";
        positionX: "left" | "right";
    } | null;
    protected getH5Position(): "top" | "bottom";
    /**
     * 根据查询字符串显示用户列表项
     * @param query
     * @returns
     */
    protected viewUserItems(query: string): boolean;
    /**
     * 设置用户选择器的位置
     */
    protected setPosition(): void;
    setOptions(options: Partial<UserSelectorOptions>): this;
    open(query: string): void;
    close(): void;
    onSelectUser(fn: (user: UserInfo) => void): void;
}
