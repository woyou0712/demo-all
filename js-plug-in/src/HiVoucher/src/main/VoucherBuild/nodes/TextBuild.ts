import { createElement, createUUID } from "../../../../utils";
import BaseNode from "./BaseNode";

export default class TextBuild extends BaseNode {
  element = createElement("div", { style: { position: "absolute", minWidth: "20px", minHeight: "16px", borderWidth: "1px", borderStyle: "solid", borderColor: "transparent" } });

  private _name: string;
  private _content: string;
  private _fontFamily: string;
  private _fontSize: number;
  private _bold: boolean;
  private _x: number;
  private _y: number;
  private _letterSpacing: number;
  private _lineHeight: number;


  constructor({ name, content, fontFamily, fontSize, bold, x, y, letterSpacing, lineHeight }: VoucherTextTemplate) {
    super();
    this._name = name;
    this._content = content;
    this._fontFamily = fontFamily;
    this._fontSize = fontSize;
    this._bold = bold;
    this._x = x;
    this._y = y;
    this._letterSpacing = letterSpacing;
    this._lineHeight = lineHeight;

    this.render();
  }


  private render() {
    this.element.innerHTML = this._content;
    this.element.style.fontFamily = this._fontFamily;
    this.element.style.fontSize = `${this._fontSize}px`;
    this.element.style.fontWeight = this._bold ? "bold" : "normal";
    this.element.style.letterSpacing = `${this._letterSpacing}px`;
    this.element.style.lineHeight = `${this._lineHeight}px`;
    this.element.style.left = `${this._x}px`;
    this.element.style.top = `${this._y}px`;
  }

  public update({ name, content, fontFamily, fontSize, bold, x, y, letterSpacing, lineHeight }: Partial<VoucherTextTemplate>) {
    if (name !== undefined) { this._name = name; }
    if (content !== undefined) { this._content = content; this.element.innerHTML = content; }
    if (fontFamily !== undefined) { this._fontFamily = fontFamily; this.element.style.fontFamily = fontFamily; }
    if (fontSize !== undefined) { this._fontSize = fontSize; this.element.style.fontSize = `${fontSize}px`; }
    if (bold !== undefined) { this._bold = bold; this.element.style.fontWeight = bold ? "bold" : "normal"; }
    if (x !== undefined) { this._x = x; this.element.style.left = `${x}px`; }
    if (y !== undefined) { this._y = y; this.element.style.top = `${y}px`; }
    if (letterSpacing !== undefined) { this._letterSpacing = letterSpacing; this.element.style.letterSpacing = `${letterSpacing}px`; }
    if (lineHeight !== undefined) { this._lineHeight = lineHeight; this.element.style.lineHeight = `${lineHeight}px`; }
  }

  public options(): VoucherTextTemplate {
    return {
      name: this._name,
      content: this._content,
      fontFamily: this._fontFamily,
      fontSize: this._fontSize,
      bold: this._bold,
      x: this._x,
      y: this._y,
      letterSpacing: this._letterSpacing,
      lineHeight: this._lineHeight
    }
  }
}