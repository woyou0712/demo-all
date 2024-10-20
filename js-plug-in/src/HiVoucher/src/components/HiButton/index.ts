import { createElement } from "@/HiVoucher/utils";

export interface HiButtonProps {
  text?: string;
  width?: number;
  height?: number;
  background?: string;
  color?: string;
  border?: string;
  borderRadius?: number;
  fontSize?: number;
  bold?: boolean;
  padding?: string;
  onClick?: () => void;
}

const CLASS_NAME = "hi-voucher-button";

export class HiButton {
  public element: HTMLButtonElement = createElement("button", {
    className: CLASS_NAME, style: { cursor: "pointer" }
  }) as HTMLButtonElement;

  private _text: string = "";
  public get text() {
    return this._text;
  }
  public set text(value: string) {
    this._text = value;
    this.element.innerText = value;
  }

  private _width = 0;
  public get width() {
    return this._width;
  }
  public set width(value: number) {
    this._width = value;
    if (!value) this.element.style.width = "auto";
    else this.element.style.width = `${value}px`;
  }

  private _height = 32;
  public get height() {
    return this._height;
  }
  public set height(value: number) {
    this._height = value;
    if (!value) this.element.style.height = "auto";
    else this.element.style.height = `${value}px`;
  }

  private _background = "transparent";
  public get background() {
    return this._background;
  }

  public set background(value: string) {
    this._background = value;
    this.element.style.background = value;
  }

  private _color: string = "#333";
  public get color(): string {
    return this._color;
  }
  public set color(value: string) {
    this._color = value;
    if (!value) this.element.style.color = "#000";
    else this.element.style.color = value;
  }

  private _border: string = "";

  public get border() {
    return this._border;
  }

  public set border(value: string) {
    this._border = value;
    if (!value) this.element.style.border = "none";
    else this.element.style.border = value;
  }

  private _borderRadius = 0;

  public get borderRadius() {
    return this._borderRadius;
  }

  public set borderRadius(value: number) {
    this._borderRadius = value;
    if (!value) this.element.style.borderRadius = "0px";
    else this.element.style.borderRadius = `${value}px`;
  }

  private _fontSize = 14;

  public get fontSize() {
    return this._fontSize;
  }

  public set fontSize(value: number) {
    this._fontSize = value;
    if (!value) this.element.style.fontSize = "14px";
    else this.element.style.fontSize = `${value}px`;
  }

  private _bold = false;

  public get bold() {
    return this._bold;
  }

  public set bold(value: boolean) {
    this._bold = value;
    if (!value) this.element.style.fontWeight = "normal";
    else this.element.style.fontWeight = "bold";
  }

  private _padding = "0 20px";

  public get padding() {
    return this._padding;
  }

  public set padding(value: string) {
    this._padding = value;
    if (!value) this.element.style.padding = "0 20px";
    else this.element.style.padding = value;
  }

  private clicks: (() => void)[] = [];

  constructor({ text = "Button", width = 0, height = 32, background = "#09f", color = "#fff", border = "1px solid #09f", borderRadius = 4, fontSize = 14, bold = false, padding = "0 20px", onClick }: HiButtonProps = {}) {
    this.text = text;
    this.width = width;
    this.height = height;
    this.background = background;
    this.color = color;
    this.border = border || "";
    this.borderRadius = borderRadius;
    this.fontSize = fontSize;
    this.bold = bold;
    this.padding = padding;

    if (onClick) this.clicks.push(onClick);
    this.onEvent();
  }

  private onEvent() {
    this.element.onclick = () => {
      this.clicks.forEach((fn) => fn());
    };
  }

  public onClick(fn: () => void) {
    this.clicks.push(fn);
  }
}
