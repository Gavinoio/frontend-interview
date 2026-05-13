# 常见算法

## 算法复杂度概述

在学习具体算法之前，我们需要理解算法复杂度的概念。

### 时间复杂度

时间复杂度描述算法执行时间与输入规模的关系。

| 复杂度 | 名称 | 示例 |
|--------|------|------|
| O(1) | 常数 | 数组访问、哈希表查找 |
| O(log n) | 对数 | 二分查找 |
| O(n) | 线性 | 线性搜索、遍历数组 |
| O(n log n) | 线性对数 | 快速排序、归并排序 |
| O(n²) | 平方 | 冒泡排序、选择排序 |
| O(2ⁿ) | 指数 | 递归斐波那契 |
| O(n!) | 阶乘 | 全排列 |

### 空间复杂度

空间复杂度描述算法所需额外空间与输入规模的关系。

```javascript
// O(1) 空间 - 原地操作
function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]]
}

// O(n) 空间 - 需要额外数组
function copyArray(arr) {
  return [...arr]
}

// O(n) 空间 - 递归调用栈
function factorial(n) {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}
```

## 排序算法

排序是最基础也是最重要的算法之一，面试中经常考察。

### 排序算法比较

| 算法 | 平均时间 | 最好时间 | 最坏时间 | 空间 | 稳定性 |
|------|----------|----------|----------|------|--------|
| 冒泡排序 | O(n²) | O(n) | O(n²) | O(1) | 稳定 |
| 选择排序 | O(n²) | O(n²) | O(n²) | O(1) | 不稳定 |
| 插入排序 | O(n²) | O(n) | O(n²) | O(1) | 稳定 |
| 希尔排序 | O(n log n) | O(n log² n) | O(n²) | O(1) | 不稳定 |
| 归并排序 | O(n log n) | O(n log n) | O(n log n) | O(n) | 稳定 |
| 快速排序 | O(n log n) | O(n log n) | O(n²) | O(log n) | 不稳定 |
| 堆排序 | O(n log n) | O(n log n) | O(n log n) | O(1) | 不稳定 |
| 计数排序 | O(n + k) | O(n + k) | O(n + k) | O(k) | 稳定 |
| 桶排序 | O(n + k) | O(n) | O(n²) | O(n + k) | 稳定 |
| 基数排序 | O(n × k) | O(n × k) | O(n × k) | O(n + k) | 稳定 |

### 冒泡排序

冒泡排序是最简单的排序算法，通过相邻元素比较和交换来排序。

```javascript
// 基础版本
function bubbleSort(arr) {
  const n = arr.length
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
      }
    }
  }
  return arr
}

// 优化版本：提前退出
function bubbleSortOptimized(arr) {
  const n = arr.length
  for (let i = 0; i < n; i++) {
    let swapped = false
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swapped = true
      }
    }
    // 如果没有发生交换，说明已经有序
    if (!swapped) break
  }
  return arr
}

// 进一步优化：记录最后交换位置
function bubbleSortBest(arr) {
  let n = arr.length
  while (n > 1) {
    let newN = 0
    for (let i = 0; i < n - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
        newN = i + 1
      }
    }
    n = newN
  }
  return arr
}
```

### 选择排序

选择排序每次从未排序部分选择最小元素放到已排序部分末尾。

```javascript
function selectionSort(arr) {
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    // 找到未排序部分的最小值
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j
      }
    }
    // 交换到已排序部分末尾
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
    }
  }
  return arr
}

// 双向选择排序（同时找最大最小）
function bidirectionalSelectionSort(arr) {
  let left = 0
  let right = arr.length - 1

  while (left < right) {
    let minIdx = left
    let maxIdx = right

    for (let i = left; i <= right; i++) {
      if (arr[i] < arr[minIdx]) minIdx = i
      if (arr[i] > arr[maxIdx]) maxIdx = i
    }

    [arr[left], arr[minIdx]] = [arr[minIdx], arr[left]]

    // 如果最大值在 left 位置，已被交换到 minIdx
    if (maxIdx === left) maxIdx = minIdx

    [arr[right], arr[maxIdx]] = [arr[maxIdx], arr[right]]

    left++
    right--
  }
  return arr
}
```

### 插入排序

插入排序将元素插入到已排序部分的正确位置。

```javascript
// 基础版本
function insertionSort(arr) {
  const n = arr.length
  for (let i = 1; i < n; i++) {
    const current = arr[i]
    let j = i - 1
    // 将比 current 大的元素后移
    while (j >= 0 && arr[j] > current) {
      arr[j + 1] = arr[j]
      j--
    }
    arr[j + 1] = current
  }
  return arr
}

// 二分插入排序
function binaryInsertionSort(arr) {
  const n = arr.length
  for (let i = 1; i < n; i++) {
    const current = arr[i]
    let left = 0
    let right = i - 1

    // 二分查找插入位置
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (arr[mid] > current) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    }

    // 移动元素
    for (let j = i - 1; j >= left; j--) {
      arr[j + 1] = arr[j]
    }
    arr[left] = current
  }
  return arr
}
```

### 希尔排序

希尔排序是插入排序的改进版，通过分组进行插入排序。

```javascript
function shellSort(arr) {
  const n = arr.length
  // 初始间隔
  let gap = Math.floor(n / 2)

  while (gap > 0) {
    // 对每个间隔进行插入排序
    for (let i = gap; i < n; i++) {
      const current = arr[i]
      let j = i

      while (j >= gap && arr[j - gap] > current) {
        arr[j] = arr[j - gap]
        j -= gap
      }
      arr[j] = current
    }
    gap = Math.floor(gap / 2)
  }
  return arr
}

// 使用更好的间隔序列（Hibbard序列）
function shellSortHibbard(arr) {
  const n = arr.length
  // 生成 Hibbard 序列：1, 3, 7, 15, 31...
  const gaps = []
  let k = 1
  while ((1 << k) - 1 < n) {
    gaps.unshift((1 << k) - 1)
    k++
  }

  for (const gap of gaps) {
    for (let i = gap; i < n; i++) {
      const current = arr[i]
      let j = i
      while (j >= gap && arr[j - gap] > current) {
        arr[j] = arr[j - gap]
        j -= gap
      }
      arr[j] = current
    }
  }
  return arr
}
```

### 归并排序

归并排序采用分治策略，将数组分成两半分别排序再合并。

```javascript
// 递归版本
function mergeSort(arr) {
  if (arr.length <= 1) return arr

  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))

  return merge(left, right)
}

function merge(left, right) {
  const result = []
  let i = 0, j = 0

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++])
    } else {
      result.push(right[j++])
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j))
}

// 原地归并排序（减少空间使用）
function mergeSortInPlace(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr

  const mid = Math.floor((left + right) / 2)
  mergeSortInPlace(arr, left, mid)
  mergeSortInPlace(arr, mid + 1, right)
  mergeInPlace(arr, left, mid, right)

  return arr
}

function mergeInPlace(arr, left, mid, right) {
  const temp = []
  let i = left, j = mid + 1

  while (i <= mid && j <= right) {
    if (arr[i] <= arr[j]) {
      temp.push(arr[i++])
    } else {
      temp.push(arr[j++])
    }
  }

  while (i <= mid) temp.push(arr[i++])
  while (j <= right) temp.push(arr[j++])

  for (let k = 0; k < temp.length; k++) {
    arr[left + k] = temp[k]
  }
}

// 迭代版本（自底向上）
function mergeSortIterative(arr) {
  const n = arr.length

  for (let size = 1; size < n; size *= 2) {
    for (let left = 0; left < n - size; left += 2 * size) {
      const mid = left + size - 1
      const right = Math.min(left + 2 * size - 1, n - 1)
      mergeInPlace(arr, left, mid, right)
    }
  }

  return arr
}
```

### 快速排序

快速排序也采用分治策略，选择基准元素将数组分成两部分。

```javascript
// 基础版本（简洁但空间复杂度高）
function quickSortSimple(arr) {
  if (arr.length <= 1) return arr

  const pivot = arr[0]
  const left = arr.slice(1).filter(x => x <= pivot)
  const right = arr.slice(1).filter(x => x > pivot)

  return [...quickSortSimple(left), pivot, ...quickSortSimple(right)]
}

// 原地快速排序
function quickSort(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr

  const pivotIndex = partition(arr, left, right)
  quickSort(arr, left, pivotIndex - 1)
  quickSort(arr, pivotIndex + 1, right)

  return arr
}

// Lomuto 分区方案
function partition(arr, left, right) {
  const pivot = arr[right]
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

// Hoare 分区方案（更高效）
function partitionHoare(arr, left, right) {
  const pivot = arr[Math.floor((left + right) / 2)]
  let i = left - 1
  let j = right + 1

  while (true) {
    do { i++ } while (arr[i] < pivot)
    do { j-- } while (arr[j] > pivot)

    if (i >= j) return j

    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

// 三路快排（处理大量重复元素）
function quickSort3Way(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr

  const pivot = arr[left]
  let lt = left      // arr[left...lt-1] < pivot
  let gt = right     // arr[gt+1...right] > pivot
  let i = left + 1   // arr[lt...i-1] === pivot

  while (i <= gt) {
    if (arr[i] < pivot) {
      [arr[lt], arr[i]] = [arr[i], arr[lt]]
      lt++
      i++
    } else if (arr[i] > pivot) {
      [arr[i], arr[gt]] = [arr[gt], arr[i]]
      gt--
    } else {
      i++
    }
  }

  quickSort3Way(arr, left, lt - 1)
  quickSort3Way(arr, gt + 1, right)

  return arr
}

// 随机化快排（避免最坏情况）
function quickSortRandom(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr

  // 随机选择基准
  const randomIdx = left + Math.floor(Math.random() * (right - left + 1))
  ;[arr[randomIdx], arr[right]] = [arr[right], arr[randomIdx]]

  const pivotIndex = partition(arr, left, right)
  quickSortRandom(arr, left, pivotIndex - 1)
  quickSortRandom(arr, pivotIndex + 1, right)

  return arr
}
```

### 堆排序

堆排序利用堆这种数据结构进行排序。

