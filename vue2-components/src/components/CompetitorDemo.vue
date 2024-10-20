<template>
  <div class="competitor-demo">
    <Competitor :teams="teams" :victoryIds="victoryIds" ref="Competitor">
      <template v-slot="{ node, col }">
        <div
          style="
            width: 100px;
            height: 30px;
            border: 1px solid red;
            text-align: center;
            line-height: 28px;
          "
          @click="onClick(node, col)"
        >
          {{ node.name }}
        </div>
      </template>
    </Competitor>
  </div>
</template>
<script>
import Competitor from "./Competitor";
export default {
  name: "App",
  components: { Competitor },
  data() {
    return {
      // 所有的队伍，保持为2的N次方，如果不是，组件会自动补齐
      teams: [
        { name: "队伍1", id: "1" },
        { name: "队伍2", id: "2" },
        { name: "队伍3", id: "3" },
        { name: "队伍4", id: "4" },
      ],
      // 胜利的队伍ID二维数组，每一个数组对应每一轮比赛
      victoryIds: [
        ["1", "3"], // 第1轮胜利的ID
        // ["1"], // 第2轮胜利的ID
      ],
    };
  },
  methods: {
    addNode() {
      this.$refs.Competitor.addNode();
    },
    onClick(node, col) {
      console.log(`第${col + 1}轮：`, node);
    },
  },
};
</script>
<style>
.competitor-demo {
  width: 800px;
  height: 600px;
  background-color: #f1f1f1;
  margin: 100px;
}
</style>
