# 前端面试高频算法题

前端面试中最常考的算法题集合，难度适中，侧重实际应用。

## 排序算法（必考）

### 快速排序 ⭐⭐⭐

快排是面试最爱考的排序算法，时间复杂度 O(n log n)。

```javascript
// 方法1：简洁版（推荐记忆）
function quickSort(arr) {
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);

  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// 方法2：原地快排（更优性能）
function quickSortInPlace(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr;

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

// 测试
console.log(quickSort([5, 2, 9, 1, 7, 6])); // [1, 2, 5, 6, 7, 9]
```

**面试要点：**
- 时间复杂度：平均 O(n log n)，最坏 O(n²)
- 空间复杂度：O(log n)（递归栈）
- 不稳定排序
- 优化：三数取中选择 pivot、小数组用插入排序

---

### 冒泡排序 ⭐⭐

最简单的排序，面试常作为热身题。

```javascript
// 基础版本
function bubbleSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }

  return arr;
}

// 优化版本：提前退出
function bubbleSortOptimized(arr) {
  const n = arr.length;

  for (let i = 0; i < n; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }

    // 如果一轮没有交换，说明已经有序
    if (!swapped) break;
  }

  return arr;
}

// 测试
console.log(bubbleSort([5, 2, 9, 1, 7])); // [1, 2, 5, 7, 9]
```

**面试要点：**
- 时间复杂度：O(n²)，最好 O(n)
- 空间复杂度：O(1)
- 稳定排序
- 优化技巧：提前退出、记录最后交换位置

---

### 归并排序 ⭐⭐⭐

稳定的 O(n log n) 排序算法。

```javascript
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

// 测试
console.log(mergeSort([5, 2, 9, 1, 7, 6])); // [1, 2, 5, 6, 7, 9]
```

**面试要点：**
- 时间复杂度：O(n log n)（所有情况）
- 空间复杂度：O(n)
- 稳定排序
- 适合链表排序、外部排序

---

## 数组操作（高频）

::: details 数组去重 ⭐⭐⭐
```javascript
// 方法1：Set（最简单，推荐）
const unique1 = arr => [...new Set(arr)];

// 方法2：filter + indexOf
const unique2 = arr => arr.filter((item, index) => arr.indexOf(item) === index);

// 方法3：reduce
const unique3 = arr => arr.reduce((acc, cur) => {
  if (!acc.includes(cur)) acc.push(cur);
  return acc;
}, []);

// 方法4：Map（性能最好）
function unique4(arr) {
  const map = new Map();
  const result = [];

  for (const item of arr) {
    if (!map.has(item)) {
      map.set(item, true);
      result.push(item);
    }
  }

  return result;
}

// 对象数组去重（根据某个属性）
function uniqueByKey(arr, key) {
  const seen = new Set();
  return arr.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

// 测试
console.log(unique1([1, 2, 2, 3, 3, 4])); // [1, 2, 3, 4]

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 1, name: 'Alice' }
];
console.log(uniqueByKey(users, 'id')); // [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
```

---
:::

::: details 数组扁平化 ⭐⭐⭐
```javascript
// 方法1：flat（最简单）
const flatten1 = arr => arr.flat(Infinity);

// 方法2：递归
function flatten2(arr) {
  const result = [];

  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten2(item));
    } else {
      result.push(item);
    }
  }

  return result;
}

// 方法3：reduce
const flatten3 = arr => arr.reduce((acc, val) =>
  Array.isArray(val) ? acc.concat(flatten3(val)) : acc.concat(val), []
);

// 方法4：迭代（栈）
function flatten4(arr) {
  const stack = [...arr];
  const result = [];

  while (stack.length) {
    const item = stack.pop();
    if (Array.isArray(item)) {
      stack.push(...item);
    } else {
      result.unshift(item);
    }
  }

  return result;
}

// 指定深度扁平化
function flattenDepth(arr, depth = 1) {
  if (depth === 0) return arr.slice();

  return arr.reduce((acc, val) => {
    if (Array.isArray(val)) {
      acc.push(...flattenDepth(val, depth - 1));
    } else {
      acc.push(val);
    }
    return acc;
  }, []);
}

// 测试
console.log(flatten1([1, [2, [3, [4, 5]]]])); // [1, 2, 3, 4, 5]
console.log(flattenDepth([1, [2, [3, [4]]]], 2)); // [1, 2, 3, [4]]
```

