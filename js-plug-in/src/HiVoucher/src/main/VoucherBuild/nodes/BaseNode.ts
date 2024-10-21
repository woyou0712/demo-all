export default class BaseNode {
  element?: HTMLElement;
  update(options: { [key: string]: any }) { };
  options(): { [key: string]: any } { return {} };
}