```javascript
function heapSort(arr) {
  const n = arr.length

  // 构建最大堆
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i)
  }

  // 逐个提取最大元素
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]]
    heapify(arr, i, 0)
  }

  return arr
}

function heapify(arr, n, i) {
  let largest = i
  const left = 2 * i + 1
  const right = 2 * i + 2

  if (left < n && arr[left] > arr[largest]) {
    largest = left
  }

  if (right < n && arr[right] > arr[largest]) {
    largest = right
  }

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]]
    heapify(arr, n, largest)
  }
}

// 迭代版本的 heapify
function heapifyIterative(arr, n, i) {
  while (true) {
    let largest = i
    const left = 2 * i + 1
    const right = 2 * i + 2

    if (left < n && arr[left] > arr[largest]) largest = left
    if (right < n && arr[right] > arr[largest]) largest = right

    if (largest === i) break

    [arr[i], arr[largest]] = [arr[largest], arr[i]]
    i = largest
  }
}
```

### 计数排序

计数排序适用于已知范围的整数排序。

```javascript
function countingSort(arr) {
  if (arr.length === 0) return arr

  const max = Math.max(...arr)
  const min = Math.min(...arr)
  const range = max - min + 1

  const count = new Array(range).fill(0)
  const output = new Array(arr.length)

  // 统计每个元素出现次数
  for (const num of arr) {
    count[num - min]++
  }

  // 累加计数
  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1]
  }

  // 构建输出数组（从后往前保证稳定性）
  for (let i = arr.length - 1; i >= 0; i--) {
    const idx = count[arr[i] - min] - 1
    output[idx] = arr[i]
    count[arr[i] - min]--
  }

  return output
}

// 简化版（直接输出）
function countingSortSimple(arr) {
  if (arr.length === 0) return arr

  const max = Math.max(...arr)
  const min = Math.min(...arr)
  const count = new Array(max - min + 1).fill(0)

  for (const num of arr) {
    count[num - min]++
  }

  const result = []
  for (let i = 0; i < count.length; i++) {
    while (count[i] > 0) {
      result.push(i + min)
      count[i]--
    }
  }

  return result
}
```

### 桶排序

桶排序将元素分到多个桶中，每个桶单独排序。

```javascript
function bucketSort(arr, bucketSize = 5) {
  if (arr.length === 0) return arr

  const min = Math.min(...arr)
  const max = Math.max(...arr)

  // 创建桶
  const bucketCount = Math.floor((max - min) / bucketSize) + 1
  const buckets = Array.from({ length: bucketCount }, () => [])

  // 将元素分配到桶中
  for (const num of arr) {
    const idx = Math.floor((num - min) / bucketSize)
    buckets[idx].push(num)
  }

  // 对每个桶排序并合并
  const result = []
  for (const bucket of buckets) {
    // 可以使用任何排序算法，这里用插入排序
    insertionSort(bucket)
    result.push(...bucket)
  }

  return result
}

// 处理浮点数的桶排序
function bucketSortFloat(arr, bucketCount = 10) {
  if (arr.length === 0) return arr

  const min = Math.min(...arr)
  const max = Math.max(...arr)
  const range = max - min

  const buckets = Array.from({ length: bucketCount }, () => [])

  for (const num of arr) {
    const idx = range === 0 ? 0 : Math.floor(((num - min) / range) * (bucketCount - 1))
    buckets[idx].push(num)
  }

  const result = []
  for (const bucket of buckets) {
    bucket.sort((a, b) => a - b)
    result.push(...bucket)
  }

  return result
}
```

### 基数排序

基数排序按位进行排序，从最低位到最高位。

```javascript
function radixSort(arr) {
  if (arr.length === 0) return arr

  const max = Math.max(...arr)
  let exp = 1

  while (Math.floor(max / exp) > 0) {
    countingSortByDigit(arr, exp)
    exp *= 10
  }

  return arr
}

function countingSortByDigit(arr, exp) {
  const n = arr.length
  const output = new Array(n)
  const count = new Array(10).fill(0)

  // 统计每个数字出现次数
  for (const num of arr) {
    const digit = Math.floor(num / exp) % 10
    count[digit]++
  }

  // 累加
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1]
  }

  // 构建输出数组
  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10
    output[count[digit] - 1] = arr[i]
    count[digit]--
  }

  // 复制回原数组
  for (let i = 0; i < n; i++) {
    arr[i] = output[i]
  }
}

// 支持负数的基数排序
function radixSortWithNegative(arr) {
  const negative = arr.filter(x => x < 0).map(x => -x)
  const positive = arr.filter(x => x >= 0)

  if (negative.length > 0) radixSort(negative)
  if (positive.length > 0) radixSort(positive)

  return [...negative.reverse().map(x => -x), ...positive]
}

## 搜索算法

搜索算法用于在数据集中查找特定元素。

### 线性搜索

最简单的搜索方式，逐个遍历元素。

```javascript
// 基础线性搜索
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i
  }
  return -1
}

// 查找所有匹配项
function linearSearchAll(arr, target) {
  const result = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) result.push(i)
  }
  return result
}

// 带条件的搜索
function findIndex(arr, predicate) {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i, arr)) return i
  }
  return -1
}

// 从后往前搜索
function linearSearchLast(arr, target) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === target) return i
  }
  return -1
}
```

### 二分查找

二分查找要求数组有序，每次将搜索范围缩小一半。

```javascript
// 基础二分查找
function binarySearch(arr, target) {
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  return -1
}

// 递归版本
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
  if (left > right) return -1

  const mid = Math.floor((left + right) / 2)
  if (arr[mid] === target) return mid
  if (arr[mid] < target) {
    return binarySearchRecursive(arr, target, mid + 1, right)
  }
  return binarySearchRecursive(arr, target, left, mid - 1)
}

// 查找第一个等于目标的位置（左边界）
function binarySearchFirst(arr, target) {
  let left = 0
  let right = arr.length - 1
  let result = -1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] === target) {
      result = mid
      right = mid - 1 // 继续向左找
    } else if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  return result
}

// 查找最后一个等于目标的位置（右边界）
function binarySearchLast(arr, target) {
  let left = 0
  let right = arr.length - 1
  let result = -1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] === target) {
      result = mid
      left = mid + 1 // 继续向右找
    } else if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  return result
}

// 查找第一个大于等于目标的位置
function lowerBound(arr, target) {
  let left = 0
  let right = arr.length

  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid
    }
  }
  return left
}

// 查找第一个大于目标的位置
function upperBound(arr, target) {
  let left = 0
  let right = arr.length

  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] <= target) {
      left = mid + 1
    } else {
      right = mid
    }
  }
  return left
}

// 查找插入位置
function searchInsertPosition(arr, target) {
  let left = 0
  let right = arr.length

  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid
    }
  }
  return left
}

// 在旋转排序数组中搜索
function searchInRotatedArray(arr, target) {
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] === target) return mid

    // 判断哪一半是有序的
    if (arr[left] <= arr[mid]) {
      // 左半部分有序
      if (arr[left] <= target && target < arr[mid]) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    } else {
      // 右半部分有序
      if (arr[mid] < target && target <= arr[right]) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
  }
  return -1
}

// 查找峰值元素
function findPeakElement(arr) {
  let left = 0
  let right = arr.length - 1

  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] > arr[mid + 1]) {
      right = mid
    } else {
      left = mid + 1
    }
  }
  return left
}

// 在二维矩阵中搜索（每行每列有序）
function searchMatrix(matrix, target) {
  if (!matrix.length || !matrix[0].length) return false

  let row = 0
  let col = matrix[0].length - 1

  while (row < matrix.length && col >= 0) {
    if (matrix[row][col] === target) {
      return true
    } else if (matrix[row][col] > target) {
      col--
    } else {
      row++
    }
  }
  return false
}

// 求平方根（整数部分）
function mySqrt(x) {
  if (x < 2) return x

  let left = 1
  let right = Math.floor(x / 2)

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const square = mid * mid

    if (square === x) {
      return mid
    } else if (square < x) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  return right
}
```

### 跳跃搜索

跳跃搜索是线性搜索和二分搜索的折中方案。

```javascript
function jumpSearch(arr, target) {
  const n = arr.length
  const step = Math.floor(Math.sqrt(n))

  let prev = 0
  let curr = step

  // 找到目标可能所在的块
  while (curr < n && arr[curr] < target) {
    prev = curr
    curr += step
  }

  // 在块内线性搜索
  for (let i = prev; i < Math.min(curr, n); i++) {
    if (arr[i] === target) return i
  }

  return -1
}
```

### 插值搜索

插值搜索根据目标值的大小估计位置，适用于均匀分布的数据。

```javascript
function interpolationSearch(arr, target) {
  let left = 0
  let right = arr.length - 1

  while (left <= right && target >= arr[left] && target <= arr[right]) {
    if (left === right) {
      return arr[left] === target ? left : -1
    }

    // 估计位置
    const pos = left + Math.floor(
      ((target - arr[left]) * (right - left)) / (arr[right] - arr[left])
    )

    if (arr[pos] === target) {
      return pos
    } else if (arr[pos] < target) {
      left = pos + 1
    } else {
      right = pos - 1
    }
  }

  return -1
}
```

### 指数搜索

指数搜索先找到目标可能在的范围，再使用二分搜索。

```javascript
function exponentialSearch(arr, target) {
  if (arr[0] === target) return 0

  let bound = 1
  while (bound < arr.length && arr[bound] < target) {
    bound *= 2
  }

  // 在找到的范围内二分搜索
  const left = Math.floor(bound / 2)
  const right = Math.min(bound, arr.length - 1)

  return binarySearchRange(arr, target, left, right)
}

function binarySearchRange(arr, target, left, right) {
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  return -1
}

## 链表算法

链表是面试中的高频考点，掌握常见的链表操作非常重要。

### 链表节点定义

```javascript
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val
    this.next = next
  }
}

// 创建链表辅助函数
function createLinkedList(arr) {
  const dummy = new ListNode()
  let curr = dummy
  for (const val of arr) {
    curr.next = new ListNode(val)
    curr = curr.next
  }
  return dummy.next
}

// 链表转数组
function linkedListToArray(head) {
  const result = []
  while (head) {
    result.push(head.val)
    head = head.next
  }
  return result
}
```

### 反转链表