---
:::

::: details 两数之和 ⭐⭐⭐
LeetCode 第一题，前端面试高频。

```javascript
// 方法1：哈希表（推荐）
function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }

  return [];
}

// 方法2：双层循环（暴力）
function twoSumBrute(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}

// 测试
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6)); // [1, 2]
```

**面试要点：**
- 哈希表：时间 O(n)，空间 O(n)
- 暴力：时间 O(n²)，空间 O(1)
- 变种：三数之和、四数之和

---
:::

::: details 最大子数组和 ⭐⭐⭐
经典动态规划题目。

```javascript
// 动态规划（Kadane 算法）
function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    // 当前位置的最大和：要么加上当前数，要么从当前数重新开始
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

// 返回子数组本身
function maxSubArrayWithIndices(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  let start = 0, end = 0, tempStart = 0;

  for (let i = 1; i < nums.length; i++) {
    if (currentSum < 0) {
      currentSum = nums[i];
      tempStart = i;
    } else {
      currentSum += nums[i];
    }

    if (currentSum > maxSum) {
      maxSum = currentSum;
      start = tempStart;
      end = i;
    }
  }

  return { maxSum, subArray: nums.slice(start, end + 1) };
}

// 测试
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6 ([4, -1, 2, 1])
console.log(maxSubArrayWithIndices([5, -3, 5])); // { maxSum: 7, subArray: [5, -3, 5] }
```

**面试要点：**
- 时间复杂度：O(n)
- 空间复杂度：O(1)
- 核心思想：dp[i] = Math.max(nums[i], dp[i-1] + nums[i])

---
:::

## 字符串操作（高频）

::: details 字符串反转 ⭐⭐
```javascript
// 方法1：内置方法
const reverse1 = str => str.split('').reverse().join('');

// 方法2：循环
function reverse2(str) {
  let result = '';
  for (let i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }
  return result;
}

// 方法3：递归
function reverse3(str) {
  if (str.length <= 1) return str;
  return str[str.length - 1] + reverse3(str.slice(0, -1));
}

// 方法4：双指针
function reverse4(str) {
  const arr = str.split('');
  let left = 0, right = arr.length - 1;

  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }

  return arr.join('');
}

// 测试
console.log(reverse1('hello')); // 'olleh'
```

---
:::

::: details 回文判断 ⭐⭐⭐
```javascript
// 方法1：双指针（推荐）
function isPalindrome(str) {
  // 去除非字母数字字符，转小写
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = cleaned.length - 1;

  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}

// 方法2：反转比较
function isPalindrome2(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const reversed = cleaned.split('').reverse().join('');
  return cleaned === reversed;
}

// 方法3：递归
function isPalindrome3(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');

  function check(s) {
    if (s.length <= 1) return true;
    if (s[0] !== s[s.length - 1]) return false;
    return check(s.slice(1, -1));
  }

  return check(cleaned);
}

// 测试
console.log(isPalindrome('A man, a plan, a canal: Panama')); // true
console.log(isPalindrome('race a car')); // false
```

---
:::

::: details 最长公共前缀 ⭐⭐
```javascript
// 方法1：纵向扫描
function longestCommonPrefix(strs) {
  if (!strs || strs.length === 0) return '';

  for (let i = 0; i < strs[0].length; i++) {
    const char = strs[0][i];

    for (let j = 1; j < strs.length; j++) {
      if (i === strs[j].length || strs[j][i] !== char) {
        return strs[0].substring(0, i);
      }
    }
  }

  return strs[0];
}

// 方法2：横向扫描
function longestCommonPrefix2(strs) {
  if (!strs || strs.length === 0) return '';

  let prefix = strs[0];

  for (let i = 1; i < strs.length; i++) {
    while (strs[i].indexOf(prefix) !== 0) {
      prefix = prefix.substring(0, prefix.length - 1);
      if (prefix === '') return '';
    }
  }

  return prefix;
}

// 测试
console.log(longestCommonPrefix(['flower', 'flow', 'flight'])); // 'fl'
console.log(longestCommonPrefix(['dog', 'racecar', 'car'])); // ''
```

