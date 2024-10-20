<template>
  <div class="competitor-root">
    <div class="competitor-body" :style="bodyStyle">
      <canvas id="competitor-canvas" />
      <div
        class="competitor-col"
        v-for="(col, index) in viewData"
        :key="index"
        :col-index="index"
      >
        <div
          v-for="(node, i) in col"
          :key="i"
          :node-index="i"
          :node-id="node[idKey]"
          :node-tier="index"
        >
          <slot :node="node" :col="index">
            <div class="col-item">
              {{ node[nameKey] }}
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import useMouse from "./useMouse";
import { UUID, getTeamCount } from "./utils";
export default {
  mixins: [useMouse],
  name: "Competitor",
  props: {
    teams: { type: Array, default: () => [] },
    nameKey: { type: String, default: "name" },
    idKey: { type: String, default: "id" },
    victoryIds: { type: Array, default: () => [] },
    endNodeMargin: { type: Number, default: 20 },
    lineWidth: { type: Number, default: 1 },
    lineColor: { type: String, default: "#999" },
    indeterminateName: { type: String, default: "待定" },
  },
  data() {
    return {
      dataTeams: [],
      viewData: [],
    };
  },
  watch: {
    teams: {
      handler(newVal) {
        this.dataTeams = newVal;
        this.initData();
      },
      immediate: true,
      deep: true,
    },
  },
  created() {},
  mounted() {},
  methods: {
    initData() {
      this.scale = 1;
      this.$nextTick(() => {
        let length = getTeamCount(this.dataTeams.length);
        const col = [...this.dataTeams];
        // 如果队伍不是2的n次方，则补足队伍
        if (col.length !== length) {
          for (let i = col.length; i < length; i++) {
            col.push({
              [this.idKey]: UUID(),
              [this.nameKey]: this.indeterminateName,
            });
          }
        }

        // 比赛总轮数
        const round = Math.log2(length);

        // 生成比赛树
        const data = [col];

        for (let i = 0; i < round; i++) {
          // 上一轮队伍
          const upTeams = data[data.length - 1];
          // 上一轮胜利的队伍ID
          const upVictoryIds = this.victoryIds[i];
          // 下一轮队伍
          const newCol = [];
          for (let j = 0; j < upTeams.length; j += 2) {
            const team1 = upTeams[j];
            const team2 = upTeams[j + 1];
            let team = {
              [this.idKey]: UUID(),
              [this.nameKey]: this.indeterminateName,
            };
            if (
              upVictoryIds &&
              upVictoryIds.length &&
              team1[this.nameKey] !== this.indeterminateName &&
              team2[this.nameKey] !== this.indeterminateName
            ) {
              if (upVictoryIds.includes(team1[this.idKey])) {
                team = team1;
              } else if (upVictoryIds.includes(team2[this.idKey])) {
                team = team2;
              }
            }
            newCol.push(team);
          }
          data.push(newCol);
        }
        this.viewData = data;
        this.rendTreeNode();
      });
    },

    // 渲染节点
    rendTreeNode() {
      this.$nextTick(() => {
        const length = this.viewData.length;
        let nodeHeight = 80;
        let nodeWidth = 200;
        const marginTops = [this.endNodeMargin];
        for (let i = 0; i < length; i++) {
          const nodes = window.document.querySelectorAll(`[node-tier="${i}"]`);
          nodes.forEach((node) => {
            if (nodeHeight !== node.offsetHeight)
              nodeHeight = node.offsetHeight;
            if (nodeWidth !== node.offsetWidth) nodeWidth = node.offsetWidth;
            const index = Number(node.getAttribute("node-index"));
            if (index === 0) {
              return;
            }
            node.style.marginTop = `${marginTops[i]}px`;
          });
          const marginTop = nodeHeight + marginTops[i] * 2;
          marginTops.push(marginTop);
        }

        this.rendNodeLine(nodeHeight, nodeWidth);
      });
    },
    // 渲染连线
    rendNodeLine(nodeHeight, nodeWidth) {
      this.$nextTick(() => {
        const body = window.document.querySelector(".competitor-body");
        if (!body) return;
        const bodyInfo = body.getBoundingClientRect();
        const length = this.viewData.length;
        const nodeLineDots = [];
        for (let i = 0; i < length; i++) {
          nodeLineDots.push([]);
          const nodes = window.document.querySelectorAll(`[node-tier="${i}"]`);
          nodes.forEach((node) => {
            const nodeInfo = node.getBoundingClientRect();
            const left = nodeInfo.left - bodyInfo.left;
            const top = nodeInfo.top - bodyInfo.top;

            nodeLineDots[i].push({
              col: i,
              left: left,
              right: left + nodeWidth,
              y: top + nodeHeight / 2,
            });
          });
        }
        const lines = [];
        nodeLineDots.forEach((nodeDots, index) => {
          const nextCols = nodeLineDots[index + 1];
          if (!nextCols) return;
          nodeDots.forEach((dot, i) => {
            const nextDotIndex = Math.ceil((i + 1) / 2) - 1;
            lines.push({
              from: {
                x: dot.right,
                y: dot.y,
              },
              to: {
                x: nextCols[nextDotIndex].left,
                y: nextCols[nextDotIndex].y,
              },
            });
          });
        });
        const canvas = window.document.querySelector("#competitor-canvas");
        if (!canvas) return;
        canvas.width = bodyInfo.width;
        canvas.height = bodyInfo.height;
        const ctx = canvas.getContext("2d");
        // 设置原点为左上角
        ctx.translate(0, 0);
        // 画线
        ctx.clearRect(0, 0, bodyInfo.width, bodyInfo.height);
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.lineColor;
        lines.forEach((line) => {
          const centerX = Math.abs(line.to.x - line.from.x) / 2 + line.from.x;
          ctx.moveTo(line.from.x, line.from.y);
          ctx.lineTo(centerX, line.from.y);
          ctx.moveTo(centerX, line.from.y);
          ctx.lineTo(centerX, line.to.y);
          ctx.moveTo(centerX, line.to.y);
          ctx.lineTo(line.to.x, line.to.y);
        });
        ctx.stroke();
        console.log(lines);
      });
    },
  },
};
</script>
<style scoped lang="less">
.competitor-root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: move;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;

  .competitor-body {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently supported by Chrome and Opera */
    position: relative;

    #competitor-canvas {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
    }
    .competitor-col {
      position: relative;
      z-index: 2;

      & + .competitor-col {
        margin-left: 50px;
      }
      .col-item {
        width: 100px;
        height: 30px;
        background-color: #fff;
        border: 1px solid #ddd;
        line-height: 28px;
        text-align: center;
        border-radius: 4px;
      }
    }
  }
}
</style>
