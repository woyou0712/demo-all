import { createElement } from "../../../utils";
import { copyIcon, inputIcon, moveIcon, pointerIcon, tableIcon, textIcon } from "../../../static/icons"
import { HiButton, HiMessageBox } from "../../components";

export class Toolbar {
  private _rootEl: HTMLElement;
  private _bodyEl = createElement('section', { className: 'hi-voucher-toolbar' });

  private _selectEl = createElement('div', { className: 'hi-voucher-toolbar-item', content: pointerIcon });
  private _moveEl = createElement('div', { className: 'hi-voucher-toolbar-item', content: moveIcon });
  private _copyEl = createElement('div', { className: 'hi-voucher-toolbar-item', content: copyIcon });

  private _methodType: "select" | "move" | "copy" = 'select';
  get methodType() {
    return this._methodType;
  }

  set methodType(type: "select" | "move" | "copy") {
    this._methodType = type;
    this._selectEl.classList.remove('active')
    this._moveEl.classList.remove('active')
    this._copyEl.classList.remove('active')
    switch (type) {
      case "select":
        this._selectEl.classList.add('active')
        break;
      case "move":
        this._moveEl.classList.add('active')
        break;
      case "copy":
        this._copyEl.classList.add('active')
        break;
    }
    this.methodchanges.forEach((fn) => fn(type))
  }
  private methodchanges: ((type: "select" | "move" | "copy") => void)[] = []

  private _inputEl = createElement('div', { className: 'hi-voucher-toolbar-item', content: inputIcon });
  private _textEl = createElement('div', { className: 'hi-voucher-toolbar-item', content: textIcon });
  private _tableEl = createElement('div', { className: 'hi-voucher-toolbar-item', content: tableIcon });
  private createnodes: ((type: "input" | "table" | "text") => void)[] = []

  constructor(rootEl: HTMLElement) {
    this._rootEl = rootEl;
    this.render();
    this.onEvent();
  }


  private render() {
    switch (this.methodType) {
      case "select":
        this._selectEl.classList.add('active')
        break;
      case "move":
        this._moveEl.classList.add('active')
        break;
      case "copy":
        this._copyEl.classList.add('active')
        break;
    }


    this._bodyEl.appendChild(this._selectEl);
    this._bodyEl.appendChild(this._moveEl);
    this._bodyEl.appendChild(this._copyEl);
    const boundary1 = createElement("div", { className: 'hi-voucher-toolbar-boundary' });
    this._bodyEl.appendChild(boundary1);
    this._bodyEl.appendChild(this._inputEl);
    this._bodyEl.appendChild(this._textEl);
    this._bodyEl.appendChild(this._tableEl);
    const boundary2 = createElement("div", { className: 'hi-voucher-toolbar-boundary' });
    this._bodyEl.appendChild(boundary2);
    this._bodyEl.appendChild(new HiButton({ text: "返回", background: "transparent", color: "#999", border: "1px solid #ddd", height: 30 }).element);
    this._bodyEl.appendChild(new HiButton({ text: "保存", height: 30 }).element);

    this._rootEl.appendChild(this._bodyEl);
  }

  private onEvent() {
    this._selectEl.addEventListener('click', () => {
      this.methodType = 'select';
    })
    this._moveEl.addEventListener('click', () => {
      this.methodType = 'move';
    })
    this._copyEl.addEventListener('click', () => {
      this.methodType = 'copy';
    })

    this._inputEl.addEventListener('click', () => {
      new HiMessageBox({ title: "插入输入框？" }).confirm(() => {
        this.createnodes.forEach(fn => {
          fn("input")
        })
      })
    })
    this._textEl.addEventListener('click', () => {
      new HiMessageBox({ title: "插入文本框？" }).confirm(() => {
        this.createnodes.forEach(fn => {
          fn("text")
        })
      })
    })
    this._tableEl.addEventListener('click', () => {
      new HiMessageBox({ title: "插入表格？" }).confirm(() => {
        this.createnodes.forEach(fn => {
          fn("table")
        })
      })
    })
  }

  public onCreateNode(fn: (type: "input" | "table" | "text") => void) {
    this.createnodes.push(fn)
  }

  public onMethodChange(fn: (type: "select" | "move" | "copy") => void) {
    this.methodchanges.push(fn)
  }

}