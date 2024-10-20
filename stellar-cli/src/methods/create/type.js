const inquirer = require("inquirer").default;

const types = [
  {
    value: "uniapp-vue2",
    desc: "vue2",
    gitpath: "http://172.16.108.253:8001/Stellar/uniapp-vue2.git",
    framework: "uni-app",
  },
  {
    value: "uniapp-vue3",
    desc: "vue3",
    gitpath: "http://172.16.108.253:8001/Stellar/uniapp-vue3.git",
    framework: "uni-app",
  },

  {
    value: "vue2",
    desc: "vue 2.x",
    gitpath: "http://172.16.108.253:8001/Stellar/vue2.git",
    framework: "vue",
  },
  {
    value: "vue3",
    desc: "vue 3.x",
    gitpath: "http://172.16.108.253:8001/Stellar/vue3.git",
    framework: "vue",
  },
];

exports.getType = async function () {
  // 选择框架
  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "framework",
      message: "请选择框架",
      choices: [...new Set(types.map((item) => item.framework))],
    },
  ]);
  // 选着版本
  const _types = types.filter((item) => item.framework === answer.framework);
  const versions = await inquirer.prompt([
    {
      type: "list",
      name: "versions",
      message: "请选择项目版本",
      choices: _types.map((item) => item.desc),
    },
  ]);
  return _types.find((item) => item.desc === versions.versions).value;
};

exports.getGitpath = function (type) {
  return types.find((item) => item.value === type).gitpath;
};
