import { createElement } from "../../../utils";

export class Voucher {
  protected _rootEl: HTMLElement;
  protected _viewAreaEl = createElement("section", { className: "hi-voucher-view-area", style: { width: "100%", height: "100%" } });
  protected _voucherEl = createElement("div", {
    className: "hi-voucher-content", style: {
      backgroundColor: "#fff",
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
      boxShadow: "0 0 10px rgba(0,0,0,0.2)"
    }
  });

  protected _color = "#09f";

  protected _type: VoucherAttributeKeys = "voucher";

  protected _templateData: VoucherTemplate

  public get templateData() {
    return this._templateData;
  }
  public set templateData(templateData: VoucherTemplate) {
    this._templateData = templateData;
  }

  constructor(el: Element | string, templateData: VoucherTemplate) {
    if (!el) {
      throw new Error("el is not found");
    }
    if (typeof el === "string") {
      const e = document.querySelector(el);
      if (!e) {
        throw new Error("el is not found");
      }
      this._rootEl = e as HTMLElement;
    } else {
      this._rootEl = el as HTMLElement;
    }
    this._rootEl.classList.add("hi-voucher");
    this._rootEl.setAttribute("style", `position: relative; overflow: hidden; min-width:800px; min-height:600px`)
    this._templateData = templateData;

    this._renderVoucher()
  }

  protected _renderVoucher() {
    const { bg, width, height } = this.templateData
    if (bg) this._voucherEl.style.backgroundImage = `url(${bg})`;
    this._voucherEl.style.width = `${width}px`;
    this._voucherEl.style.height = `${height}px`;
  }


  render() {
    this._viewAreaEl.appendChild(this._voucherEl);
    this._rootEl.appendChild(this._viewAreaEl);
  }


  setOption(option: VoucherTemplate) {

  }


}