---
:::

## 链表操作（常考）

::: details 反转链表 ⭐⭐⭐
面试最爱考的链表题。

```javascript
// 链表节点定义
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// 方法1：迭代（推荐）
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

// 方法2：递归
function reverseListRecursive(head) {
  if (!head || !head.next) return head;

  const newHead = reverseListRecursive(head.next);
  head.next.next = head;
  head.next = null;

  return newHead;
}

// 辅助函数：数组转链表
function arrayToList(arr) {
  if (!arr.length) return null;
  const head = new ListNode(arr[0]);
  let curr = head;
  for (let i = 1; i < arr.length; i++) {
    curr.next = new ListNode(arr[i]);
    curr = curr.next;
  }
  return head;
}

// 辅助函数：链表转数组
function listToArray(head) {
  const result = [];
  while (head) {
    result.push(head.val);
    head = head.next;
  }
  return result;
}

// 测试
const list = arrayToList([1, 2, 3, 4, 5]);
const reversed = reverseList(list);
console.log(listToArray(reversed)); // [5, 4, 3, 2, 1]
```

---
:::

::: details 合并两个有序链表 ⭐⭐⭐
```javascript
// 方法1：迭代
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

// 方法2：递归
function mergeTwoListsRecursive(l1, l2) {
  if (!l1) return l2;
  if (!l2) return l1;

  if (l1.val < l2.val) {
    l1.next = mergeTwoListsRecursive(l1.next, l2);
    return l1;
  } else {
    l2.next = mergeTwoListsRecursive(l1, l2.next);
    return l2;
  }
}

// 测试
const l1 = arrayToList([1, 2, 4]);
const l2 = arrayToList([1, 3, 4]);
const merged = mergeTwoLists(l1, l2);
console.log(listToArray(merged)); // [1, 1, 2, 3, 4, 4]
```

---
:::

::: details 检测链表环 ⭐⭐⭐
```javascript
// 快慢指针（Floyd 判圈算法）
function hasCycle(head) {
  if (!head || !head.next) return false;

  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      return true;
    }
  }

  return false;
}

// 找到环的起点
function detectCycle(head) {
  if (!head || !head.next) return null;

  let slow = head;
  let fast = head;
  let hasCycle = false;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      hasCycle = true;
      break;
    }
  }

  if (!hasCycle) return null;

  // 从头开始，相遇点就是环的起点
  slow = head;
  while (slow !== fast) {
    slow = slow.next;
    fast = fast.next;
  }

  return slow;
}
```

---
:::

## 二叉树操作（高频）

::: details 二叉树最大深度 ⭐⭐
```javascript
// 树节点定义
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// 方法1：递归（DFS）
function maxDepth(root) {
  if (!root) return 0;
  return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;
}

// 方法2：迭代（BFS）
function maxDepthIterative(root) {
  if (!root) return 0;

  const queue = [root];
  let depth = 0;

  while (queue.length) {
    const levelSize = queue.length;

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    depth++;
  }

  return depth;
}

// 测试
const tree = new TreeNode(3,
  new TreeNode(9),
  new TreeNode(20, new TreeNode(15), new TreeNode(7))
);
console.log(maxDepth(tree)); // 3
```

---
:::

::: details 二叉树层序遍历 ⭐⭐⭐
```javascript
// BFS 层序遍历
function levelOrder(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];

  while (queue.length) {
    const levelSize = queue.length;
    const currentLevel = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(currentLevel);
  }

  return result;
}

// 测试
console.log(levelOrder(tree)); // [[3], [9, 20], [15, 7]]
```

---
:::

::: details 翻转二叉树 ⭐⭐
```javascript
// 方法1：递归
function invertTree(root) {
  if (!root) return null;

  [root.left, root.right] = [root.right, root.left];

  invertTree(root.left);
  invertTree(root.right);

  return root;
}

// 方法2：迭代
function invertTreeIterative(root) {
  if (!root) return null;

  const queue = [root];

  while (queue.length) {
    const node = queue.shift();
    [node.left, node.right] = [node.right, node.left];

    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }

  return root;
}
```

