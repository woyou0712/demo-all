<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["clear"]);
</script>
<template>
  <div class="right-method">
    <div class="data-list">
      <div class="data-item" v-for="(item, index) in props.data" :key="index">
        <div class="time">{{ item.time }}</div>
        <div>开盘价：{{ item.o }}</div>
        <div>收盘价：{{ item.c }}</div>
        <div>最低价：{{ item.l }}</div>
        <div>最高价：{{ item.h }}</div>
      </div>
    </div>
    <div class="button" @click="emit('clear')">清除框选</div>
  </div>
</template>
<style scoped lang="less">
.right-method {
  width: 100%;
  height: 100vh;
  background-color: #fff;
  padding: 20px;

  .data-list {
    width: 100%;
    height: calc(100% - 52px);
    overflow-y: auto;

    .data-item {
      padding: 12px 0;
      .time {
        width: 100%;
        font-size: 12px;
        color: #999;
        margin-bottom: 5px;
      }
    }
  }
  .button {
    margin-top: 20px;
    display: inline-block;
    height: 32px;
    line-height: 32px;
    text-align: center;
    background-color: #09f;
    color: #fff;
    cursor: pointer;
    padding: 0 12px;
    &:hover {
      background-color: #08e;
    }
  }
}
</style>