```javascript
// 迭代法反转
function reverseList(head) {
  let prev = null
  let curr = head

  while (curr) {
    const next = curr.next
    curr.next = prev
    prev = curr
    curr = next
  }

  return prev
}

// 递归法反转
function reverseListRecursive(head) {
  if (!head || !head.next) return head

  const newHead = reverseListRecursive(head.next)
  head.next.next = head
  head.next = null

  return newHead
}

// 反转链表的一部分（从第 m 到第 n 个节点）
function reverseBetween(head, m, n) {
  const dummy = new ListNode(0)
  dummy.next = head
  let prev = dummy

  // 移动到第 m-1 个节点
  for (let i = 1; i < m; i++) {
    prev = prev.next
  }

  // 反转从 m 到 n 的节点
  let curr = prev.next
  for (let i = m; i < n; i++) {
    const next = curr.next
    curr.next = next.next
    next.next = prev.next
    prev.next = next
  }

  return dummy.next
}

// 每 k 个节点反转
function reverseKGroup(head, k) {
  const dummy = new ListNode(0)
  dummy.next = head
  let prevGroupEnd = dummy

  while (true) {
    // 检查是否还有 k 个节点
    let kth = prevGroupEnd
    for (let i = 0; i < k; i++) {
      kth = kth.next
      if (!kth) return dummy.next
    }

    const groupStart = prevGroupEnd.next
    const nextGroupStart = kth.next

    // 反转当前组
    let prev = nextGroupStart
    let curr = groupStart
    while (curr !== nextGroupStart) {
      const next = curr.next
      curr.next = prev
      prev = curr
      curr = next
    }

    prevGroupEnd.next = kth
    prevGroupEnd = groupStart
  }
}
```

### 合并链表

```javascript
// 合并两个有序链表
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode()
  let curr = dummy

  while (l1 && l2) {
    if (l1.val <= l2.val) {
      curr.next = l1
      l1 = l1.next
    } else {
      curr.next = l2
      l2 = l2.next
    }
    curr = curr.next
  }

  curr.next = l1 || l2
  return dummy.next
}

// 递归合并
function mergeTwoListsRecursive(l1, l2) {
  if (!l1) return l2
  if (!l2) return l1

  if (l1.val <= l2.val) {
    l1.next = mergeTwoListsRecursive(l1.next, l2)
    return l1
  } else {
    l2.next = mergeTwoListsRecursive(l1, l2.next)
    return l2
  }
}

// 合并 k 个有序链表（分治法）
function mergeKLists(lists) {
  if (!lists || lists.length === 0) return null
  if (lists.length === 1) return lists[0]

  const mid = Math.floor(lists.length / 2)
  const left = mergeKLists(lists.slice(0, mid))
  const right = mergeKLists(lists.slice(mid))

  return mergeTwoLists(left, right)
}

// 合并 k 个有序链表（优先队列）
function mergeKListsWithHeap(lists) {
  const minHeap = new MinHeap((a, b) => a.val - b.val)

  for (const list of lists) {
    if (list) minHeap.insert(list)
  }

  const dummy = new ListNode()
  let curr = dummy

  while (minHeap.size() > 0) {
    const node = minHeap.extract()
    curr.next = node
    curr = curr.next

    if (node.next) {
      minHeap.insert(node.next)
    }
  }

  return dummy.next
}
```

### 链表环检测

```javascript
// 检测链表是否有环
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

// 找到环的入口节点
function detectCycle(head) {
  if (!head || !head.next) return null

  let slow = head
  let fast = head

  // 找到相遇点
  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) break
  }

  if (!fast || !fast.next) return null

  // 找环的入口
  slow = head
  while (slow !== fast) {
    slow = slow.next
    fast = fast.next
  }

  return slow
}

// 计算环的长度
function cycleLength(head) {
  const cycleStart = detectCycle(head)
  if (!cycleStart) return 0

  let length = 1
  let curr = cycleStart.next
  while (curr !== cycleStart) {
    length++
    curr = curr.next
  }

  return length
}
```

### 查找链表节点

```javascript
// 找到链表的中间节点
function middleNode(head) {
  let slow = head
  let fast = head

  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
  }

  return slow
}

// 找到倒数第 k 个节点
function getKthFromEnd(head, k) {
  let fast = head
  let slow = head

  // fast 先走 k 步
  for (let i = 0; i < k; i++) {
    if (!fast) return null
    fast = fast.next
  }

  // 同时移动直到 fast 到达末尾
  while (fast) {
    fast = fast.next
    slow = slow.next
  }

  return slow
}

// 找到两个链表的交点
function getIntersectionNode(headA, headB) {
  if (!headA || !headB) return null

  let pA = headA
  let pB = headB

  while (pA !== pB) {
    pA = pA ? pA.next : headB
    pB = pB ? pB.next : headA
  }

  return pA
}
```

### 删除链表节点

```javascript
// 删除链表中的节点（给定要删除的节点）
function deleteNode(node) {
  node.val = node.next.val
  node.next = node.next.next
}

// 删除链表的倒数第 n 个节点
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0)
  dummy.next = head

  let fast = dummy
  let slow = dummy

  // fast 先走 n+1 步
  for (let i = 0; i <= n; i++) {
    fast = fast.next
  }

  // 同时移动
  while (fast) {
    fast = fast.next
    slow = slow.next
  }

  slow.next = slow.next.next
  return dummy.next
}

// 删除排序链表中的重复元素（保留一个）
function deleteDuplicates(head) {
  let curr = head

  while (curr && curr.next) {
    if (curr.val === curr.next.val) {
      curr.next = curr.next.next
    } else {
      curr = curr.next
    }
  }

  return head
}

// 删除排序链表中的重复元素（全部删除）
function deleteDuplicatesII(head) {
  const dummy = new ListNode(0)
  dummy.next = head
  let prev = dummy

  while (prev.next) {
    let curr = prev.next
    // 找到重复序列的末尾
    while (curr.next && curr.val === curr.next.val) {
      curr = curr.next
    }

    if (prev.next === curr) {
      // 没有重复
      prev = prev.next
    } else {
      // 跳过所有重复节点
      prev.next = curr.next
    }
  }

  return dummy.next
}
```

### 其他链表操作

```javascript
// 判断回文链表
function isPalindrome(head) {
  if (!head || !head.next) return true

  // 找到中点
  let slow = head
  let fast = head
  while (fast.next && fast.next.next) {
    slow = slow.next
    fast = fast.next.next
  }

  // 反转后半部分
  let secondHalf = reverseList(slow.next)
  let firstHalf = head

  // 比较
  while (secondHalf) {
    if (firstHalf.val !== secondHalf.val) return false
    firstHalf = firstHalf.next
    secondHalf = secondHalf.next
  }

  return true
}

// 重排链表 L0→L1→...→Ln-1→Ln 变为 L0→Ln→L1→Ln-1→L2→Ln-2→...
function reorderList(head) {
  if (!head || !head.next) return

  // 找中点
  let slow = head
  let fast = head
  while (fast.next && fast.next.next) {
    slow = slow.next
    fast = fast.next.next
  }

  // 反转后半部分
  let second = reverseList(slow.next)
  slow.next = null
  let first = head

  // 交替合并
  while (second) {
    const temp1 = first.next
    const temp2 = second.next

    first.next = second
    second.next = temp1

    first = temp1
    second = temp2
  }
}

// 旋转链表
function rotateRight(head, k) {
  if (!head || !head.next || k === 0) return head

  // 计算长度并连成环
  let length = 1
  let tail = head
  while (tail.next) {
    length++
    tail = tail.next
  }
  tail.next = head

  // 找到新的头节点
  k = k % length
  const stepsToNewHead = length - k
  let newTail = head
  for (let i = 1; i < stepsToNewHead; i++) {
    newTail = newTail.next
  }

  const newHead = newTail.next
  newTail.next = null

  return newHead
}

// 奇偶链表（将奇数位置节点放在前面，偶数位置节点放在后面）
function oddEvenList(head) {
  if (!head || !head.next) return head

  let odd = head
  let even = head.next
  const evenHead = even

  while (even && even.next) {
    odd.next = even.next
    odd = odd.next
    even.next = odd.next
    even = even.next
  }

  odd.next = evenHead
  return head
}

// 分隔链表（小于 x 的在前，大于等于 x 的在后）
function partition(head, x) {
  const beforeHead = new ListNode(0)
  const afterHead = new ListNode(0)
  let before = beforeHead
  let after = afterHead

  while (head) {
    if (head.val < x) {
      before.next = head
      before = before.next
    } else {
      after.next = head
      after = after.next
    }
    head = head.next
  }

  after.next = null
  before.next = afterHead.next

  return beforeHead.next
}

// 两数相加（链表表示的数字）
function addTwoNumbers(l1, l2) {
  const dummy = new ListNode()
  let curr = dummy
  let carry = 0

  while (l1 || l2 || carry) {
    const sum = (l1?.val || 0) + (l2?.val || 0) + carry
    carry = Math.floor(sum / 10)
    curr.next = new ListNode(sum % 10)
    curr = curr.next

    l1 = l1?.next
    l2 = l2?.next
  }

  return dummy.next
}

// 复制带随机指针的链表
function copyRandomList(head) {
  if (!head) return null

  const map = new Map()

  // 第一遍：创建所有节点
  let curr = head
  while (curr) {
    map.set(curr, new Node(curr.val))
    curr = curr.next
  }

  // 第二遍：连接 next 和 random
  curr = head
  while (curr) {
    const copy = map.get(curr)
    copy.next = map.get(curr.next) || null
    copy.random = map.get(curr.random) || null
    curr = curr.next
  }

  return map.get(head)
}

## 树算法

树是面试中的重点数据结构，尤其是二叉树的各种操作。

### 二叉树节点定义

```javascript
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val
    this.left = left
    this.right = right
  }
}

// 从数组构建二叉树（层序）
function buildTree(arr) {
  if (!arr || arr.length === 0 || arr[0] === null) return null

  const root = new TreeNode(arr[0])
  const queue = [root]
  let i = 1

  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()

    if (i < arr.length && arr[i] !== null) {
      node.left = new TreeNode(arr[i])
      queue.push(node.left)
    }
    i++

    if (i < arr.length && arr[i] !== null) {
      node.right = new TreeNode(arr[i])
      queue.push(node.right)
    }
    i++
  }

  return root
}
```

### 二叉树遍历

```javascript
// ============ 递归遍历 ============

// 前序遍历（根-左-右）
function preorderRecursive(root) {
  if (!root) return []
  return [root.val, ...preorderRecursive(root.left), ...preorderRecursive(root.right)]
}

// 中序遍历（左-根-右）
function inorderRecursive(root) {
  if (!root) return []
  return [...inorderRecursive(root.left), root.val, ...inorderRecursive(root.right)]
}

