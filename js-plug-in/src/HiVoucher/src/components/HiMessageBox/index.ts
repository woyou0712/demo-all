export interface HiMessageBoxProps {
  title?: string;
  message?: string;
  showClose?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const CLASS_NAME = "hi-voucher-message-box"

export class HiMessageBox {
  private element = document.createElement("section")

  private _titleEl = document.createElement("div")
  private _messageEl = document.createElement("div")

  private _buttonBody = document.createElement("div")
  private _confirmButtonEl = document.createElement("div")
  private _cancelButtonEl = document.createElement("div")

  private _title = "提示"
  private get title() {
    return this._title
  }
  private set title(value: string) {
    this._title = value
    this._titleEl.innerText = value
  }
  private _message = ""
  private get message() {
    return this._message
  }
  private set message(value: string) {
    this._message = value
    this._messageEl.innerText = value
  }
  private _showClose = true
  private get showClose() {
    return this._showClose
  }
  private set showClose(value: boolean) {
    this._showClose = value
  }
  private _confirmButtonText = "确定"
  private get confirmButtonText() {
    return this._confirmButtonText
  }
  private set confirmButtonText(value: string) {
    this._confirmButtonText = value
    this._confirmButtonEl.innerText = value
  }
  private _cancelButtonText = "取消"
  private get cancelButtonText() {
    return this._cancelButtonText
  }
  private set cancelButtonText(value: string) {
    this._cancelButtonText = value
    this._cancelButtonEl.innerText = value
  }

  private _confirmCallback: () => void = () => { }
  private _cancelCallback: () => void = () => { }


  constructor({ title = "提示", message = "", showClose = true, confirmButtonText = "确定", cancelButtonText = "取消", }: HiMessageBoxProps = {}) {
    this.title = title
    this.message = message
    this.showClose = showClose
    this.confirmButtonText = confirmButtonText
    this.cancelButtonText = cancelButtonText
    this.render()
    this.onEvent()
  }

  private render() {
    this.element.classList.add(CLASS_NAME)
    this._titleEl.classList.add(`${CLASS_NAME}-title`)
    this._messageEl.classList.add(`${CLASS_NAME}-message`)
    this._buttonBody.classList.add(`${CLASS_NAME}-button-body`)
    this._cancelButtonEl.classList.add(`${CLASS_NAME}-cancel-button`)
    this._confirmButtonEl.classList.add(`${CLASS_NAME}-confirm-button`)


    this.element.appendChild(this._titleEl)
    if (this.message) this.element.appendChild(this._messageEl)
    this.element.appendChild(this._buttonBody)
    this._buttonBody.appendChild(this._cancelButtonEl)
    this._buttonBody.appendChild(this._confirmButtonEl)

    this.show()
  }

  private onEvent() {
    this._confirmButtonEl.addEventListener("click", () => {
      this._confirmCallback()
      this.hide()
    })
    this._cancelButtonEl.addEventListener("click", () => {
      this._cancelCallback()
      this.hide()
    })
  }

  private show() {
    document.body.appendChild(this.element)
  }

  private hide() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
  }


  confirm(fn: () => void) {
    this._confirmCallback = fn
    return this
  }
  cancel(fn: () => void) {
    this._cancelCallback = fn
    return this
  }
}