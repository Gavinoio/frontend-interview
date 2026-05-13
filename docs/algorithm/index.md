# 算法与数据结构

## 概述

前端面试中算法主要考察基础数据结构和常见算法思想，难度通常在 LeetCode 简单到中等级别。

## 时间复杂度

| 复杂度 | 名称 | 示例 |
|--------|------|------|
| O(1) | 常数 | 数组访问、哈希表查找 |
| O(log n) | 对数 | 二分查找 |
| O(n) | 线性 | 数组遍历 |
| O(n log n) | 线性对数 | 快速排序、归并排序 |
| O(n²) | 平方 | 冒泡排序、嵌套循环 |
| O(2ⁿ) | 指数 | 递归斐波那契 |

```javascript
// O(1) - 常数时间
function getFirst(arr) {
  return arr[0];
}

// O(n) - 线性时间
function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

// O(n²) - 平方时间
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

// O(log n) - 对数时间
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
```

## 排序算法

### 快速排序

```javascript
// 时间复杂度: 平均 O(n log n)，最坏 O(n²)
// 空间复杂度: O(log n)
function quickSort(arr) {
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);

  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// 原地快排（面试常考）
function quickSortInPlace(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return;

  const pivotIndex = partition(arr, left, right);
  quickSortInPlace(arr, left, pivotIndex - 1);
  quickSortInPlace(arr, pivotIndex + 1, right);
  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left;

  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}
```

### 归并排序

```javascript
// 时间复杂度: O(n log n)
// 空间复杂度: O(n)
function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}
```

## 数据结构

### 链表

```javascript
// 链表节点
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// 反转链表（高频考题）
function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  return prev;
}

// 检测环（快慢指针）
function hasCycle(head) {
  if (!head || !head.next) return false;

  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }

  return false;
}

// 合并两个有序链表
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let curr = dummy;

  while (l1 && l2) {
    if (l1.val < l2.val) {
      curr.next = l1;
      l1 = l1.next;
    } else {
      curr.next = l2;
      l2 = l2.next;
    }
    curr = curr.next;
  }

  curr.next = l1 || l2;
  return dummy.next;
}
```

### 二叉树

```javascript
// 二叉树节点
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// 前序遍历（根-左-右）
function preorder(root) {
  if (!root) return [];
  return [root.val, ...preorder(root.left), ...preorder(root.right)];
}

// 中序遍历（左-根-右）
function inorder(root) {
  if (!root) return [];
  return [...inorder(root.left), root.val, ...inorder(root.right)];
}

// 后序遍历（左-右-根）
function postorder(root) {
  if (!root) return [];
  return [...postorder(root.left), ...postorder(root.right), root.val];
}

// 层序遍历（BFS）
function levelOrder(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];

  while (queue.length) {
    const level = [];
    const size = queue.length;

    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}

// 最大深度
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// 翻转二叉树
function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}
```

### 栈和队列

```javascript
// 用栈实现队列
class MyQueue {
  constructor() {
    this.stackIn = [];
    this.stackOut = [];
  }

  push(x) {
    this.stackIn.push(x);
  }

  pop() {
    if (!this.stackOut.length) {
      while (this.stackIn.length) {
        this.stackOut.push(this.stackIn.pop());
      }
    }
    return this.stackOut.pop();
  }

  peek() {
    if (!this.stackOut.length) {
      while (this.stackIn.length) {
        this.stackOut.push(this.stackIn.pop());
      }
    }
    return this.stackOut[this.stackOut.length - 1];
  }

  empty() {
    return !this.stackIn.length && !this.stackOut.length;
  }
}

// 有效的括号
function isValid(s) {
  const stack = [];
  const map = { ')': '(', ']': '[', '}': '{' };

  for (const char of s) {
    if (char in map) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }

  return stack.length === 0;
}
```

## 常见算法思想

### 双指针

```javascript
// 两数之和（有序数组）
function twoSum(numbers, target) {
  let left = 0, right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum < target) left++;
    else right--;
  }

  return [-1, -1];
}

// 移除元素
function removeElement(nums, val) {
  let slow = 0;
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== val) {
      nums[slow++] = nums[fast];
    }
  }
  return slow;
}

// 三数之和
function threeSum(nums) {
  const result = [];
  nums.sort((a, b) => a - b);

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}
```

### 滑动窗口

