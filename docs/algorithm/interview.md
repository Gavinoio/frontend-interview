# 算法面试题精选

> 汇总前端面试高频算法题：排序、数组、字符串、链表、二叉树、动态规划等。

## 排序算法

::: details 1. 手写快速排序
```javascript
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const mid = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    return [...quickSort(left), ...mid, ...quickSort(right)];
}
```

**时间复杂度**：平均 O(n log n)，最坏 O(n²)（已排序数组）

---
:::

::: details 2. 常见排序算法复杂度对比
| 算法 | 平均时间 | 最坏时间 | 空间 | 稳定性 |
|------|---------|---------|------|--------|
| 冒泡排序 | O(n²) | O(n²) | O(1) | 稳定 |
| 选择排序 | O(n²) | O(n²) | O(1) | 不稳定 |
| 插入排序 | O(n²) | O(n²) | O(1) | 稳定 |
| 归并排序 | O(n log n) | O(n log n) | O(n) | 稳定 |
| 快速排序 | O(n log n) | O(n²) | O(log n) | 不稳定 |
| 堆排序 | O(n log n) | O(n log n) | O(1) | 不稳定 |

---
:::

## 数组操作

::: details 3. 数组去重（多种方法）
```javascript
const arr = [1, 2, 2, 3, 3, 4];

// 方法1：Set（最简洁）
[...new Set(arr)];

// 方法2：filter + indexOf
arr.filter((item, index) => arr.indexOf(item) === index);

// 方法3：reduce
arr.reduce((acc, cur) => acc.includes(cur) ? acc : [...acc, cur], []);

// 对象数组按属性去重
const unique = (arr, key) => {
    const seen = new Set();
    return arr.filter(item => {
        const val = item[key];
        return seen.has(val) ? false : seen.add(val);
    });
};
```

---
:::

::: details 4. 数组扁平化
```javascript
const arr = [1, [2, [3, [4]]]];

// 方法1：原生 flat
arr.flat(Infinity);

// 方法2：递归
function flatten(arr) {
    return arr.reduce((acc, item) =>
        Array.isArray(item) ? [...acc, ...flatten(item)] : [...acc, item], []);
}

// 方法3：栈（迭代，性能好）
function flatten(arr) {
    const stack = [...arr], result = [];
    while (stack.length) {
        const item = stack.pop();
        Array.isArray(item) ? stack.push(...item) : result.unshift(item);
    }
    return result;
}
```

---
:::

::: details 5. 两数之和（LeetCode 1）
```javascript
function twoSum(nums, target) {
    const map = new Map(); // 值 → 索引
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) return [map.get(complement), i];
        map.set(nums[i], i);
    }
    return [];
}
// 时间 O(n)，空间 O(n)
```

---
:::

::: details 6. 最大子数组和（LeetCode 53，Kadane 算法）
```javascript
function maxSubArray(nums) {
    let maxSum = nums[0], currentSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}
// 时间 O(n)，空间 O(1)
```

---
:::

## 字符串操作

::: details 7. 判断回文串
```javascript
function isPalindrome(s) {
    s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    let left = 0, right = s.length - 1;
    while (left < right) {
        if (s[left] !== s[right]) return false;
        left++; right--;
    }
    return true;
}
```

---
:::

::: details 8. 最长不重复子串（LeetCode 3）
```javascript
function lengthOfLongestSubstring(s) {
    const map = new Map(); // 字符 → 最新索引
    let maxLen = 0, left = 0;
    for (let right = 0; right < s.length; right++) {
        if (map.has(s[right]) && map.get(s[right]) >= left) {
            left = map.get(s[right]) + 1; // 移动左指针
        }
        map.set(s[right], right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}
// 滑动窗口，时间 O(n)
```

---
:::

## 链表

::: details 9. 反转链表（LeetCode 206）
```javascript
function reverseList(head) {
    let prev = null, curr = head;
    while (curr) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}
// 时间 O(n)，空间 O(1)
```

---
:::

::: details 10. 判断链表是否有环（LeetCode 141，快慢指针）
```javascript
function hasCycle(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true;
    }
    return false;
}
```

---
:::

## 二叉树

::: details 11. 二叉树的三种遍历（迭代版）
```javascript
// 前序遍历（根左右）
function preorder(root) {
    if (!root) return [];
    const stack = [root], result = [];
    while (stack.length) {
        const node = stack.pop();
        result.push(node.val);
        if (node.right) stack.push(node.right);
        if (node.left) stack.push(node.left);
    }
    return result;
}

// 层序遍历（BFS）
function levelOrder(root) {
    if (!root) return [];
    const queue = [root], result = [];
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
```

---
:::

::: details 12. 二叉树最大深度（LeetCode 104）
```javascript
function maxDepth(root) {
    if (!root) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

---
:::

## 动态规划

::: details 13. 爬楼梯（LeetCode 70）
```javascript
function climbStairs(n) {
    if (n <= 2) return n;
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
}
// 斐波那契数列变体，时间 O(n)，空间 O(1)
```

---
:::

::: details 14. 背包问题（0-1 背包）
```javascript
function knapsack(weights, values, capacity) {
    const n = weights.length;
    const dp = new Array(capacity + 1).fill(0);
    for (let i = 0; i < n; i++) {
        // 从后往前遍历，防止重复选取
        for (let j = capacity; j >= weights[i]; j--) {
            dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
        }
    }
    return dp[capacity];
}
```

---
:::

## 前端特色算法

::: details 15. 实现 LRU 缓存（LeetCode 146）
```javascript
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map(); // Map 保持插入顺序
    }

    get(key) {
        if (!this.cache.has(key)) return -1;
        const val = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, val); // 移到末尾（最近使用）
        return val;
    }

    put(key, value) {
        if (this.cache.has(key)) this.cache.delete(key);
        else if (this.cache.size >= this.capacity) {
            this.cache.delete(this.cache.keys().next().value); // 删除最久未用（头部）
        }
        this.cache.set(key, value);
    }
}
```

---
:::

::: details 16. 深度优先搜索（DFS）和广度优先搜索（BFS）
```javascript
// DFS：递归或栈，适合找路径、判断连通性
function dfs(graph, start, visited = new Set()) {
    visited.add(start);
    for (const neighbor of graph[start] || []) {
        if (!visited.has(neighbor)) dfs(graph, neighbor, visited);
    }
    return visited;
}

// BFS：队列，适合找最短路径
function bfs(graph, start) {
    const queue = [start], visited = new Set([start]);
    while (queue.length) {
        const node = queue.shift();
        for (const neighbor of graph[node] || []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
    return visited;
}
```
:::
