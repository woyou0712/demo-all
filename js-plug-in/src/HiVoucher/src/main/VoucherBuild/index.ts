import { createElement, voucherOptionDefault } from "../../../utils";
import Attribute from "../Attribute";
import { Toolbar } from "../Toolbar";
import { Voucher } from "../Voucher";
import TextBuild from "./nodes/TextBuild";

export class VoucherBuild extends Voucher {

  private _attribute?: Attribute;
  private _toolbar?: Toolbar

  private moveNode?: HTMLElement;
  private moveNodeStartPos: { top: number, left: number } = { top: 0, left: 0 };
  private moveNodeParentStartPos: { top: number, left: number } = { top: 0, left: 0 };

  get template() {
    return this._template
  }
  set template(data: VoucherTemplate) {
    this._template = data;
    this._renderVoucher();
    this._renderContent();
  }

  private _selectType: "input" | "table" | "text" | "voucher" = "voucher";

  get selectType() {
    return this._selectType
  }

  set selectType(type: "input" | "table" | "text" | "voucher") {
    this._selectType = type;
  }

  private _selectNode: HTMLElement;

  get selectNode() {
    return this._selectNode
  }

  set selectNode(node: HTMLElement) {
    this._selectNode = node;
    node.style.border = "1px solid red";
  }

  constructor(el: Element | string, data: VoucherTemplate = voucherOptionDefault()) {
    super(el, data);
    this._selectNode = this._voucherEl;
    this._voucherEl.style.border = "1px solid red";
    this.createAttribute();
    this.createToolbar();
    this.onMoveNode()
  }

  protected createNode(type: "input" | "table" | "text") {

  }

  protected createToolbar() {
    this._toolbar = new Toolbar(this._rootEl);
    this._toolbar.onCreateNode(type => {
      console.log("创建节点", type)
    })
  }



  protected createAttribute() {
    this._attribute = new Attribute(this._rootEl);
    this._attribute.onChange((type, key, value) => {
      if (type === "voucher") {
        if (key === "bg") {
          this.template = Object.assign({}, this.template, { bg: value ? (value instanceof File ? URL.createObjectURL(value) : value) : '' });
          return
        }
        this.template = Object.assign({}, this.template, { [key]: value });
      }
    })
  }

  protected _renderTexts(texts: VoucherTextTemplate[]) {
    texts.forEach(text => {
      const textEl = new TextBuild(text)
      
    })
  }

  protected _renderContent() {
    Object.keys(this.template.content).forEach(key => {
      if (key === "texts" && this.template.content[key]) {
        const texts = this.template.content[key];

      } else if (key === "inputs" && this.template.content[key]) {
        const inputs = this.template.content[key];
      } else if (key === "tables" && this.template.content[key]) {
        const tables = this.template.content[key];
      }
    })
  }


  /**
   * 移动节点
   */
  private onMoveNode() {
    this._voucherEl.onmousedown = (e) => {
      if (this._toolbar?.methodType !== "move") return
      e.stopPropagation();
      this.moveNode = this._voucherEl;
      this.moveNode.style.border = "1px dashed #000";
      // 获取元素相对于视口的位置
      var rect = this.moveNode.getBoundingClientRect();
      // 获取相对于视口的坐标
      var x = e.clientX;
      var y = e.clientY;
      // 计算相对于元素本身的坐标
      var relX = x - rect.left;
      var relY = y - rect.top;
      // 获取鼠标在当前元素中的点击位置
      this.moveNodeStartPos = { left: relX, top: relY };
      const { top, left } = this.moveNode.parentElement?.getBoundingClientRect() || { top: 0, left: 0 };
      this.moveNodeParentStartPos = { top, left }
    }

    this._viewAreaEl.onmousemove = (e) => {
      if (!this.moveNode) return
      const parentTop = this.moveNodeParentStartPos.top; // 父元素在窗口中的位置
      const parentLeft = this.moveNodeParentStartPos.left; // 父元素在窗口中的位置
      // 获取当前鼠标相对于父级元素的位置
      const currentPos = { top: e.clientY - parentTop, left: e.clientX - parentLeft };
      // 计算移动的距离
      const distance = { top: currentPos.top - this.moveNodeStartPos.top, left: currentPos.left - this.moveNodeStartPos.left };
      // 设置元素的位置
      this.moveNode.style.top = `${distance.top}px`;
      this.moveNode.style.left = `${distance.left}px`;

    }
    // 鼠标移出区域/松开鼠标时，停止移动
    this._viewAreaEl.onmouseleave = (e) => {
      this._voucherEl.onmousemove = null;
      this._voucherEl.onmouseup = null;
      if (!this.moveNode) return
      this.moveNode.style.border = "none";
      this.moveNode = undefined;
      this.selectNode.style.border = "1px solid red";
    }
    this._viewAreaEl.onmouseup = (e) => {
      this._voucherEl.onmousemove = null;
      this._voucherEl.onmouseup = null;
      if (!this.moveNode) return
      this.moveNode.style.border = "none";
      this.moveNode = undefined;
      this.selectNode.style.border = "1px solid red";
    }
  }




  protected onSelectNode(type: keyof AttributeOptions, selectNode: HTMLElement) {
    this._attribute?.setOptions(type);
  }

  render() {
    super.render();
    this._voucherEl.style.position = "absolute";
    this._voucherEl.style.top = "200px";
    this._voucherEl.style.left = "120px";
    this._voucherEl.onclick = (e) => {
      e.stopPropagation();
      if (this._toolbar?.methodType !== "select") return
      this.selectType = "voucher"
      this.selectNode = this._voucherEl;
    }
  }
}
