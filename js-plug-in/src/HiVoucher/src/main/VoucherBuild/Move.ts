export function setMoveNoe(node: HTMLElement, type: VoucherAttributeKeys) {
  let isMove = false
  let timeout: any
  node.onmousedown = (e) => {
    timeout = setTimeout(() => {
      isMove = true
    }, 500)
  }

  node.onmousemove = (e) => {
    if (isMove) {
      // node.style.left = e.clientX + 'px'
      // node.style.top = e.clientY + 'px'
      node.setAttribute(type, e.clientX + ',' + e.clientY)
    }
  }

  node.onmouseup = (e) => {
    isMove = false
  }

}

export function offMoveNode(node: HTMLElement) {
  node.onmousedown = null
  node.onmousemove = null
  node.onmouseup = null
}