```javascript
// 最长无重复字符子串
function lengthOfLongestSubstring(s) {
  const set = new Set();
  let left = 0, maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) {
      set.delete(s[left++]);
    }
    set.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// 最小覆盖子串
function minWindow(s, t) {
  const need = new Map();
  const window = new Map();

  for (const c of t) {
    need.set(c, (need.get(c) || 0) + 1);
  }

  let left = 0, right = 0;
  let valid = 0;
  let start = 0, len = Infinity;

  while (right < s.length) {
    const c = s[right++];
    if (need.has(c)) {
      window.set(c, (window.get(c) || 0) + 1);
      if (window.get(c) === need.get(c)) valid++;
    }

    while (valid === need.size) {
      if (right - left < len) {
        start = left;
        len = right - left;
      }
      const d = s[left++];
      if (need.has(d)) {
        if (window.get(d) === need.get(d)) valid--;
        window.set(d, window.get(d) - 1);
      }
    }
  }

  return len === Infinity ? '' : s.substring(start, start + len);
}
```

### 动态规划

```javascript
// 爬楼梯
function climbStairs(n) {
  if (n <= 2) return n;
  let prev = 1, curr = 2;
  for (let i = 3; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

// 最大子数组和
function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

// 最长递增子序列
function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1);

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  return Math.max(...dp);
}

// 背包问题（0-1背包）
function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = new Array(capacity + 1).fill(0);

  for (let i = 0; i < n; i++) {
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }

  return dp[capacity];
}
```

## 前端高频算法题

::: details 数组扁平化
```javascript
// 递归实现
function flatten(arr) {
  return arr.reduce((acc, val) => {
    return acc.concat(Array.isArray(val) ? flatten(val) : val);
  }, []);
}

// 指定深度
function flattenDepth(arr, depth = 1) {
  if (depth < 1) return arr;
  return arr.reduce((acc, val) => {
    return acc.concat(
      Array.isArray(val) ? flattenDepth(val, depth - 1) : val
    );
  }, []);
}

// 使用 flat
const result = arr.flat(Infinity);
```
:::

::: details 数组去重
```javascript
// Set
const unique = [...new Set(arr)];

// filter
const unique = arr.filter((item, index) => arr.indexOf(item) === index);

// reduce
const unique = arr.reduce((acc, item) => {
  return acc.includes(item) ? acc : [...acc, item];
}, []);

// 对象去重
function uniqueByKey(arr, key) {
  const map = new Map();
  return arr.filter(item => {
    if (map.has(item[key])) return false;
    map.set(item[key], true);
    return true;
  });
}
```
:::

::: details 深拷贝
```javascript
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);

  if (hash.has(obj)) return hash.get(obj);

  const clone = Array.isArray(obj) ? [] : {};
  hash.set(obj, clone);

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], hash);
    }
  }

  return clone;
}
```
:::

::: details 防抖节流
```javascript
// 防抖
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流
function throttle(fn, delay) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
```
:::

## 常见面试题

::: details 1. 数组中两数之和如何实现？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 用哈希表记录已遍历的数，查找 `target - num` 是否存在。

```javascript
// 方法一：暴力解法 O(n²)
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j]
      }
    }
  }
  return []
}

// 方法二：哈希表 O(n)
function twoSum(nums, target) {
  const map = new Map()
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    if (map.has(complement)) {
      return [map.get(complement), i]
    }
    map.set(nums[i], i)
  }
  return []
}
```

**口语化回答**:
"两数之和最优解是用哈希表。遍历数组，对于每个数，计算 `target - 当前数`，然后看这个差值之前是否出现过。如果出现过就找到答案了，如果没有就把当前数存入哈希表。时间复杂度是 O(n)，比暴力的 O(n²) 快很多。"
:::

</details>

::: details 2. 如何判断链表有环？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 快慢指针，快指针每次走两步，慢指针每次走一步，如果相遇就有环。

```javascript
function hasCycle(head) {
  if (!head || !head.next) return false

  let slow = head
  let fast = head

  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) return true
  }

  return false
}

// 找环的入口
function detectCycle(head) {
  if (!head || !head.next) return null

  let slow = head
  let fast = head

  // 第一次相遇
  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) break
  }

  if (!fast || !fast.next) return null

  // 从头开始，同速前进
  slow = head
  while (slow !== fast) {
    slow = slow.next
    fast = fast.next
  }

  return slow  // 环的入口
}
```

