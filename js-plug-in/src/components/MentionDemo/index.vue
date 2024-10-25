<template>
  <div class="mention-app-body" :class="{ h5: vw < 750 }">
    <div class="chat-area">
      <ChatArea :data="messages" />
      <div class="editor">
        <div class="editor-content"></div>
        <div class="editor-footer">
          <!-- a标签在外部窗口打开 -->
          <a href="https://www.npmjs.com/package/hi-mention" target="_blank"> 使用本插件 </a>
          <button @click="sendMessage">发送</button>
        </div>
      </div>
    </div>
    <div class="methods">
      <div class="users">
        <div class="user-item" v-for="user in users" :key="user.id">{{ user.name }}({{ user.id }})</div>
      </div>
      <div style="padding: 0 10px">
        <button @click="insertText">插入文本</button>
        <button @click="insertHtml">插入HTML</button>
        <button @click="getData">获取输入内容</button>
        <button @click="focus">焦点到末尾</button>
        <button @click="clearData">清空输入框</button>
        <button @click="getMentions">获取@用户</button>
        <button @click="updateUsers">更新用户列表</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import ChatArea from "../ChatArea/index.vue";

import HiMention, { HiUserSelector } from "../../HiMention/hi-mention";
import "../../HiMention/hi-mention/index.css";

const vw = ref(window.innerWidth);
window.onresize = () => {
  vw.value = window.innerWidth;
};

const messages = ref<{ html: string; userTag: "self" | "others" }[]>([]);
const pushMessage = (html: string, userTag: "self" | "others") => {
  messages.value.unshift({ html, userTag });
};

const msg = ref("");

const m = ref<HiMention>();

watch(
  () => vw.value,
  (v) => {
    if (v < 750) {
      m.value?.userSelector?.setOptions({ media: "H5" });
    } else {
      m.value?.userSelector?.setOptions({ media: "PC" });
    }
  }
);

const users = ref<{ name: string; id: number }[]>([
  { name: "张三", id: 1 },
  { name: "李四", id: 2 },
  { name: "王五", id: 3 },
  { name: "赵六", id: 4 },
  { name: "钱七", id: 5 },
  { name: "孙八", id: 6 },
  { name: "周九", id: 7 },
  { name: "吴十", id: 8 },
  { name: "郑十一", id: 9 },
  { name: "王十二", id: 10 },
  { name: "李十三", id: 11 },
  { name: "赵十四", id: 12 },
  { name: "钱十五", id: 13 },
  { name: "孙十六", id: 14 },
  { name: "周十七", id: 15 },
  { name: "吴十八", id: 16 },
  { name: "郑十九", id: 17 },
]);

onMounted(() => {
  m.value = new HiMention(".editor-content", {
    users: users.value,
    media: vw.value < 750 ? "H5" : "PC",
  }).on("change", (d) => (msg.value = d?.html || ""));
  console.log(m.value);
});
const focus = () => {
  m.value?.focus();
};

const sendMessage = () => {
  if (!msg.value) return;
  pushMessage(msg.value, "self");
  pushMessage(`欢迎使用本插件，使用过程中有任何问题欢迎加入QQ群参与讨论：<a href="https://qm.qq.com/q/LqSPY7LrGM" target="_blank">点击链接加入群聊【小妖非人类研究中心—前端】</a>`, "others");
  m.value?.clear();
};

const getData = () => {
  const data = m.value?.getData();
  if (data?.text) {
    pushMessage(`输入框内容为：${data.html}`, "others");
  } else {
    pushMessage(`输入框没有内容`, "others");
  }
};

const insertText = () => {
  m.value?.insertText(" 我是插入的内容 ");
};

const insertHtml = () => {
  const div = document.createElement("div");
  div.style.display = "inline-block";
  div.style.padding = "20px";
  div.style.border = "1px solid #ccc";
  div.innerText = "我是插入的HTML";
  m.value?.insertHtml(div);
};

const clearData = () => {
  m.value?.clear();
};

const getMentions = () => {
  const data = m.value?.getMentions();
  if (data?.length) {
    pushMessage(`@用户：${JSON.stringify(data)}`, "others");
  } else {
    pushMessage(`没有@用户`, "others");
  }
};

const updateUsers = () => {
  users.value = [
    { name: "孙悟空", id: 100 },
    { name: "猪八戒", id: 101 },
    { name: "沙僧", id: 102 },
    { name: "唐僧", id: 103 },
    { name: "白龙马", id: 104 },
  ];
  m.value?.userSelector?.setOptions({ users: users.value });
};
</script>

<style>
.mention-app-body {
  width: 750px;
  height: 500px;
  display: flex;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  border-radius: 4px;
  box-shadow: 0 0 10px #ccc;
}
.chat-area {
  width: calc(100% - 150px);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.methods {
  width: 150px;
  height: 100%;
  border-left: 1px solid #ccc;
}
.methods .users {
  padding: 10px;
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
  height: calc(100% - 260px);
  overflow-y: auto;
}
.methods .users .user-item {
  padding: 3px 10px;
}
.editor {
  width: 100%;
  height: 200px;
  border-top: 1px solid #ccc;
}
.editor-content {
  height: calc(100% - 40px);
  padding: 5px 10px;
}

.editor-footer {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  border-top: 1px solid #ccc;
}

.editor-footer button {
  width: 120px;
  height: 30px;
}

.editor-footer a {
  color: #09f;
  text-decoration: none;
}

button {
  width: 100%;
  height: 26px;
  background-color: #09f;
  border-color: #09f;
  border-radius: 4px;
  color: #fff;
}
button + button {
  margin-top: 10px;
}

.h5.mention-app-body {
  width: 100vw;
  height: 100vh;
  border: none;
  position: relative;
  left: 0;
  top: 0;
  transform: translate(0, 0);
  background-color: #fff;
}
.h5 .methods {
  display: none;
}
.h5 .chat-area {
  width: 100%;
}
.h5 .message-body > div > .message {
  background-color: #f5f5f5;
}
</style>