---
:::

## 动态规划（高频）

::: details 爬楼梯 ⭐⭐
经典的入门 DP 题。

```javascript
// 方法1：动态规划（推荐）
function climbStairs(n) {
  if (n <= 2) return n;

  let prev1 = 2, prev2 = 1;

  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

// 方法2：DP 数组版本
function climbStairsDP(n) {
  if (n <= 2) return n;

  const dp = [0, 1, 2];

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}

// 方法3：递归 + 记忆化
function climbStairsMemo(n, memo = {}) {
  if (n <= 2) return n;
  if (memo[n]) return memo[n];

  memo[n] = climbStairsMemo(n - 1, memo) + climbStairsMemo(n - 2, memo);
  return memo[n];
}

// 测试
console.log(climbStairs(5)); // 8
```

---
:::

::: details 打家劫舍 ⭐⭐⭐
```javascript
// 方法1：动态规划（空间优化）
function rob(nums) {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];

  let prev1 = Math.max(nums[0], nums[1]);
  let prev2 = nums[0];

  for (let i = 2; i < nums.length; i++) {
    const curr = Math.max(prev1, prev2 + nums[i]);
    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

// 方法2：DP 数组版本
function robDP(nums) {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];

  const dp = [nums[0], Math.max(nums[0], nums[1])];

  for (let i = 2; i < nums.length; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
  }

  return dp[nums.length - 1];
}

// 测试
console.log(rob([2, 7, 9, 3, 1])); // 12 (2 + 9 + 1)
```

---
:::

## 前端特有算法（高频）

::: details 防抖（Debounce）⭐⭐⭐
```javascript
// 防抖：在事件触发 n 秒后执行，如果 n 秒内再次触发，重新计时
function debounce(func, wait) {
  let timeout;

  return function(...args) {
    const context = this;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// 支持立即执行版本
function debounceImmediate(func, wait, immediate = false) {
  let timeout;

  return function(...args) {
    const context = this;
    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
}

// 使用示例
const handleInput = debounce((e) => {
  console.log('搜索:', e.target.value);
}, 500);

// input.addEventListener('input', handleInput);
```

---
:::

::: details 节流（Throttle）⭐⭐⭐
```javascript
// 节流：n 秒内只执行一次
function throttle(func, wait) {
  let timeout;
  let previous = 0;

  return function(...args) {
    const context = this;
    const now = Date.now();

    if (now - previous >= wait) {
      func.apply(context, args);
      previous = now;
    }
  };
}

// 定时器版本
function throttleTimer(func, wait) {
  let timeout;

  return function(...args) {
    const context = this;

    if (!timeout) {
      timeout = setTimeout(() => {
        func.apply(context, args);
        timeout = null;
      }, wait);
    }
  };
}

// 使用示例
const handleScroll = throttle(() => {
  console.log('滚动位置:', window.scrollY);
}, 200);

// window.addEventListener('scroll', handleScroll);
```

---
:::

::: details 深拷贝 ⭐⭐⭐
```javascript
// 简单版本（JSON）
function deepCloneSimple(obj) {
  return JSON.parse(JSON.stringify(obj));
}
// 缺点：无法处理函数、undefined、Symbol、循环引用

// 完整版本
function deepClone(obj, hash = new WeakMap()) {
  // null 或非对象类型直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理 Date
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // 处理 RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // 创建新对象/数组
  const cloneObj = Array.isArray(obj) ? [] : {};
  hash.set(obj, cloneObj);

  // 递归拷贝
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }

  return cloneObj;
}

// 测试
const obj = {
  name: 'Alice',
  age: 25,
  hobbies: ['reading', 'coding'],
  address: { city: 'Beijing' },
  fn: () => console.log('hello')
};

obj.self = obj; // 循环引用

const cloned = deepClone(obj);
console.log(cloned);
console.log(cloned.self === cloned); // true
```

---
:::

