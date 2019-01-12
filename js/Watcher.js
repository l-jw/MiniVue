// 声明一个订阅者
class Watcher {
  // 需要订阅的节点
  // 全局vm对象
  // 发布时需要修改的方法
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    this.val = this.get()
  }
  // 获取当前值
  get() {
    // 把当前的订阅者添加到全局
    Dep.target = this;
    return this.vm.$data[this.expr];
  }
  // 提供一个更新方法
  update() {
    let newVal = this.vm.$data[this.expr];
    let oldVal = this.val
    if (newVal !== oldVal) {
      this.cb(newVal);
    }
  }
}