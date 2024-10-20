<script setup>
import { ref, onMounted, reactive } from "vue";
import LineChartK from "@/components/LineChartK/index.vue";
import RightMethod from "@/components/RightMethod/index.vue";

const kData = reactive({ list: [], rects: [] });

onMounted(() => {
  // return;
  // 发送网络请求
  fetch("api/?symbol=BTC_USDT&cycle=5m")
    .then((res) => {
      return res.json();
    })
    .then(({ kline, xdzs }) => {
      kData.list = kline.map((item) => ({
        time: item.dt,
        o: item.open,
        c: item.close,
        h: Math.max(item.high, item.low),
        l: Math.min(item.high, item.low),
      }));
      kData.rects = xdzs
        .splice(xdzs.length - 5 < 0 ? 0 : xdzs.length - 5, xdzs.length)
        .map((item) => ({
          startX: item.points[0].dt,
          endX: item.points[item.points.length - 1].dt,
          startY: item.ZD,
          endY: item.ZG,
        }));
    })
    .catch((e) => {
      console.log(e);
    });
});

const lineK = ref();
const selectData = ref([]);

const rectSelect = (data) => {
  console.log("选中的数据", data);
  selectData.value = data;
};

const clearRect = () => {
  lineK.value.clearRect();
};
</script>
<template>
  <div class="home-view">
    <div class="line-chart-k-body">
      <LineChartK ref="lineK" :data="kData" @rect-select="rectSelect" />
    </div>
    <div class="right-method-body">
      <RightMethod :data="selectData" @clear="clearRect" />
    </div>
  </div>
</template>
<style scoped lang="less">
.home-view {
  width: 100vw;
  height: 100vh;
  background-color: #333;
  overflow: hidden;
  display: flex;
  min-width: 1400px;
  .line-chart-k-body {
    width: calc(100% - 300px);
    height: 100%;
  }
  .right-method-body {
    width: 300px;
    height: 100%;
  }
}
</style>
