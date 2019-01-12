// 创建一个模板编译工具
class TemplateCompiler {
  // el 视图
  // vm 全局vm对象
  constructor(el, vm) {
    // 缓存重要属性
    this.el = document.querySelector(el);
    this.vm = vm;

    // 1. 把模板内容放进内存（内存片段）
    let fragment = this.node2fragment(this.el)
    // 2. 解析模板
    this.compile(fragment);
    // 3. 把内存的结果，放回到模板
    this.el.appendChild(fragment);
  }

  // 工具方法
  isElementNode(node) {
    // 1. 元素节点  2. 属性节点  3. 文本节点
    return node.nodeType === 1;
  }
  isTextNode(node) {
    return node.nodeType === 3;
  }
  isDirective(attrName) {
    // 判断属性是否是指令
    return attrName.indexOf('v-') >= 0;
  }

  // 核心方法
  node2fragment(node) {
    // 1. 创建内存片段
    let fragment = document.createDocumentFragment();
    // 2. 把模板内容放进内存
    let child;
    while (child = node.firstChild) {
      fragment.appendChild(child);
    }
    // 3. 返回
    return fragment;
  }
  compile(parent) {
    // 1. 获取子节点
    let childNode = parent.childNodes;
    // 2. 遍历每一个节点
    [...childNode].forEach(node => {
      // 3. 判断节点类型
      if (this.isElementNode(node)) {
        // 元素节点 （解析指令）
        this.compileElement(node);
      } else if (this.isTextNode(node)) {
        // 表达式解析
        // 定义表达式正则验证规则
        let textReg = /\{\{(.+)\}\}/;
        let expr = node.textContent;
        // 按照规则验证内容
        if (textReg.test(expr)) {
          expr = RegExp.$1;
          // 调用方法编译
          this.compileText(node, expr);
        }
      }
    })
  }

  // 解析元素节点的指令
  compileElement(node) {
    // 1. 获取当前节点的所有属性
    let attrs = node.attributes;
    // 2. 遍历当前元素的所有属性
    [...attrs].forEach(attr => {
      let attrName = attr.name;
      // 3. 判断属性是否是指令
      if (this.isDirective(attrName)) {
        // 4. 收集
        let type = attrName.substr(2); // v-text
        // 指令的值就是表达式
        let expr = attr.value;
        // CompilerUtils.text(node, this.vm, expr);
        CompilerUtils[type](node, this.vm, expr);
      }
    })
  }
  // 解析表达式
  compileText(node, expr) {
    CompilerUtils.text(node, this.vm, expr);
  }
}

CompilerUtils = {
  // 解析text指令
  text(node, vm, expr) {
    // 1. 找到更新方法
    let updaterFn = this.updater['textUpdater'];
    // 执行方法
    updaterFn && updaterFn(node, vm.$data[expr]);

    // 添加订阅者
    new Watcher(vm, expr, (newVal) => {
      updaterFn && updaterFn(node, newVal);
    })
  },
  // 解析model指令
  model(node, vm, expr) {
    // 1. 找到更新方法
    let updaterFn = this.updater['modelUpdater'];
    // 执行方法
    updaterFn && updaterFn(node, vm.$data[expr]);
    // 视图到模型
    node.addEventListener('input', e => {
      vm.$data[expr] = e.target.value
    })
    // 添加订阅者
    new Watcher(vm, expr, (newVal) => {
      updaterFn && updaterFn(node, newVal);
    })
  },
  // 更新规则对象
  updater: {
    // 文本更新方法
    textUpdater(node, value) {
      node.textContent = value;
    },
    // 输入框更新方法
    modelUpdater(node, value) {
      node.value = value;
    }
  }
}
