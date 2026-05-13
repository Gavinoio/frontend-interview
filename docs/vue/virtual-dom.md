# 虚拟 DOM 与 Diff

## 什么是虚拟DOM?
虚拟DOM是用JavaScript对象描述真实DOM的结构。

## VNode
```javascript
{
  tag: 'div',
  props: { class: 'container' },
  children: [
    { tag: 'span', props: {}, children: ['Hello'] }
  ]
}
```

## Diff 算法
- 同层比较
- key 的作用
- 最小化DOM操作

## 为什么需要虚拟DOM?
- 跨平台
- 性能优化
- 声明式编程

---