// 后序遍历（左-右-根）
function postorderRecursive(root) {
  if (!root) return []
  return [...postorderRecursive(root.left), ...postorderRecursive(root.right), root.val]
}

// ============ 迭代遍历 ============

// 前序遍历（迭代）
function preorderIterative(root) {
  if (!root) return []

  const result = []
  const stack = [root]

  while (stack.length > 0) {
    const node = stack.pop()
    result.push(node.val)

    // 先压右子节点，再压左子节点
    if (node.right) stack.push(node.right)
    if (node.left) stack.push(node.left)
  }

  return result
}

// 中序遍历（迭代）
function inorderIterative(root) {
  const result = []
  const stack = []
  let curr = root

  while (curr || stack.length > 0) {
    // 一直向左走
    while (curr) {
      stack.push(curr)
      curr = curr.left
    }

    curr = stack.pop()
    result.push(curr.val)
    curr = curr.right
  }

  return result
}

// 后序遍历（迭代）
function postorderIterative(root) {
  if (!root) return []

  const result = []
  const stack = [root]

  while (stack.length > 0) {
    const node = stack.pop()
    result.unshift(node.val) // 从前面插入

    // 先压左子节点，再压右子节点
    if (node.left) stack.push(node.left)
    if (node.right) stack.push(node.right)
  }

  return result
}

// 后序遍历（迭代，标记法）
function postorderIterativeWithFlag(root) {
  if (!root) return []

  const result = []
  const stack = []
  let curr = root
  let lastVisited = null

  while (curr || stack.length > 0) {
    while (curr) {
      stack.push(curr)
      curr = curr.left
    }

    const peek = stack[stack.length - 1]

    if (peek.right && peek.right !== lastVisited) {
      curr = peek.right
    } else {
      result.push(peek.val)
      lastVisited = stack.pop()
    }
  }

  return result
}

// ============ Morris 遍历（O(1) 空间）============

// Morris 中序遍历
function morrisInorder(root) {
  const result = []
  let curr = root

  while (curr) {
    if (!curr.left) {
      result.push(curr.val)
      curr = curr.right
    } else {
      // 找到前驱节点
      let predecessor = curr.left
      while (predecessor.right && predecessor.right !== curr) {
        predecessor = predecessor.right
      }

      if (!predecessor.right) {
        // 建立线索
        predecessor.right = curr
        curr = curr.left
      } else {
        // 删除线索
        predecessor.right = null
        result.push(curr.val)
        curr = curr.right
      }
    }
  }

  return result
}

// Morris 前序遍历
function morrisPreorder(root) {
  const result = []
  let curr = root

  while (curr) {
    if (!curr.left) {
      result.push(curr.val)
      curr = curr.right
    } else {
      let predecessor = curr.left
      while (predecessor.right && predecessor.right !== curr) {
        predecessor = predecessor.right
      }

      if (!predecessor.right) {
        result.push(curr.val) // 访问节点
        predecessor.right = curr
        curr = curr.left
      } else {
        predecessor.right = null
        curr = curr.right
      }
    }
  }

  return result
}

// ============ 层序遍历 ============

// 基础层序遍历
function levelOrder(root) {
  if (!root) return []

  const result = []
  const queue = [root]

  while (queue.length > 0) {
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

// 自底向上层序遍历
function levelOrderBottom(root) {
  if (!root) return []

  const result = []
  const queue = [root]

  while (queue.length > 0) {
    const level = []
    const size = queue.length

    for (let i = 0; i < size; i++) {
      const node = queue.shift()
      level.push(node.val)

      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }

    result.unshift(level) // 从前面插入
  }

  return result
}

// 锯齿形层序遍历
function zigzagLevelOrder(root) {
  if (!root) return []

  const result = []
  const queue = [root]
  let leftToRight = true

  while (queue.length > 0) {
    const level = []
    const size = queue.length

    for (let i = 0; i < size; i++) {
      const node = queue.shift()

      if (leftToRight) {
        level.push(node.val)
      } else {
        level.unshift(node.val)
      }

      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }

    result.push(level)
    leftToRight = !leftToRight
  }

  return result
}

// 右视图
function rightSideView(root) {
  if (!root) return []

  const result = []
  const queue = [root]

  while (queue.length > 0) {
    const size = queue.length

    for (let i = 0; i < size; i++) {
      const node = queue.shift()

      if (i === size - 1) {
        result.push(node.val)
      }

      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
  }

  return result
}
```

### 二叉树属性

```javascript
// 最大深度
function maxDepth(root) {
  if (!root) return 0
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
}

// 最大深度（迭代）
function maxDepthIterative(root) {
  if (!root) return 0

  let depth = 0
  const queue = [root]

  while (queue.length > 0) {
    depth++
    const size = queue.length

    for (let i = 0; i < size; i++) {
      const node = queue.shift()
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
  }

  return depth
}

// 最小深度
function minDepth(root) {
  if (!root) return 0
  if (!root.left) return 1 + minDepth(root.right)
  if (!root.right) return 1 + minDepth(root.left)
  return 1 + Math.min(minDepth(root.left), minDepth(root.right))
}

// 节点数量
function countNodes(root) {
  if (!root) return 0
  return 1 + countNodes(root.left) + countNodes(root.right)
}

// 判断平衡二叉树
function isBalanced(root) {
  function getHeight(node) {
    if (!node) return 0

    const leftHeight = getHeight(node.left)
    if (leftHeight === -1) return -1

    const rightHeight = getHeight(node.right)
    if (rightHeight === -1) return -1

    if (Math.abs(leftHeight - rightHeight) > 1) return -1

    return 1 + Math.max(leftHeight, rightHeight)
  }

  return getHeight(root) !== -1
}

// 判断对称二叉树
function isSymmetric(root) {
  function isMirror(left, right) {
    if (!left && !right) return true
    if (!left || !right) return false
    return left.val === right.val &&
           isMirror(left.left, right.right) &&
           isMirror(left.right, right.left)
  }

  return isMirror(root, root)
}

// 判断相同的树
function isSameTree(p, q) {
  if (!p && !q) return true
  if (!p || !q) return false
  return p.val === q.val &&
         isSameTree(p.left, q.left) &&
         isSameTree(p.right, q.right)
}

// 判断子树
function isSubtree(root, subRoot) {
  if (!root) return false
  if (isSameTree(root, subRoot)) return true
  return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot)
}

// 二叉树的直径
function diameterOfBinaryTree(root) {
  let diameter = 0

  function depth(node) {
    if (!node) return 0

    const left = depth(node.left)
    const right = depth(node.right)

    diameter = Math.max(diameter, left + right)

    return 1 + Math.max(left, right)
  }

  depth(root)
  return diameter
}
```

### 二叉树路径

```javascript
// 二叉树的所有路径
function binaryTreePaths(root) {
  const result = []

  function dfs(node, path) {
    if (!node) return

    path.push(node.val)

    if (!node.left && !node.right) {
      result.push(path.join('->'))
    } else {
      dfs(node.left, [...path])
      dfs(node.right, [...path])
    }
  }

  dfs(root, [])
  return result
}

// 路径总和
function hasPathSum(root, targetSum) {
  if (!root) return false

  if (!root.left && !root.right) {
    return root.val === targetSum
  }

  return hasPathSum(root.left, targetSum - root.val) ||
         hasPathSum(root.right, targetSum - root.val)
}

// 路径总和 II（找出所有路径）
function pathSum(root, targetSum) {
  const result = []

  function dfs(node, sum, path) {
    if (!node) return

    path.push(node.val)
    sum -= node.val

    if (!node.left && !node.right && sum === 0) {
      result.push([...path])
    }

    dfs(node.left, sum, path)
    dfs(node.right, sum, path)

    path.pop()
  }

  dfs(root, targetSum, [])
  return result
}

// 路径总和 III（任意起点和终点）
function pathSumIII(root, targetSum) {
  const prefixSums = new Map([[0, 1]])
  let count = 0

  function dfs(node, currentSum) {
    if (!node) return

    currentSum += node.val

    // 检查是否存在满足条件的前缀和
    count += prefixSums.get(currentSum - targetSum) || 0

    // 更新前缀和
    prefixSums.set(currentSum, (prefixSums.get(currentSum) || 0) + 1)

    dfs(node.left, currentSum)
    dfs(node.right, currentSum)

    // 回溯
    prefixSums.set(currentSum, prefixSums.get(currentSum) - 1)
  }

  dfs(root, 0)
  return count
}

// 二叉树的最大路径和
function maxPathSum(root) {
  let maxSum = -Infinity

  function dfs(node) {
    if (!node) return 0

    // 计算左右子树的最大贡献值（负值视为0）
    const left = Math.max(0, dfs(node.left))
    const right = Math.max(0, dfs(node.right))

    // 更新最大路径和
    maxSum = Math.max(maxSum, node.val + left + right)

    // 返回当前节点的最大贡献值
    return node.val + Math.max(left, right)
  }

  dfs(root)
  return maxSum
}
```

### 二叉搜索树（BST）

```javascript
// 验证二叉搜索树
function isValidBST(root) {
  function validate(node, min, max) {
    if (!node) return true

    if (node.val <= min || node.val >= max) return false

    return validate(node.left, min, node.val) &&
           validate(node.right, node.val, max)
  }

  return validate(root, -Infinity, Infinity)
}

// BST 搜索
function searchBST(root, val) {
  if (!root || root.val === val) return root

  if (val < root.val) {
    return searchBST(root.left, val)
  }
  return searchBST(root.right, val)
}

// BST 插入
function insertIntoBST(root, val) {
  if (!root) return new TreeNode(val)

  if (val < root.val) {
    root.left = insertIntoBST(root.left, val)
  } else {
    root.right = insertIntoBST(root.right, val)
  }

  return root
}

// BST 删除
function deleteNode(root, key) {
  if (!root) return null

  if (key < root.val) {
    root.left = deleteNode(root.left, key)
  } else if (key > root.val) {
    root.right = deleteNode(root.right, key)
  } else {
    // 找到要删除的节点
    if (!root.left) return root.right
    if (!root.right) return root.left

    // 找到右子树的最小节点
    let minNode = root.right
    while (minNode.left) {
      minNode = minNode.left
    }

    root.val = minNode.val
    root.right = deleteNode(root.right, minNode.val)
  }

  return root
}

// BST 第 k 小元素
function kthSmallest(root, k) {
  const stack = []
  let curr = root

  while (curr || stack.length > 0) {
    while (curr) {
      stack.push(curr)
      curr = curr.left
    }

    curr = stack.pop()
    k--

    if (k === 0) return curr.val

    curr = curr.right
  }

  return -1
}

// 二叉搜索树的最近公共祖先
function lowestCommonAncestorBST(root, p, q) {
  while (root) {
    if (p.val < root.val && q.val < root.val) {
      root = root.left
    } else if (p.val > root.val && q.val > root.val) {
      root = root.right
    } else {
      return root
    }
  }
  return null
}

// 有序数组转 BST
function sortedArrayToBST(nums) {
  function build(left, right) {
    if (left > right) return null

    const mid = Math.floor((left + right) / 2)
    const node = new TreeNode(nums[mid])

    node.left = build(left, mid - 1)
    node.right = build(mid + 1, right)

    return node
  }

  return build(0, nums.length - 1)
}

// BST 转有序双向链表
function treeToDoublyList(root) {
  if (!root) return null

  let first = null
  let last = null

  function inorder(node) {
    if (!node) return

    inorder(node.left)

    if (last) {
      last.right = node
      node.left = last
    } else {
      first = node
    }
    last = node

    inorder(node.right)
  }

  inorder(root)

  // 连接首尾
  first.left = last
  last.right = first

  return first
}
```

### 二叉树构建和操作

```javascript
// 从前序和中序构建二叉树
function buildTreeFromPreIn(preorder, inorder) {
  const map = new Map()
  inorder.forEach((val, idx) => map.set(val, idx))

  function build(preStart, preEnd, inStart, inEnd) {
    if (preStart > preEnd) return null

    const rootVal = preorder[preStart]
    const root = new TreeNode(rootVal)
    const rootIndex = map.get(rootVal)
    const leftSize = rootIndex - inStart

    root.left = build(preStart + 1, preStart + leftSize, inStart, rootIndex - 1)
    root.right = build(preStart + leftSize + 1, preEnd, rootIndex + 1, inEnd)

    return root
  }

  return build(0, preorder.length - 1, 0, inorder.length - 1)
}

// 从中序和后序构建二叉树
function buildTreeFromInPost(inorder, postorder) {
  const map = new Map()
  inorder.forEach((val, idx) => map.set(val, idx))

  function build(inStart, inEnd, postStart, postEnd) {
    if (inStart > inEnd) return null

    const rootVal = postorder[postEnd]
    const root = new TreeNode(rootVal)
    const rootIndex = map.get(rootVal)
    const leftSize = rootIndex - inStart

    root.left = build(inStart, rootIndex - 1, postStart, postStart + leftSize - 1)
    root.right = build(rootIndex + 1, inEnd, postStart + leftSize, postEnd - 1)

    return root
  }

  return build(0, inorder.length - 1, 0, postorder.length - 1)
}

// 翻转二叉树
function invertTree(root) {
  if (!root) return null

  const left = invertTree(root.left)
  const right = invertTree(root.right)

  root.left = right
  root.right = left

  return root
}

// 二叉树展开为链表
function flatten(root) {
  let prev = null

  function flattenNode(node) {
    if (!node) return

    flattenNode(node.right)
    flattenNode(node.left)

    node.right = prev
    node.left = null
    prev = node
  }

  flattenNode(root)
}

// 最近公共祖先
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root

  const left = lowestCommonAncestor(root.left, p, q)
  const right = lowestCommonAncestor(root.right, p, q)

  if (left && right) return root
  return left || right
}

// 序列化和反序列化二叉树
function serialize(root) {
  if (!root) return 'null'
  return `${root.val},${serialize(root.left)},${serialize(root.right)}`
}

function deserialize(data) {
  const nodes = data.split(',')
  let index = 0

  function build() {
    if (nodes[index] === 'null') {
      index++
      return null
    }

    const node = new TreeNode(parseInt(nodes[index++]))
    node.left = build()
    node.right = build()

    return node
  }

  return build()
}
```

## 动态规划

动态规划是解决最优化问题的重要方法，核心思想是将问题分解为子问题。

### 动态规划基础

```javascript
// ============ 斐波那契数列 ============

// 递归（效率低）
function fibRecursive(n) {
  if (n <= 1) return n
  return fibRecursive(n - 1) + fibRecursive(n - 2)
}

// 记忆化递归
function fibMemo(n, memo = {}) {
  if (n <= 1) return n
  if (memo[n]) return memo[n]
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo)
  return memo[n]
}

// 动态规划
function fibDP(n) {
  if (n <= 1) return n
  const dp = [0, 1]
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]
  }
  return dp[n]
}

