import { createElement, createUUID } from "../../../../utils";

export default class TextBuild {
  element = createElement("span", { style: { position: "absolute", display: "flex", alignItems: "center", justifyContent: "center" } });

  private _key: string;
  private _name: string;
  private _content: string;
  private _fontFamily: string;
  private _fontSize: number;
  private _bold: boolean;
  private _x: number;
  private _y: number;
  private _letterSpacing: number;
  private _lineHeight: number;


  constructor({ key, name, content, fontFamily, fontSize, bold, x, y, letterSpacing, lineHeight }: VoucherTextTemplate) {
    this._key = key;
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
    return this.element;
  }

  public updateOptions({ name, content, fontFamily, fontSize, bold, x, y, letterSpacing, lineHeight }: VoucherTextTemplate) {
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

  public getOptions(): VoucherTextTemplate {
    return {
      key: this._key,
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