**口语化回答**:
"判断链表有环用快慢指针。快指针一次走两步，慢指针一次走一步，如果有环它们一定会相遇，就像在操场跑步，跑得快的会追上跑得慢的。如果快指针走到了 null，说明没环。找环的入口的话，第一次相遇后，让一个指针回到头节点，然后两个指针都一次走一步，再次相遇的点就是环的入口，这是数学推导出来的结论。"
:::

</details>

::: details 3. 反转链表怎么实现？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 用三个指针 prev、curr、next，依次反转每个节点的指向。

```javascript
// 迭代法
function reverseList(head) {
  let prev = null
  let curr = head

  while (curr) {
    const next = curr.next  // 保存下一个节点
    curr.next = prev        // 反转指向
    prev = curr             // prev 前进
    curr = next             // curr 前进
  }

  return prev  // prev 就是新的头节点
}

// 递归法
function reverseList(head) {
  if (!head || !head.next) return head

  const newHead = reverseList(head.next)
  head.next.next = head  // 反转指向
  head.next = null

  return newHead
}
```

**口语化回答**:
"反转链表的思路是把每个节点的 next 指向前一个节点。需要三个指针：prev 记录前一个，curr 是当前节点，next 是下一个。每次先保存 next，然后把 curr.next 指向 prev，再把三个指针都往前移一步。循环结束后 prev 就是新的头节点。递归写法也行，从后往前反转，让后一个节点的 next 指向当前节点。"
:::

</details>

::: details 4. 深拷贝如何实现？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 递归遍历对象，处理循环引用用 WeakMap。

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // 基本类型和 null
  if (obj === null || typeof obj !== 'object') return obj

  // 处理 Date
  if (obj instanceof Date) return new Date(obj)

  // 处理 RegExp
  if (obj instanceof RegExp) return new RegExp(obj)

  // 处理循环引用
  if (hash.has(obj)) return hash.get(obj)

  // 创建新对象/数组
  const clone = Array.isArray(obj) ? [] : {}
  hash.set(obj, clone)

  // 递归拷贝属性
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], hash)
    }
  }

  return clone
}

// 使用
const obj = { a: 1, b: { c: 2 } }
obj.self = obj  // 循环引用
const cloned = deepClone(obj)
```

**口语化回答**:
"深拷贝需要递归处理嵌套对象。首先判断是不是基本类型，是的话直接返回。然后处理特殊对象像 Date、RegExp，需要用构造函数重新创建。循环引用是个难点，用 WeakMap 记录已拷贝的对象，遇到重复的直接返回缓存的。最后递归遍历对象的每个属性，对每个值都做深拷贝。"
:::

</details>

::: details 5. 防抖和节流的区别？如何实现？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 防抖是最后一次触发后执行，节流是固定间隔执行。

```javascript
// 防抖：最后一次触发后延迟执行
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 节流：固定间隔执行一次
function throttle(fn, delay) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

// 使用场景
// 防抖：搜索框输入、窗口 resize
// 节流：滚动事件、按钮点击防重复
```

**口语化回答**:
"防抖是'等用户停止操作后再执行'，比如搜索框，用户打字的时候不请求，停下来之后才去搜索。实现就是每次触发先清掉之前的定时器，重新计时。节流是'固定时间间隔执行一次'，比如滚动事件，不管你滚多快，我每隔一段时间才处理一次。实现就是记录上次执行时间，如果间隔够了才执行。"
:::

</details>

::: details 6. 快速排序的原理是什么？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 选一个基准值，比它小的放左边，比它大的放右边，递归排序左右两边。

```javascript
// 简洁版（需要额外空间）
function quickSort(arr) {
  if (arr.length <= 1) return arr

  const pivot = arr[Math.floor(arr.length / 2)]
  const left = arr.filter(x => x < pivot)
  const middle = arr.filter(x => x === pivot)
  const right = arr.filter(x => x > pivot)

  return [...quickSort(left), ...middle, ...quickSort(right)]
}

// 原地排序版（面试常考）
function quickSort(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr

  const pivotIndex = partition(arr, left, right)
  quickSort(arr, left, pivotIndex - 1)
  quickSort(arr, pivotIndex + 1, right)

  return arr
}

