<script setup>
import { onMounted, watch } from "vue";
import { UUID } from "@/utils/index";
import useChart from "./useChart";

const uuid = UUID();

const emits = defineEmits(["rect-select"]);

const props = defineProps({
  data: {
    type: Array,
    default: () => ({ list: [], rects: [] }),
  },
});

const { rendLineChartK, clearRect } = useChart(uuid, props, emits);
onMounted(() => {
  rendLineChartK();
});
defineExpose({
  rendLineChartK: () => rendLineChartK(),
  clearRect: () => clearRect(),
});
</script>
<template>
  <div class="line-chart-k" :id="uuid"></div>
</template>
<style scoped lang="less">
.line-chart-k {
  width: 100%;
  height: 100%;
}
</style>
