# Mention 提及

纯 JS 插件，无依任何赖，兼容原生 HTML 及各大前端框架，提供高自由度接口

- [查看 demo 示例](http://mention.bauble.vip)
- [QQ 群](https://qm.qq.com/q/LqSPY7LrGM)

## 安装

```bash
npm install hi-mention --save
```

## 引入

```js
import HiMention from "hi-mention";
```

## 使用

```javascript
// options非必要参数，可根据需要自行调整
new HiMention(element, options);
```

## VUE 使用示例

```html
<template>
  <div class="editor-content"></div>
</template>

<script lang="ts" setup>
  import { onMounted } from "vue";
  // 引入插件
  import HiMention from "hi-mention";
  // 引入插件样式
  import "hi-mention/index.css";

  onMounted(() => {
    new HiMention(".editor-content", {
      users: [
        { name: "张三", id: 1 },
        { name: "李四", id: 2 },
        { name: "王五", id: 3 },
        { name: "赵六", id: 4 },
        { name: "钱七", id: 5 },
        { name: "孙八", id: 6 },
        { name: "周九", id: 7 },
        { name: "吴十", id: 8 },
      ],
    })
      .on("focus", (e) => {
        console.log("focus", e);
      })
      .on("blur", (e) => {
        console.log("blur", e);
      })
      .on("change", (d) => {
        console.log("change", d?.html);
        msg.value = d?.html || "";
      });
  });
</script>

<style>
  .editor-content {
    width: 500px;
    height: 200px;
    border: 1px solid #ccc;
    padding: 5px 10px;
  }
</style>
```

## Options 属性

| 属性名             | 说明                                          | 类型          | 默认值    |
| ------------------ | --------------------------------------------- | ------------- | --------- |
| `trigger`          | 触发字符                                      | `string`      | `@`       |
| `placeholder`      | 占位符                                        | `string`      | `请输入`  |
| `placeholderColor` | 占位符颜色                                    | `string`      | `#aaa`    |
| `mentionColor`     | 提及用户颜色                                  | `string`      | `#0090FF` |
| `users`            | 用户列表                                      | `Array<User>` | `[]`      |
| `media`            | 媒体类型（`PC` 和 `H5` 的用户列表展示有差异） | `PC`/`H5`     | `PC`      |
| `idKey`            | `User`对象`id`字段(该字段支持`@搜索`)         | `string`      | `id`      |
| `nameKey`          | `User`对象`name`字段(该字段支持`@搜索`)       | `string`      | `name`    |
| `pingyinKey`       | `User`对象`pingyin`字段(该字段支持`@搜索`)    | `string`      | `pingyin` |
| `avatarKey`        | `User`对象`avatar`字段                        | `string`      | `avatar`  |
| `usersWdith`       | 用户列表宽度（`media`=`PC`时有效）            | `string`      | `200px`   |
| `usersHeight`      | 用户列表最大高度                              | `string`      | `200px`   |

## API

| 方法          | 说明                             | 类型                                         | 备注 |
| ------------- | -------------------------------- | -------------------------------------------- | ---- |
| `setOptions`  | 设置`options`属性                | `(options: Partial<MentionOptions>)=>this`   | -    |
| `getOptions`  | 获取`options`属性                | `()=>MentionOptions`                         | -    |
| `on`          | 监听事件                         | `(key:EventType,fn:(data?:any)=>void)=>this` | -    |
| `mentionUser` | 提及用户                         | `(user:User)=>this`                          | -    |
| `clear`       | 清空输入框                       | `()=>this`                                   | -    |
| `insertText`  | 在光标位置插入文本内容           | `(text:string)=>this`                        | -    |
| `insertHtml`  | 在光标位置插入 HTML 内容         | `(html:Element)=>this`                       | -    |
| `focus`       | 获取焦点、将光标移动到输入框末尾 | `()=>this`                                   | -    |
| `getData`     | 获取输入框内容                   | `()=>{html:string,text:string}`              | -    |
| `getMentions` | 获取输入框内提及的用户对象列表   | `()=>Array<User>`                            | -    |

### EventType

| 类型           | 说明     | 备注 |
| -------------- | -------- | ---- |
| `input`        | 输入事件 | -    |
| `focus`        | 获取焦点 | -    |
| `blur`         | 失去焦点 | -    |
| `keydown`      | 键盘按下 | -    |
| `keyup`        | 键盘抬起 | -    |
| `change`       | 内容改变 | -    |
| `mention-user` | 提及用户 | -    |

### User 类型

- 以下字段为推荐字段，若字段不存在，请使用`idKey`、`nameKey`、`pingyinKey`、`avatarKey`字段进行配置

| 字段名    | 必须 | 说明                                                 | 类型      |
| --------- | ---- | ---------------------------------------------------- | --------- |
| `id`      | 否   | 键（该字段支持@查询）                                | `string`  |
| `name`    | 否   | 名字（该字段支持@查询）                              | `string`  |
| `pingyin` | 否   | 拼音（该字段支持@查询）                              | `string`  |
| `avatar`  | 否   | 头像                                                 | `string`  |
| `element` | 否   | 用户列表中展示的元素，若不提供该字段，则使用默认样式 | `Element` |

## 自定义

- 如果内置功能如无法满足需求，可以通过继承 HiMention 组件，以下方法来实现自定义用户列表

### HiMention 接口

| 接口名              | 说明                   | 类型                           | 备注                                      |
| ------------------- | ---------------------- | ------------------------------ | ----------------------------------------- |
| `initUserSelector`  | 方法：初始化用户选择器 | `()=>void`                     | -                                         |
| `closeUserSelector` | 方法：关闭用户选择器   | `()=>void`                     | -                                         |
| `openUserSelector`  | 方法：打开用户列表     | `(query:User)=>void`           | `query`:为用户输入`@`时后面跟的查询字符串 |
| `onWordDelete`      | 方法：删除/退格        | `(e: KeyboardEvent)=> boolean` | 返回 `true` 阻止默认事件和触发其他事件    |
| `onMoveCursor`      | 方法：光标移动         | `(e: KeyboardEvent)=> boolean` | 返回 `true` 阻止默认事件和触发其他事件    |
| `onWordWrap`        | 方法：换行             | `(e: KeyboardEvent)=> boolean` | 返回 `true` 阻止默认事件和触发其他事件    |

### HiUserSelector 接口

| 接口名           | 说明                        | 类型                   | 备注 |
| ---------------- | --------------------------- | ---------------------- | ---- |
| `element`        | 属性：用户列表根元素        | `HTMLElement`          | -    |
| `open`           | 方法：打开用户列表          | `(query:string)=>void` | -    |
| `close`          | 方法：关闭用户列表          | `()=>void`             | -    |
| `createUserItem` | 方法：创建用户选项`Element` | `(user:User)=>Element` | -    |

- 继承示例

```javascript
// 引入插件
import HiMention, { HiUserSelector } from "hi-mention";
// 引入插件样式
import "hi-mention/index.css";

// 创建自定义用户选择器
class MyHiUserSelector extends HiUserSelector {
  element: HTMLElement = document.createElement("div"); // 这是用户列表的根元素
  constructor(props) {
    super(props);
  }

  open(query: string) {
    // 自定义打开列表逻辑
  }

  close() {
    // 自定义关闭列表逻辑
  }

  // 该方法返回的元素将被展示在默认用户列表中
  createUserItem(user) {
    const { name, avatar } = user;
    const img = document.createElement("img");
    img.src = avatar;
    img.style.width = "20px";
    img.style.height = "20px";
    img.style.marginRight = "5px";
    const span = document.createElement("span");
    span.innerText = name;
    const div = document.createElement("div");
    div.appendChild(img);
    div.appendChild(span);
    // 该元素将被当成选项展示在用户列表中
    return div;
  }
}

// 使用自定义选择器
class MyHiMention extends HiMention {
  constructor(props) {
    super(props);
  }

  // 初始化用户选择器
  initUserSelector() {
    this.userSelector = new MyHiUserSelector();
    // 监听鼠标在用户列表中按下事件，防止鼠标点击用户列表时，触发编辑器失去焦点事件
    this.userSelector.element.onmousedown = () => setTimeout(() => clearTimeout(this.blurtimeout), 100);
    // 监听选择用户事件
    this.userSelector.onSelectUser((user) => {
      this.mentionUser(user);
    });
  }

  // 打开用户选择器
  openUserSelector(query) {
    this.userSelector.open(query);
  }

  // 关闭用户选择器
  closeUserSelector() {
    this.userSelector.close();
  }
}
```

### 自定义换行示例

```javascript
// 引入插件
import HiMention from "hi-mention";
// 引入插件样式
import "hi-mention/index.css";

// 使用自定义选择器
class MyHiMention extends HiMention {
  constructor(props) {
    super(props);
  }

  // 监听用户按下换行按键
  onWordWrap(e: KeyboardEvent): boolean {
    if (["Enter", "NumpadEnter"].includes(e.code)) {
      // 可重新设置快捷键
      // 调用内置换行方法
      this.wordWrap(); // 可重新设置换行逻辑
      // 返回true阻止默认事件和触发其他事件
      return true;
    }
    return false; // 没有自行换行，返回false
  }
}
```
# 更新日志
```html
v2.2.0 2024-10-27
- 对v2.1.0版本BUG继续修复

v2.1.0 2024-10-26
- 修复剪切、复制、粘贴
- 修复移动光标
- 修复换行
- 修复删除
- 修复焦点
- 修复占位符展示异常
- 针对火狐浏览器做兼容处理

v2.0.1 2024-10-25
- 修复默认用户选择器切换用户异常

v2.0.0 2024-10-25
- 初始版本
```