function partition(arr, left, right) {
  const pivot = arr[right]  // 选最右边的作为基准
  let i = left

  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]]
      i++
    }
  }

  [arr[i], arr[right]] = [arr[right], arr[i]]
  return i
}
```

**口语化回答**:
"快排的思想是分治。先选一个基准值，然后把数组分成两部分：比基准小的放左边，比基准大的放右边。然后递归对左右两部分分别排序。平均时间复杂度是 O(n log n)，但最坏情况（已排序的数组）会退化成 O(n²)。面试的话要会写原地排序版本，不需要额外数组空间。"
:::

</details>

::: details 7. 什么是动态规划？如何分析动态规划问题？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 把大问题分解成小问题，用数组记录小问题的答案，避免重复计算。

**分析步骤**:
1. **确定状态**: dp[i] 代表什么含义
2. **确定转移方程**: dp[i] 和 dp[i-1] 的关系
3. **确定初始值**: dp[0] 或边界条件
4. **确定遍历顺序**: 从小到大还是从大到小

```javascript
// 经典例子：爬楼梯
// dp[i] = 到达第 i 阶的方法数
// 转移方程：dp[i] = dp[i-1] + dp[i-2]
function climbStairs(n) {
  if (n <= 2) return n
  let prev = 1, curr = 2

  for (let i = 3; i <= n; i++) {
    [prev, curr] = [curr, prev + curr]
  }

  return curr
}

// 最大子数组和
// dp[i] = 以 i 结尾的最大子数组和
// 转移方程：dp[i] = max(nums[i], dp[i-1] + nums[i])
function maxSubArray(nums) {
  let maxSum = nums[0]
  let curr = nums[0]

  for (let i = 1; i < nums.length; i++) {
    curr = Math.max(nums[i], curr + nums[i])
    maxSum = Math.max(maxSum, curr)
  }

  return maxSum
}
```

**口语化回答**:
"动态规划的核心是'记住已经算过的'。分析 DP 问题有四步：第一确定状态，就是 dp 数组里每个位置代表什么；第二找状态转移方程，就是当前状态怎么从前面的状态推出来；第三确定初始值；第四确定遍历顺序。比如爬楼梯，dp[i] 是到第 i 阶的方法数，可以从 i-1 跳一步上来，也可以从 i-2 跳两步上来，所以 dp[i] = dp[i-1] + dp[i-2]。"
:::

</details>

::: details 8. 二叉树的遍历方式有哪些？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 前序（根左右）、中序（左根右）、后序（左右根）、层序（BFS）。

```javascript
// 前序遍历：根 → 左 → 右
function preorder(root, result = []) {
  if (!root) return result
  result.push(root.val)
  preorder(root.left, result)
  preorder(root.right, result)
  return result
}

// 中序遍历：左 → 根 → 右
function inorder(root, result = []) {
  if (!root) return result
  inorder(root.left, result)
  result.push(root.val)
  inorder(root.right, result)
  return result
}

// 后序遍历：左 → 右 → 根
function postorder(root, result = []) {
  if (!root) return result
  postorder(root.left, result)
  postorder(root.right, result)
  result.push(root.val)
  return result
}

// 层序遍历：BFS
function levelOrder(root) {
  if (!root) return []
  const result = []
  const queue = [root]

  while (queue.length) {
    const level = []
    const size = queue.length

    for (let i = 0; i < size; i++) {
      const node = queue.shift()
      level.push(node.val)
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }

    result.push(level)
  }

  return result
}
```

**口语化回答**:
"二叉树遍历有四种：前序是根左右，中序是左根右，后序是左右根。记忆方法是'前中后'指的是根节点的位置。递归实现很简单，就是按顺序处理根节点、左子树、右子树。层序遍历用 BFS，借助队列实现，每次把一层的节点全部处理完，再处理下一层。"
:::

</details>

## 总结

::: details 常考题目类型
| 类型 | 常见题目 | 核心思想 |
|------|---------|---------|
| 数组 | 两数之和、三数之和 | 哈希表、双指针 |
| 字符串 | 最长无重复子串 | 滑动窗口 |
| 链表 | 反转链表、环检测 | 双指针 |
| 二叉树 | 遍历、深度、翻转 | 递归、BFS |
| 动态规划 | 爬楼梯、最大子数组 | 状态转移 |
| 前端特定 | 深拷贝、防抖节流 | 递归、闭包 |
:::

::: details 面试技巧
1. **先说思路**: 不要上来就写代码，先说清楚解题思路
2. **分析复杂度**: 说明时间和空间复杂度
3. **考虑边界**: 空数组、空链表、单个元素等
4. **优化方案**: 如果有更优解，主动提出来
5. **手写代码**: 变量命名规范，代码整洁
:::