// 空间优化
function fibOptimized(n) {
  if (n <= 1) return n
  let prev = 0, curr = 1
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr]
  }
  return curr
}

// ============ 爬楼梯 ============

function climbStairs(n) {
  if (n <= 2) return n
  let prev = 1, curr = 2
  for (let i = 3; i <= n; i++) {
    [prev, curr] = [curr, prev + curr]
  }
  return curr
}

// 泛化：一次可以爬 1~k 步
function climbStairsK(n, k) {
  const dp = new Array(n + 1).fill(0)
  dp[0] = 1
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= k && j <= i; j++) {
      dp[i] += dp[i - j]
    }
  }
  return dp[n]
}
```

### 背包问题

```javascript
// ============ 0-1 背包 ============

function knapsack01(weights, values, capacity) {
  const n = weights.length
  // dp[i][w] 表示前 i 个物品，容量为 w 时的最大价值
  const dp = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0)
  )

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i - 1][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1]
        )
      } else {
        dp[i][w] = dp[i - 1][w]
      }
    }
  }

  return dp[n][capacity]
}

// 空间优化（一维数组）
function knapsack01Optimized(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0)

  for (let i = 0; i < weights.length; i++) {
    // 必须逆序遍历
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i])
    }
  }

  return dp[capacity]
}

// ============ 完全背包 ============

function knapsackComplete(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0)

  for (let i = 0; i < weights.length; i++) {
    // 正序遍历（与 0-1 背包的区别）
    for (let w = weights[i]; w <= capacity; w++) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i])
    }
  }

  return dp[capacity]
}

// ============ 分割等和子集（0-1 背包变体）============

function canPartition(nums) {
  const sum = nums.reduce((a, b) => a + b, 0)
  if (sum % 2 !== 0) return false

  const target = sum / 2
  const dp = new Array(target + 1).fill(false)
  dp[0] = true

  for (const num of nums) {
    for (let j = target; j >= num; j--) {
      dp[j] = dp[j] || dp[j - num]
    }
  }

  return dp[target]
}

// ============ 零钱兑换（完全背包变体）============

// 最少硬币数
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0

  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - coin] + 1)
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount]
}

// 组合数（顺序无关）
function coinChangeII(coins, amount) {
  const dp = new Array(amount + 1).fill(0)
  dp[0] = 1

  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] += dp[i - coin]
    }
  }

  return dp[amount]
}

// 排列数（顺序有关）
function combinationSum4(nums, target) {
  const dp = new Array(target + 1).fill(0)
  dp[0] = 1

  for (let i = 1; i <= target; i++) {
    for (const num of nums) {
      if (i >= num) {
        dp[i] += dp[i - num]
      }
    }
  }

  return dp[target]
}
```

### 字符串动态规划

```javascript
// ============ 最长公共子序列 ============

function longestCommonSubsequence(text1, text2) {
  const m = text1.length
  const n = text2.length
  const dp = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  return dp[m][n]
}

// ============ 最长公共子串 ============

function longestCommonSubstring(text1, text2) {
  const m = text1.length
  const n = text2.length
  const dp = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )
  let maxLen = 0

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
        maxLen = Math.max(maxLen, dp[i][j])
      }
    }
  }

  return maxLen
}

// ============ 编辑距离 ============

function minDistance(word1, word2) {
  const m = word1.length
  const n = word2.length
  const dp = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )

  // 初始化
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // 删除
          dp[i][j - 1],     // 插入
          dp[i - 1][j - 1]  // 替换
        )
      }
    }
  }

  return dp[m][n]
}

// ============ 最长回文子序列 ============

function longestPalindromeSubseq(s) {
  const n = s.length
  const dp = Array.from({ length: n }, () => new Array(n).fill(0))

  // 单个字符是长度为 1 的回文
  for (let i = 0; i < n; i++) {
    dp[i][i] = 1
  }

  // 从短到长遍历
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1
      if (s[i] === s[j]) {
        dp[i][j] = dp[i + 1][j - 1] + 2
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1])
      }
    }
  }

  return dp[0][n - 1]
}

// ============ 最长回文子串 ============

function longestPalindrome(s) {
  const n = s.length
  if (n < 2) return s

  let start = 0
  let maxLen = 1
  const dp = Array.from({ length: n }, () => new Array(n).fill(false))

  // 单个字符是回文
  for (let i = 0; i < n; i++) {
    dp[i][i] = true
  }

  // 从短到长遍历
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1

      if (s[i] === s[j]) {
        if (len === 2 || dp[i + 1][j - 1]) {
          dp[i][j] = true
          if (len > maxLen) {
            maxLen = len
            start = i
          }
        }
      }
    }
  }

  return s.substring(start, start + maxLen)
}

// 中心扩展法（更优）
function longestPalindromeExpand(s) {
  if (s.length < 2) return s

  let start = 0
  let maxLen = 1

  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      if (right - left + 1 > maxLen) {
        maxLen = right - left + 1
        start = left
      }
      left--
      right++
    }
  }

  for (let i = 0; i < s.length; i++) {
    expandAroundCenter(i, i)     // 奇数长度
    expandAroundCenter(i, i + 1) // 偶数长度
  }

  return s.substring(start, start + maxLen)
}

// ============ 正则表达式匹配 ============

function isMatch(s, p) {
  const m = s.length
  const n = p.length
  const dp = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(false)
  )

  dp[0][0] = true

  // 处理 a* 可以匹配空字符串的情况
  for (let j = 2; j <= n; j += 2) {
    if (p[j - 1] === '*') {
      dp[0][j] = dp[0][j - 2]
    }
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === '*') {
        // * 匹配 0 次或多次
        dp[i][j] = dp[i][j - 2] || // 匹配 0 次
          (dp[i - 1][j] && (s[i - 1] === p[j - 2] || p[j - 2] === '.'))
      } else if (p[j - 1] === '.' || s[i - 1] === p[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      }
    }
  }

  return dp[m][n]
}
```

### 序列动态规划

```javascript
// ============ 最长递增子序列 ============

