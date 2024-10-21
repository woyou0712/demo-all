import { createElement, createUUID, voucherTemplateData } from "../../../utils";
import Attribute from "../Attribute";
import { Toolbar } from "../Toolbar";
import { Voucher } from "../Voucher";
import TextBuild from "./nodes/TextBuild";
import BaseNode from "./nodes/BaseNode";

type MoveNodeType = "input" | "table" | "text" | "voucher"

export class VoucherBuild extends Voucher {

  private _attribute?: Attribute;
  private _toolbar?: Toolbar

  private _moveNode: { element: HTMLElement | null, type: MoveNodeType } = { element: null, type: "voucher" };

  private get moveNode() {
    return this._moveNode
  }

  private set moveNode(data: { element: HTMLElement | null, type: MoveNodeType }) {
    this._moveNode = data;
    if (!data.element) return;
    this.selectNode = { element: data.element, type: data.type }
    console.log(data.element)
    data.element.style.border = "1px dashed #000";
  }

  private moveNodeStartPos: { top: number, left: number } = { top: 0, left: 0 };
  private moveNodeParentStartPos: { top: number, left: number } = { top: 0, left: 0 };


  private _selectNode: { element: HTMLElement, type: MoveNodeType }

  private get selectNode() {
    return this._selectNode
  }

  private set selectNode(node: { element: HTMLElement, type: MoveNodeType }) {
    this._selectNode.element.style.border = "1px solid transparent";
    this._selectNode = node;
    node.element.style.border = "1px solid red";
    if (node.type === "voucher") {
      this._attribute?.setOptions(node.type, this.templateData);
    } else {
      const key = node.element.getAttribute("data-key");
      if (!key || !this.nodesMap[key]) return
      this._attribute?.setOptions(node.type, this.nodesMap[key].options as any);
    }
  }


  // 模板数据
  get templateData() {
    return this._templateData
  }
  set templateData(data: VoucherTemplate) {
    this._templateData = data;
    this._renderVoucher();
    this._renderContent();
  }

  // 所有节点MAP
  private nodesMap: { [key: string]: BaseNode } = {}



  constructor(el: Element | string, data: VoucherTemplate = voucherTemplateData()) {
    super(el, data);
    this._selectNode = { element: this._voucherEl, type: "voucher" } // 初始化属性
    this.selectNode = { element: this._voucherEl, type: "voucher" } // 激活set事件
    this.templateData = data;
    this.createAttribute();
    this.createToolbar();
    this.initMoveNode()
  }

  protected createNode(type: "input" | "table" | "text", nodeData?: any) {
    const key = createUUID();
    if (type === "text") {
      const node = new TextBuild(nodeData)
      node.element.setAttribute("data-key", key)
      this.nodesMap[key] = node;
      this._voucherEl.appendChild(node.element);
      this.addMoveEvent("text", node.element)
      this.addSelectEvent("text", node.element)
    }
  }

  protected createToolbar() {
    this._toolbar = new Toolbar(this._rootEl);
    this._toolbar.onCreateNode(type => {
      console.log("创建节点", type)
    })
    this._toolbar.onMethodChange(type => {
      switch (type) {
        case "select":
          this._voucherEl.style.cursor = "pointer";
          break;
        case "move":
          this._voucherEl.style.cursor = "move";
          break;
        case "copy":
          this._voucherEl.style.cursor = "copy";
          break;
      }
    })
  }



  protected createAttribute() {
    this._attribute = new Attribute(this._rootEl);
    this._attribute.onChange((type, nodeKey, key, value) => {
      if (type === "voucher") {
        if (key === "bg") {
          this.templateData = Object.assign({}, this.templateData, { bg: value ? (value instanceof File ? URL.createObjectURL(value) : value) : '' });
          return
        }
        this.templateData = Object.assign({}, this.templateData, { [key]: value });
      } else {

      }
    })
  }

  protected _renderContent() {
    console.log("renderContent")
    Object.keys(this.templateData.content).forEach(key => {
      if (key === "texts" && this.templateData.content[key]) {
        const texts = this.templateData.content[key];
        texts?.forEach(text => {
          this.createNode("text", text)
        })
      } else if (key === "inputs" && this.templateData.content[key]) {
        const inputs = this.templateData.content[key];
      } else if (key === "tables" && this.templateData.content[key]) {
        const tables = this.templateData.content[key];
      }
    })
  }

  /**
   * 为节点添加选择事件
   * @param type 节点类型
   * @param nodeEl 节点元素
   */
  private addSelectEvent(type: MoveNodeType, nodeEl: HTMLElement) {
    nodeEl.onclick = e => {
      e.stopPropagation();
      if (this._toolbar?.methodType !== "select") return
      this.selectNode = { type, element: nodeEl }
    }
  }

  /**
   * 为节点添加移动事件
   * @param type 节点类型
   * @param nodeEl 节点元素
   */
  private addMoveEvent(type: MoveNodeType, nodeEl: HTMLElement) {
    nodeEl.onmousedown = (e) => {
      e.stopPropagation();
      if (this._toolbar?.methodType !== "move") return
      this.moveNode = { element: nodeEl, type }
      // 获取元素相对于视口的位置
      var rect = nodeEl.getBoundingClientRect();
      // 获取相对于视口的坐标
      var x = e.clientX;
      var y = e.clientY;
      // 计算相对于元素本身的坐标
      var relX = x - rect.left;
      var relY = y - rect.top;
      // 获取鼠标在当前元素中的点击位置
      this.moveNodeStartPos = { left: relX, top: relY };
      const { top, left } = nodeEl.parentElement?.getBoundingClientRect() || { top: 0, left: 0 };
      this.moveNodeParentStartPos = { top, left }
    }
  }


  /**
   * 移动节点
   */
  private initMoveNode() {
    this.addMoveEvent("voucher", this._voucherEl) // 初始化为票据添加移动事件
    this._viewAreaEl.onmousemove = (e) => {
      if (!this.moveNode.element) return
      const parentTop = this.moveNodeParentStartPos.top; // 父元素在窗口中的位置
      const parentLeft = this.moveNodeParentStartPos.left; // 父元素在窗口中的位置
      // 获取当前鼠标相对于父级元素的位置
      const currentPos = { top: e.clientY - parentTop, left: e.clientX - parentLeft };
      // 计算移动的距离
      const distance = { top: currentPos.top - this.moveNodeStartPos.top, left: currentPos.left - this.moveNodeStartPos.left };
      // 设置元素的位置
      this.moveNode.element.style.top = `${distance.top}px`;
      this.moveNode.element.style.left = `${distance.left}px`;
    }

    const stopMove = () => {
      this._voucherEl.onmousemove = null;
      this._voucherEl.onmouseup = null;
      if (!this.moveNode.element) return
      this.moveNode.element.style.border = "none";
      this.moveNode.element = null;
      this.selectNode.element.style.border = "1px solid red";
    }
    // 鼠标移出区域/松开鼠标时，停止移动
    this._viewAreaEl.onmouseleave = stopMove
    this._viewAreaEl.onmouseup = stopMove
  }






  render() {
    super.render();
    this._voucherEl.style.position = "absolute";
    this._voucherEl.style.top = "200px";
    this._voucherEl.style.left = "120px";
    this._voucherEl.style.cursor = "pointer";
    this._voucherEl.onclick = (e) => {
      e.stopPropagation();
      if (this._toolbar?.methodType !== "select") return
      this.selectNode = { type: "voucher", element: this._voucherEl }
    }
  }
}
