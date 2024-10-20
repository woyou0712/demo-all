export function UUID(length = 8, tag = true) {
  let result = tag ? "u" : "";

  for (let i = result.length; i < length; i++) {
    result += Math.floor(Math.random() * 32).toString(32);
  }

  return result;
}