// O(n²) 解法
function lengthOfLIS(nums) {
  const n = nums.length
  const dp = new Array(n).fill(1)

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1)
      }
    }
  }

  return Math.max(...dp)
}

// O(n log n) 解法（贪心 + 二分）
function lengthOfLISOptimized(nums) {
  const tails = []

  for (const num of nums) {
    let left = 0
    let right = tails.length

    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      if (tails[mid] < num) {
        left = mid + 1
      } else {
        right = mid
      }
    }

    if (left === tails.length) {
      tails.push(num)
    } else {
      tails[left] = num
    }
  }

  return tails.length
}

// ============ 最大子数组和 ============

function maxSubArray(nums) {
  let maxSum = nums[0]
  let currentSum = nums[0]

  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i])
    maxSum = Math.max(maxSum, currentSum)
  }

  return maxSum
}

// 返回子数组本身
function maxSubArrayWithIndices(nums) {
  let maxSum = nums[0]
  let currentSum = nums[0]
  let start = 0, end = 0, tempStart = 0

  for (let i = 1; i < nums.length; i++) {
    if (currentSum < 0) {
      currentSum = nums[i]
      tempStart = i
    } else {
      currentSum += nums[i]
    }

    if (currentSum > maxSum) {
      maxSum = currentSum
      start = tempStart
      end = i
    }
  }

  return {
    sum: maxSum,
    subarray: nums.slice(start, end + 1)
  }
}

// ============ 乘积最大子数组 ============

function maxProduct(nums) {
  let maxProd = nums[0]
  let minProd = nums[0]
  let result = nums[0]

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] < 0) {
      [maxProd, minProd] = [minProd, maxProd]
    }

    maxProd = Math.max(nums[i], maxProd * nums[i])
    minProd = Math.min(nums[i], minProd * nums[i])

    result = Math.max(result, maxProd)
  }

  return result
}

// ============ 打家劫舍 ============

// 基础版
function rob(nums) {
  if (nums.length === 0) return 0
  if (nums.length === 1) return nums[0]

  let prev = 0
  let curr = 0

  for (const num of nums) {
    [prev, curr] = [curr, Math.max(curr, prev + num)]
  }

  return curr
}

// 环形（首尾相连）
function robCircular(nums) {
  if (nums.length === 1) return nums[0]

  function robRange(start, end) {
    let prev = 0, curr = 0
    for (let i = start; i <= end; i++) {
      [prev, curr] = [curr, Math.max(curr, prev + nums[i])]
    }
    return curr
  }

  return Math.max(
    robRange(0, nums.length - 2),
    robRange(1, nums.length - 1)
  )
}

// 树形
function robTree(root) {
  function dfs(node) {
    if (!node) return [0, 0] // [不偷, 偷]

    const left = dfs(node.left)
    const right = dfs(node.right)

    // 不偷当前节点：子节点可偷可不偷
    const notRob = Math.max(left[0], left[1]) + Math.max(right[0], right[1])
    // 偷当前节点：子节点不能偷
    const rob = node.val + left[0] + right[0]

    return [notRob, rob]
  }

  const result = dfs(root)
  return Math.max(result[0], result[1])
}
```

### 区间动态规划

```javascript
// ============ 戳气球 ============

function maxCoins(nums) {
  const n = nums.length
  // 添加边界
  const arr = [1, ...nums, 1]
  const dp = Array.from({ length: n + 2 }, () =>
    new Array(n + 2).fill(0)
  )

  // 从短区间到长区间
  for (let len = 1; len <= n; len++) {
    for (let left = 1; left <= n - len + 1; left++) {
      const right = left + len - 1
      // 枚举最后戳破的气球
      for (let k = left; k <= right; k++) {
        dp[left][right] = Math.max(
          dp[left][right],
          dp[left][k - 1] + arr[left - 1] * arr[k] * arr[right + 1] + dp[k + 1][right]
        )
      }
    }
  }

  return dp[1][n]
}

// ============ 矩阵链乘法 ============

function matrixChainOrder(dimensions) {
  const n = dimensions.length - 1
  const dp = Array.from({ length: n }, () => new Array(n).fill(0))

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1
      dp[i][j] = Infinity

      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k + 1][j] +
          dimensions[i] * dimensions[k + 1] * dimensions[j + 1]
        dp[i][j] = Math.min(dp[i][j], cost)
      }
    }
  }

  return dp[0][n - 1]
}

// ============ 最小路径和 ============

function minPathSum(grid) {
  const m = grid.length
  const n = grid[0].length
  const dp = Array.from({ length: m }, () => new Array(n).fill(0))

  dp[0][0] = grid[0][0]

  // 初始化第一行和第一列
  for (let i = 1; i < m; i++) {
    dp[i][0] = dp[i - 1][0] + grid[i][0]
  }
  for (let j = 1; j < n; j++) {
    dp[0][j] = dp[0][j - 1] + grid[0][j]
  }

  // 填充其余位置
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]
    }
  }

  return dp[m - 1][n - 1]
}

// ============ 不同路径 ============

function uniquePaths(m, n) {
  const dp = Array.from({ length: m }, () => new Array(n).fill(1))

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
    }
  }

  return dp[m - 1][n - 1]
}

// 有障碍物
function uniquePathsWithObstacles(grid) {
  const m = grid.length
  const n = grid[0].length
  const dp = Array.from({ length: m }, () => new Array(n).fill(0))

  // 初始化
  for (let i = 0; i < m && grid[i][0] === 0; i++) {
    dp[i][0] = 1
  }
  for (let j = 0; j < n && grid[0][j] === 0; j++) {
    dp[0][j] = 1
  }

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (grid[i][j] === 0) {
        dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
      }
    }
  }

  return dp[m - 1][n - 1]
}
```

## 回溯算法

回溯算法是一种暴力搜索方法，通过递归尝试所有可能的解。

### 回溯模板

```javascript
function backtrack(路径, 选择列表) {
  if (满足结束条件) {
    result.push(路径)
    return
  }

  for (const 选择 of 选择列表) {
    // 做选择
    路径.push(选择)
    // 递归
    backtrack(路径, 选择列表)
    // 撤销选择
    路径.pop()
  }
}
```

### 排列组合

```javascript
// ============ 全排列 ============

function permute(nums) {
  const result = []

  function backtrack(path, used) {
    if (path.length === nums.length) {
      result.push([...path])
      return
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue

      path.push(nums[i])
      used[i] = true
      backtrack(path, used)
      path.pop()
      used[i] = false
    }
  }

  backtrack([], new Array(nums.length).fill(false))
  return result
}

// 有重复元素的全排列
function permuteUnique(nums) {
  const result = []
  nums.sort((a, b) => a - b)

  function backtrack(path, used) {
    if (path.length === nums.length) {
      result.push([...path])
      return
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue
      // 跳过重复元素
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue

      path.push(nums[i])
      used[i] = true
      backtrack(path, used)
      path.pop()
      used[i] = false
    }
  }

  backtrack([], new Array(nums.length).fill(false))
  return result
}

// ============ 组合 ============

function combine(n, k) {
  const result = []

  function backtrack(start, path) {
    if (path.length === k) {
      result.push([...path])
      return
    }

    // 剪枝：剩余元素不够
    for (let i = start; i <= n - (k - path.length) + 1; i++) {
      path.push(i)
      backtrack(i + 1, path)
      path.pop()
    }
  }

  backtrack(1, [])
  return result
}

// ============ 组合总和 ============

// 元素可重复使用
function combinationSum(candidates, target) {
  const result = []

  function backtrack(start, path, sum) {
    if (sum === target) {
      result.push([...path])
      return
    }
    if (sum > target) return

    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i])
      backtrack(i, path, sum + candidates[i]) // i 不变，可重复使用
      path.pop()
    }
  }

  backtrack(0, [], 0)
  return result
}

// 元素不可重复使用
function combinationSum2(candidates, target) {
  const result = []
  candidates.sort((a, b) => a - b)

  function backtrack(start, path, sum) {
    if (sum === target) {
      result.push([...path])
      return
    }
    if (sum > target) return

    for (let i = start; i < candidates.length; i++) {
      // 跳过同一层的重复元素
      if (i > start && candidates[i] === candidates[i - 1]) continue

      path.push(candidates[i])
      backtrack(i + 1, path, sum + candidates[i])
      path.pop()
    }
  }

  backtrack(0, [], 0)
  return result
}

// ============ 子集 ============

function subsets(nums) {
  const result = []

  function backtrack(start, path) {
    result.push([...path])

    for (let i = start; i < nums.length; i++) {
      path.push(nums[i])
      backtrack(i + 1, path)
      path.pop()
    }
  }

  backtrack(0, [])
  return result
}

// 有重复元素的子集
function subsetsWithDup(nums) {
  const result = []
  nums.sort((a, b) => a - b)

  function backtrack(start, path) {
    result.push([...path])

    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue

      path.push(nums[i])
      backtrack(i + 1, path)
      path.pop()
    }
  }

  backtrack(0, [])
  return result
}
```

### 经典回溯问题

```javascript
// ============ N 皇后 ============

function solveNQueens(n) {
  const result = []
  const board = Array.from({ length: n }, () => new Array(n).fill('.'))

  function isValid(row, col) {
    // 检查列
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 'Q') return false
    }
    // 检查左上对角线
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 'Q') return false
    }
    // 检查右上对角线
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (board[i][j] === 'Q') return false
    }
    return true
  }

  function backtrack(row) {
    if (row === n) {
      result.push(board.map(r => r.join('')))
      return
    }

    for (let col = 0; col < n; col++) {
      if (!isValid(row, col)) continue

      board[row][col] = 'Q'
      backtrack(row + 1)
      board[row][col] = '.'
    }
  }

  backtrack(0)
  return result
}

// ============ 数独 ============

function solveSudoku(board) {
  function isValid(row, col, num) {
    // 检查行
    for (let j = 0; j < 9; j++) {
      if (board[row][j] === num) return false
    }
    // 检查列
    for (let i = 0; i < 9; i++) {
      if (board[i][col] === num) return false
    }
    // 检查 3x3 宫格
    const startRow = Math.floor(row / 3) * 3
    const startCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[startRow + i][startCol + j] === num) return false
      }
    }
    return true
  }

  function backtrack() {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== '.') continue

        for (let num = 1; num <= 9; num++) {
          const char = num.toString()
          if (!isValid(i, j, char)) continue

          board[i][j] = char
          if (backtrack()) return true
          board[i][j] = '.'
        }
        return false
      }
    }
    return true
  }

  backtrack()
}

