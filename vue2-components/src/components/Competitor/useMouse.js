import { defineComponent } from "vue";
export default defineComponent({
  data() {
    return {
      // 鼠标是否在内容区域
      isMouseIn: false,
      // 缩放
      scale: 1,
      // 鼠标按下开始位置
      mouseStart: { x: null, y: null },
      // 拖动
      drag: { x: 0, y: 0 },
      // 已拖动的距离
      dragDistance: { x: 0, y: 0 },
    };
  },
  computed: {
    bodyStyle() {
      return {
        transform: `scale(${this.scale}) translate(${this.drag.x}px, ${this.drag.y}px)`,
      };
    },
  },
  mounted() {
    const el = document.querySelector(".competitor-root");
    this.mouseEnter(el);
    this.mouseDrag(el);
  },
  methods: {
    // 鼠标进入内容区域
    mouseEnter(el) {
      el.onmouseenter = (e) => {
        // 阻止冒泡
        e.stopPropagation();
        this.isMouseIn = true;
      };
      el.onmouseleave = (e) => {
        e.stopPropagation();
        this.isMouseIn = false;
        this.mouseStart = { x: null, y: null };
        Object.assign(this.dragDistance, this.drag);
      };
      el.onmousewheel = (e) => {
        if (!this.isMouseIn) return;
        e.stopPropagation();
        // 阻止默认
        e.preventDefault();
        if (e.deltaY > 0) {
          this.scale -= 0.1;
        } else {
          this.scale += 0.1;
        }
      };
    },
    // 监听鼠标拖动事件
    mouseDrag(el) {
      // 鼠标按下
      el.onmousedown = (e) => {
        e.stopPropagation();
        this.mouseStart = { x: null, y: null };
        Object.assign(this.dragDistance, this.drag);
        this.mouseStart = { x: e.clientX, y: e.clientY };
      };
      // 鼠标移动
      el.onmousemove = (e) => {
        const { x, y } = this.mouseStart;
        if (x === null || y === null) return;
        e.stopPropagation();
        const { clientX, clientY } = e;
        this.drag.x = this.dragDistance.x + clientX - x;
        this.drag.y = this.dragDistance.y + clientY - y;
      };
      // 鼠标松开
      el.onmouseup = (e) => {
        e.stopPropagation();
        this.mouseStart = { x: null, y: null };
        Object.assign(this.dragDistance, this.drag);
      };
    },
  },
});
