<script lang="ts" setup>
import { type PropType } from "vue";
defineProps({
  data: {
    type: Array as PropType<{ html: string; userTag: "self" | "others" }[]>,
    default: () => [],
  },
});
</script>
<template>
  <div class="message-body">
    <div class="message-item" v-for="(item, index) in data" :key="index" :class="item.userTag">
      <div class="avatar"></div>
      <div class="message">
        <div v-html="item.html"></div>
      </div>
    </div>
    <div class="message-placeholder">纯JS插件，无依赖，兼容原生HTML及各大前端框架，提供高自由度接口</div>
  </div>
</template>
<style>
.message-body {
  width: 100%;
  max-height: calc(100% - 200px);
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
  padding: 10px 0;
}

div.message-placeholder {
  font-size: 12px;
  color: #09f;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
}
.message-body > div.message-item {
  padding: 10px 0;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.message-body > div.message-item.self {
  width: 100%;
  flex-direction: row-reverse;
  padding-left: 40%;
  justify-content: flex-start;
  padding-right: 10px;
}
.message-body > div.message-item.others {
  padding-right: 40%;
  padding-left: 10px;
}
.message-body > div.message-item > .avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #ccc;
}
.message-body > div.message-item > .message {
  max-width: calc(100% - 40px);
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
}
.message-body > div.message-item.self > .message {
  display: flex;
  justify-content: flex-end;
}
</style>