// ============ 单词搜索 ============

function exist(board, word) {
  const m = board.length
  const n = board[0].length
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]

  function backtrack(i, j, k) {
    if (k === word.length) return true
    if (i < 0 || i >= m || j < 0 || j >= n) return false
    if (board[i][j] !== word[k]) return false

    const temp = board[i][j]
    board[i][j] = '#' // 标记已访问

    for (const [di, dj] of directions) {
      if (backtrack(i + di, j + dj, k + 1)) return true
    }

    board[i][j] = temp // 恢复
    return false
  }

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (backtrack(i, j, 0)) return true
    }
  }
  return false
}

// ============ 括号生成 ============

function generateParenthesis(n) {
  const result = []

  function backtrack(path, open, close) {
    if (path.length === 2 * n) {
      result.push(path)
      return
    }

    if (open < n) {
      backtrack(path + '(', open + 1, close)
    }
    if (close < open) {
      backtrack(path + ')', open, close + 1)
    }
  }

  backtrack('', 0, 0)
  return result
}

// ============ 电话号码的字母组合 ============

function letterCombinations(digits) {
  if (!digits) return []

  const map = {
    '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
    '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
  }
  const result = []

  function backtrack(index, path) {
    if (index === digits.length) {
      result.push(path)
      return
    }

    const letters = map[digits[index]]
    for (const letter of letters) {
      backtrack(index + 1, path + letter)
    }
  }

  backtrack(0, '')
  return result
}

// ============ 分割回文串 ============

function partitionPalindrome(s) {
  const result = []

  function isPalindrome(str, left, right) {
    while (left < right) {
      if (str[left] !== str[right]) return false
      left++
      right--
    }
    return true
  }

  function backtrack(start, path) {
    if (start === s.length) {
      result.push([...path])
      return
    }

    for (let end = start; end < s.length; end++) {
      if (!isPalindrome(s, start, end)) continue

      path.push(s.substring(start, end + 1))
      backtrack(end + 1, path)
      path.pop()
    }
  }

  backtrack(0, [])
  return result
}

// ============ 复原 IP 地址 ============

function restoreIpAddresses(s) {
  const result = []

  function isValid(str) {
    if (str.length > 1 && str[0] === '0') return false
    const num = parseInt(str)
    return num >= 0 && num <= 255
  }

  function backtrack(start, path) {
    if (path.length === 4) {
      if (start === s.length) {
        result.push(path.join('.'))
      }
      return
    }

    for (let len = 1; len <= 3; len++) {
      if (start + len > s.length) break

      const segment = s.substring(start, start + len)
      if (!isValid(segment)) continue

      path.push(segment)
      backtrack(start + len, path)
      path.pop()
    }
  }

  backtrack(0, [])
  return result
}
```

## 贪心算法

贪心算法在每一步选择中都采取当前状态下最好的选择。

```javascript
// ============ 跳跃游戏 ============

function canJump(nums) {
  let maxReach = 0

  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false
    maxReach = Math.max(maxReach, i + nums[i])
  }

  return true
}

// 最少跳跃次数
function jump(nums) {
  let jumps = 0
  let currentEnd = 0
  let farthest = 0

  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i])

    if (i === currentEnd) {
      jumps++
      currentEnd = farthest
    }
  }

  return jumps
}

// ============ 区间调度 ============

// 无重叠区间的最大数量
function eraseOverlapIntervals(intervals) {
  if (intervals.length === 0) return 0

  // 按结束时间排序
  intervals.sort((a, b) => a[1] - b[1])

  let count = 1
  let end = intervals[0][1]

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] >= end) {
      count++
      end = intervals[i][1]
    }
  }

  return intervals.length - count
}

// 合并区间
function mergeIntervals(intervals) {
  if (intervals.length === 0) return []

  intervals.sort((a, b) => a[0] - b[0])
  const result = [intervals[0]]

  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1]

    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1])
    } else {
      result.push(intervals[i])
    }
  }

  return result
}

// 插入区间
function insertInterval(intervals, newInterval) {
  const result = []
  let i = 0

  // 添加所有在新区间之前的区间
  while (i < intervals.length && intervals[i][1] < newInterval[0]) {
    result.push(intervals[i])
    i++
  }

  // 合并重叠区间
  while (i < intervals.length && intervals[i][0] <= newInterval[1]) {
    newInterval[0] = Math.min(newInterval[0], intervals[i][0])
    newInterval[1] = Math.max(newInterval[1], intervals[i][1])
    i++
  }
  result.push(newInterval)

  // 添加剩余区间
  while (i < intervals.length) {
    result.push(intervals[i])
    i++
  }

  return result
}

// ============ 分配问题 ============

// 分发饼干
function findContentChildren(g, s) {
  g.sort((a, b) => a - b) // 孩子胃口
  s.sort((a, b) => a - b) // 饼干大小

  let child = 0
  let cookie = 0

  while (child < g.length && cookie < s.length) {
    if (s[cookie] >= g[child]) {
      child++
    }
    cookie++
  }

  return child
}

// 分发糖果
function candy(ratings) {
  const n = ratings.length
  const candies = new Array(n).fill(1)

  // 从左到右
  for (let i = 1; i < n; i++) {
    if (ratings[i] > ratings[i - 1]) {
      candies[i] = candies[i - 1] + 1
    }
  }

  // 从右到左
  for (let i = n - 2; i >= 0; i--) {
    if (ratings[i] > ratings[i + 1]) {
      candies[i] = Math.max(candies[i], candies[i + 1] + 1)
    }
  }

  return candies.reduce((a, b) => a + b, 0)
}

// ============ 股票买卖 ============

// 只能交易一次
function maxProfitOnce(prices) {
  let minPrice = Infinity
  let maxProfit = 0

  for (const price of prices) {
    minPrice = Math.min(minPrice, price)
    maxProfit = Math.max(maxProfit, price - minPrice)
  }

  return maxProfit
}

// 可以交易多次
function maxProfitMultiple(prices) {
  let profit = 0

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      profit += prices[i] - prices[i - 1]
    }
  }

  return profit
}

// 有冷冻期
function maxProfitWithCooldown(prices) {
  const n = prices.length
  if (n < 2) return 0

  // hold: 持有股票
  // sold: 刚卖出（冷冻期）
  // rest: 不持有股票（非冷冻期）
  let hold = -prices[0]
  let sold = 0
  let rest = 0

  for (let i = 1; i < n; i++) {
    const prevHold = hold
    const prevSold = sold
    const prevRest = rest

    hold = Math.max(prevHold, prevRest - prices[i])
    sold = prevHold + prices[i]
    rest = Math.max(prevRest, prevSold)
  }

  return Math.max(sold, rest)
}

// ============ 加油站 ============

function canCompleteCircuit(gas, cost) {
  let totalTank = 0
  let currentTank = 0
  let startStation = 0

  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i]
    totalTank += diff
    currentTank += diff

    if (currentTank < 0) {
      startStation = i + 1
      currentTank = 0
    }
  }

  return totalTank >= 0 ? startStation : -1
}

// ============ 任务调度器 ============

function leastInterval(tasks, n) {
  const freq = new Array(26).fill(0)
  for (const task of tasks) {
    freq[task.charCodeAt(0) - 65]++
  }

  freq.sort((a, b) => b - a)
  const maxFreq = freq[0]

  // 计算有多少任务的频率等于最大频率
  let maxCount = 0
  for (const f of freq) {
    if (f === maxFreq) maxCount++
    else break
  }

  // 最少需要的时间
  const minTime = (maxFreq - 1) * (n + 1) + maxCount

  return Math.max(minTime, tasks.length)
}
```

## 双指针和滑动窗口

### 双指针

```javascript
// ============ 两数之和（有序数组）============

function twoSumSorted(numbers, target) {
  let left = 0
  let right = numbers.length - 1

  while (left < right) {
    const sum = numbers[left] + numbers[right]
    if (sum === target) {
      return [left + 1, right + 1]
    } else if (sum < target) {
      left++
    } else {
      right--
    }
  }

  return [-1, -1]
}

// ============ 三数之和 ============

function threeSum(nums) {
  const result = []
  nums.sort((a, b) => a - b)

  for (let i = 0; i < nums.length - 2; i++) {
    // 跳过重复
    if (i > 0 && nums[i] === nums[i - 1]) continue

    let left = i + 1
    let right = nums.length - 1

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right]

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]])
        // 跳过重复
        while (left < right && nums[left] === nums[left + 1]) left++
        while (left < right && nums[right] === nums[right - 1]) right--
        left++
        right--
      } else if (sum < 0) {
        left++
      } else {
        right--
      }
    }
  }

  return result
}

// ============ 盛最多水的容器 ============

function maxArea(height) {
  let left = 0
  let right = height.length - 1
  let maxArea = 0

  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left)
    maxArea = Math.max(maxArea, area)

    if (height[left] < height[right]) {
      left++
    } else {
      right--
    }
  }

  return maxArea
}

// ============ 接雨水 ============

function trap(height) {
  let left = 0
  let right = height.length - 1
  let leftMax = 0
  let rightMax = 0
  let water = 0

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left]
      } else {
        water += leftMax - height[left]
      }
      left++
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right]
      } else {
        water += rightMax - height[right]
      }
      right--
    }
  }

  return water
}

// ============ 移除元素 ============

function removeElement(nums, val) {
  let slow = 0

  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== val) {
      nums[slow++] = nums[fast]
    }
  }

  return slow
}

// ============ 删除有序数组中的重复项 ============

function removeDuplicates(nums) {
  if (nums.length === 0) return 0

  let slow = 0

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      nums[++slow] = nums[fast]
    }
  }

  return slow + 1
}

// 最多保留 k 个重复
function removeDuplicatesK(nums, k) {
  if (nums.length <= k) return nums.length

  let slow = k

  for (let fast = k; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow - k]) {
      nums[slow++] = nums[fast]
    }
  }

  return slow
}
```

### 滑动窗口

```javascript
// ============ 滑动窗口模板 ============