::: details 函数柯里化 ⭐⭐⭐
```javascript
// 基础版本
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }

    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

// 使用示例
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6

// 进阶版本：支持占位符
function curryAdvanced(fn, placeholder = '_') {
  return function curried(...args) {
    // 检查参数是否足够
    const isEnough = args.length >= fn.length &&
                     args.slice(0, fn.length).every(arg => arg !== placeholder);

    if (isEnough) {
      return fn.apply(this, args);
    }

    return function(...nextArgs) {
      // 合并参数，替换占位符
      const mergedArgs = args.map(arg =>
        arg === placeholder && nextArgs.length ? nextArgs.shift() : arg
      );
      return curried(...mergedArgs, ...nextArgs);
    };
  };
}

// 使用示例
const curriedAdd2 = curryAdvanced(add);
console.log(curriedAdd2('_', 2)(1, 3)); // 6
```

---
:::

::: details LRU 缓存 ⭐⭐⭐
```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) {
      return -1;
    }

    // 移到最后（最近使用）
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  put(key, value) {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // 添加到最后
    this.cache.set(key, value);

    // 超出容量，删除最久未使用的（第一个）
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

// 测试
const lru = new LRUCache(2);
lru.put(1, 1);
lru.put(2, 2);
console.log(lru.get(1)); // 1
lru.put(3, 3); // 移除 key 2
console.log(lru.get(2)); // -1
lru.put(4, 4); // 移除 key 1
console.log(lru.get(1)); // -1
console.log(lru.get(3)); // 3
console.log(lru.get(4)); // 4
```

---
:::

::: details Promise 实现 ⭐⭐⭐
```javascript
// 简化版 Promise
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };

    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolve(x);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolve(x);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolve(x);
            } catch (error) {
              reject(error);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolve(x);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  static resolve(value) {
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let count = 0;

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            results[index] = value;
            count++;
            if (count === promises.length) {
              resolve(results);
            }
          },
          reject
        );
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }
}

// 测试
const p = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve('成功'), 1000);
});

p.then(value => {
  console.log(value); // '成功'
  return value + '!';
}).then(value => {
  console.log(value); // '成功!'
});
```

---
:::

## 面试技巧

::: details 解题步骤
1. **理解题意** - 确认输入输出、边界条件
2. **举例分析** - 用具体例子梳理思路
3. **选择算法** - 确定使用的数据结构和算法
4. **编写代码** - 先写主逻辑，再处理细节
5. **测试验证** - 考虑边界情况、特殊输入
:::

::: details 复杂度分析
- 时间复杂度：算法执行时间与输入规模的关系
- 空间复杂度：算法所需额外空间与输入规模的关系
- 常见优化：双指针、哈希表、二分查找、动态规划
:::

::: details 前端算法特点
- **难度适中** - 通常不超过 LeetCode 中等难度
- **偏向应用** - 重视实际场景（防抖节流、深拷贝等）
- **基础为主** - 数组、字符串、链表、树最常考
- **代码质量** - 注重代码可读性和边界处理
:::

::: details 高频考点总结
**必须掌握（⭐⭐⭐）：**
- 快速排序、归并排序
- 数组去重、扁平化
- 两数之和、最大子数组和
- 反转链表、合并链表、链表环检测
- 二叉树遍历、最大深度
- 防抖节流、深拷贝、柯里化
- Promise、LRU 缓存

**建议了解（⭐⭐）：**
- 冒泡排序、插入排序
- 字符串反转、回文判断
- 爬楼梯、打家劫舍
- 翻转二叉树

---
:::

## 总结

前端算法面试关键点：

1. **基础扎实** - 熟练掌握常见数据结构和算法
2. **实践为主** - 重点关注前端场景的实际应用
3. **代码质量** - 注重边界处理、命名规范、可读性
4. **复杂度意识** - 能分析时间空间复杂度，提出优化方案
5. **沟通能力** - 清晰表达思路，与面试官互动

记住：**前端面试算法不是重点，但一定要掌握基础！**

---

**推荐练习平台：**
- LeetCode（中文版）- 精选 100 题
- 牛客网 - 前端算法专题
- CodeTop - 企业题库（按公司筛选）
