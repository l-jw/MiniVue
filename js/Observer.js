class Observer {
  constructor(data) {
    // 提供一个解析方法，完成属性分析，挟持数据
    this.observe(data)
  }
  observe(data) {
    // 判断数据的有效性
    if (!data || typeof data !== 'object') { return }
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }

  defineReactive(obj, key, val) {
    let dep = new Dep();
    Object.defineProperty(obj, key, {
      // 是否可遍历
      enumerable: true,
      // 是否可以重新配置
      configurable: false,
      get() {
        Dep.target && dep.addSub(Dep.target);
        Dep.target = ''
        return val;
      },
      set(newVal) {
        val = newVal;
        dep.notify();
      }
    })
  }
}

// 创建发布者
class Dep {
  constructor() {
    this.subs = [];
  }
  // 添加订阅
  addSub(sub) {
    this.subs.push(sub)
  }
  // 集体通知
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}