function slidingWindowTemplate(s, t) {
  const need = new Map()
  const window = new Map()

  for (const c of t) {
    need.set(c, (need.get(c) || 0) + 1)
  }

  let left = 0
  let right = 0
  let valid = 0

  while (right < s.length) {
    const c = s[right]
    right++

    // 更新窗口数据
    // ...

    while (需要收缩窗口) {
      const d = s[left]
      left++

      // 更新窗口数据
      // ...
    }
  }
}

// ============ 最小覆盖子串 ============

function minWindow(s, t) {
  const need = new Map()
  const window = new Map()

  for (const c of t) {
    need.set(c, (need.get(c) || 0) + 1)
  }

  let left = 0
  let right = 0
  let valid = 0
  let start = 0
  let len = Infinity

  while (right < s.length) {
    const c = s[right]
    right++

    if (need.has(c)) {
      window.set(c, (window.get(c) || 0) + 1)
      if (window.get(c) === need.get(c)) {
        valid++
      }
    }

    while (valid === need.size) {
      if (right - left < len) {
        start = left
        len = right - left
      }

      const d = s[left]
      left++

      if (need.has(d)) {
        if (window.get(d) === need.get(d)) {
          valid--
        }
        window.set(d, window.get(d) - 1)
      }
    }
  }

  return len === Infinity ? '' : s.substring(start, start + len)
}

// ============ 找到字符串中所有字母异位词 ============

function findAnagrams(s, p) {
  const result = []
  const need = new Map()
  const window = new Map()

  for (const c of p) {
    need.set(c, (need.get(c) || 0) + 1)
  }

  let left = 0
  let right = 0
  let valid = 0

  while (right < s.length) {
    const c = s[right]
    right++

    if (need.has(c)) {
      window.set(c, (window.get(c) || 0) + 1)
      if (window.get(c) === need.get(c)) {
        valid++
      }
    }

    while (right - left >= p.length) {
      if (valid === need.size) {
        result.push(left)
      }

      const d = s[left]
      left++

      if (need.has(d)) {
        if (window.get(d) === need.get(d)) {
          valid--
        }
        window.set(d, window.get(d) - 1)
      }
    }
  }

  return result
}

// ============ 无重复字符的最长子串 ============

function lengthOfLongestSubstring(s) {
  const window = new Set()
  let left = 0
  let maxLen = 0

  for (let right = 0; right < s.length; right++) {
    while (window.has(s[right])) {
      window.delete(s[left])
      left++
    }
    window.add(s[right])
    maxLen = Math.max(maxLen, right - left + 1)
  }

  return maxLen
}

// ============ 长度最小的子数组 ============

function minSubArrayLen(target, nums) {
  let left = 0
  let sum = 0
  let minLen = Infinity

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right]

    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1)
      sum -= nums[left]
      left++
    }
  }

  return minLen === Infinity ? 0 : minLen
}

// ============ 滑动窗口最大值 ============

function maxSlidingWindow(nums, k) {
  const result = []
  const deque = [] // 存储索引，保持递减

  for (let i = 0; i < nums.length; i++) {
    // 移除超出窗口的元素
    if (deque.length > 0 && deque[0] <= i - k) {
      deque.shift()
    }

    // 保持递减，移除比当前元素小的
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop()
    }

    deque.push(i)

    // 窗口已形成
    if (i >= k - 1) {
      result.push(nums[deque[0]])
    }
  }

  return result
}
```

## 面试高频问题

::: details 数学问题
```javascript
// ============ 最大公约数和最小公倍数 ============

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b)
}

function lcm(a, b) {
  return (a * b) / gcd(a, b)
}

// ============ 判断素数 ============

function isPrime(n) {
  if (n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false

  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false
  }
  return true
}

// 埃拉托斯特尼筛法
function sieveOfEratosthenes(n) {
  const isPrime = new Array(n + 1).fill(true)
  isPrime[0] = isPrime[1] = false

  for (let i = 2; i * i <= n; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j <= n; j += i) {
        isPrime[j] = false
      }
    }
  }

  return isPrime
    .map((val, idx) => val ? idx : -1)
    .filter(val => val !== -1)
}

// ============ 快速幂 ============

function quickPow(base, exp, mod = Infinity) {
  let result = 1

  while (exp > 0) {
    if (exp & 1) {
      result = (result * base) % mod
    }
    base = (base * base) % mod
    exp >>= 1
  }

  return result
}

// ============ 整数反转 ============

function reverse(x) {
  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)

  let result = 0
  while (x > 0) {
    result = result * 10 + (x % 10)
    x = Math.floor(x / 10)
  }

  result *= sign

  // 检查溢出
  if (result < -(2 ** 31) || result > 2 ** 31 - 1) {
    return 0
  }

  return result
}

// ============ 回文数 ============

function isPalindromeNumber(x) {
  if (x < 0 || (x % 10 === 0 && x !== 0)) return false

  let reversed = 0
  while (x > reversed) {
    reversed = reversed * 10 + (x % 10)
    x = Math.floor(x / 10)
  }

  return x === reversed || x === Math.floor(reversed / 10)
}

// ============ 阶乘尾部零的数量 ============

function trailingZeroes(n) {
  let count = 0
  while (n >= 5) {
    n = Math.floor(n / 5)
    count += n
  }
  return count
}

// ============ x 的平方根 ============

function mySqrt(x) {
  if (x < 2) return x

  let left = 1
  let right = Math.floor(x / 2)

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const square = mid * mid

    if (square === x) {
      return mid
    } else if (square < x) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return right
}

// 牛顿迭代法
function mySqrtNewton(x) {
  if (x < 2) return x

  let guess = x / 2
  while (Math.abs(guess * guess - x) > 0.0001) {
    guess = (guess + x / guess) / 2
  }

  return Math.floor(guess)
}
```
:::

::: details 位运算
```javascript
// ============ 只出现一次的数字 ============

// 其他数字出现两次
function singleNumber(nums) {
  return nums.reduce((a, b) => a ^ b, 0)
}

// 其他数字出现三次
function singleNumberII(nums) {
  let ones = 0
  let twos = 0

  for (const num of nums) {
    ones = (ones ^ num) & ~twos
    twos = (twos ^ num) & ~ones
  }

  return ones
}

// ============ 位计数 ============

function countBits(n) {
  const result = new Array(n + 1).fill(0)

  for (let i = 1; i <= n; i++) {
    // result[i] = result[i >> 1] + (i & 1)
    result[i] = result[i & (i - 1)] + 1
  }

  return result
}

// 汉明重量
function hammingWeight(n) {
  let count = 0
  while (n !== 0) {
    count++
    n &= n - 1
  }
  return count
}

// ============ 2 的幂 ============

function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0
}

// ============ 位操作实现加法 ============

function getSum(a, b) {
  while (b !== 0) {
    const carry = (a & b) << 1
    a = a ^ b
    b = carry
  }
  return a
}

// ============ 缺失数字 ============

function missingNumber(nums) {
  let result = nums.length

  for (let i = 0; i < nums.length; i++) {
    result ^= i ^ nums[i]
  }

  return result
}
```
:::

::: details 字符串处理
```javascript
// ============ 字符串转整数 ============

function myAtoi(s) {
  const INT_MAX = 2 ** 31 - 1
  const INT_MIN = -(2 ** 31)

  let i = 0
  const n = s.length

  // 跳过空格
  while (i < n && s[i] === ' ') i++

  if (i === n) return 0

  // 处理符号
  let sign = 1
  if (s[i] === '-' || s[i] === '+') {
    sign = s[i] === '-' ? -1 : 1
    i++
  }

  // 处理数字
  let result = 0
  while (i < n && s[i] >= '0' && s[i] <= '9') {
    const digit = s[i].charCodeAt(0) - '0'.charCodeAt(0)

    // 检查溢出
    if (result > Math.floor((INT_MAX - digit) / 10)) {
      return sign === 1 ? INT_MAX : INT_MIN
    }

    result = result * 10 + digit
    i++
  }

  return sign * result
}

// ============ 字符串相乘 ============

function multiply(num1, num2) {
  const m = num1.length
  const n = num2.length
  const result = new Array(m + n).fill(0)

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const mul = (num1[i] - '0') * (num2[j] - '0')
      const p1 = i + j
      const p2 = i + j + 1
      const sum = mul + result[p2]

      result[p2] = sum % 10
      result[p1] += Math.floor(sum / 10)
    }
  }

  // 去除前导零
  let str = result.join('')
  str = str.replace(/^0+/, '') || '0'

  return str
}

// ============ 比较版本号 ============

function compareVersion(version1, version2) {
  const v1 = version1.split('.')
  const v2 = version2.split('.')
  const len = Math.max(v1.length, v2.length)

  for (let i = 0; i < len; i++) {
    const n1 = parseInt(v1[i] || 0)
    const n2 = parseInt(v2[i] || 0)

    if (n1 > n2) return 1
    if (n1 < n2) return -1
  }

  return 0
}

// ============ Z 字形变换 ============

function convert(s, numRows) {
  if (numRows === 1) return s

  const rows = Array.from({ length: Math.min(numRows, s.length) }, () => '')
  let currentRow = 0
  let goingDown = false

  for (const c of s) {
    rows[currentRow] += c

    if (currentRow === 0 || currentRow === numRows - 1) {
      goingDown = !goingDown
    }

    currentRow += goingDown ? 1 : -1
  }

  return rows.join('')
}
```
:::

## 面试技巧总结

::: details 解题步骤
1. **理解问题**：确保完全理解题目要求
2. **分析示例**：通过示例理解输入输出关系
3. **选择方法**：根据问题特征选择合适的算法
4. **编写代码**：注意边界条件和特殊情况
5. **测试验证**：使用示例和边界用例测试
:::

::: details 常见算法适用场景
| 问题类型 | 推荐算法 |
|---------|---------|
| 有序数组搜索 | 二分查找 |
| 最值问题 | 动态规划、贪心 |
| 排列组合 | 回溯算法 |
| 字符串匹配 | 滑动窗口、KMP |
| 图遍历 | BFS、DFS |
| 最短路径 | Dijkstra、BFS |
| 链表操作 | 双指针、快慢指针 |
| 树遍历 | 递归、迭代 |
| 区间问题 | 排序 + 贪心 |
:::

::: details 复杂度优化思路
1. **空间换时间**：使用哈希表、缓存
2. **预处理**：前缀和、排序
3. **二分优化**：将 O(n) 优化为 O(log n)
4. **双指针**：避免嵌套循环
5. **单调栈/队列**：处理区间最值
:::
