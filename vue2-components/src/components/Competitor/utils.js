export function UUID() {
  return Array.from({ length: 8 })
    .map(() => Math.floor(Math.random() * 32).toString(32))
    .join("");
}

// 获取2的N次方
export function getTwoPower(n) {
  return Math.pow(2, n < 1 ? 1 : Math.floor(n));
}

// 根据数量生产比赛队伍数量,数量不得小于2
export function getTeamCount(num) {
  return getTwoPower(Math.ceil(Math.log2(num)));
}
