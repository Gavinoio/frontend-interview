# 大文件上传完全指南

## 为什么需要特殊处理大文件？

普通上传的问题：

1. **超时失败** - 文件太大，上传时间长，超过浏览器或服务器的超时限制
2. **内存溢出** - 一次性加载整个文件到内存，导致浏览器或服务器内存不足
3. **无法断点续传** - 网络中断后需要重新上传，浪费时间和流量
4. **用户体验差** - 上传失败后要重头开始，无法知道准确进度

举个例子：上传 1GB 的视频文件，普通上传可能需要 10-20 分钟，中途网络抖动就前功尽弃。用户体验极差。

## 切片上传（分片上传）

### 核心思路

将大文件切成多个小块（比如每块 2MB），然后并行或串行上传这些小块，最后在服务端合并成完整文件。

**类比**：就像搬家，大型家具搬不动，就拆成小块分批搬运，到新家再组装。

### 前端实现

#### 1. 文件切片

```javascript
/**
 * 将文件切分成多个小块
 * @param {File} file - 要切分的文件
 * @param {number} chunkSize - 每块大小（字节），默认 2MB
 * @returns {Blob[]} 切片数组
 */
function createChunks(file, chunkSize = 2 * 1024 * 1024) {
  const chunks = []
  let start = 0

  while (start < file.size) {
    // file.slice() 不会加载文件内容到内存，只是创建一个引用
    const chunk = file.slice(start, start + chunkSize)
    chunks.push(chunk)
    start += chunkSize
  }

  return chunks
}

// 使用示例
const file = document.querySelector('input[type="file"]').files[0]
const chunks = createChunks(file, 2 * 1024 * 1024) // 2MB 每块
console.log(`文件被切分成 ${chunks.length} 块`)
```

#### 2. 计算文件 Hash

文件 Hash 用于唯一标识文件，实现秒传和断点续传。

```javascript
/**
 * 计算文件的 MD5 hash
 * 使用 spark-md5 库
 */
import SparkMD5 from 'spark-md5'

async function calculateHash(file) {
  return new Promise((resolve, reject) => {
    const chunks = createChunks(file, 2 * 1024 * 1024)
    const spark = new SparkMD5.ArrayBuffer()
    let currentChunk = 0
    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      spark.append(e.target.result)
      currentChunk++

      if (currentChunk < chunks.length) {
        loadNext()
      } else {
        const hash = spark.end()
        resolve(hash)
      }
    }

    fileReader.onerror = (e) => {
      reject(e)
    }

    function loadNext() {
      fileReader.readAsArrayBuffer(chunks[currentChunk])
    }

    loadNext()
  })
}

// 优化版：采样计算（大文件只计算部分内容）
async function calculateHashSampling(file) {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()
    const chunkSize = 2 * 1024 * 1024 // 2MB

    // 采样策略：首尾各 2MB + 中间每隔 10MB 取 2MB
    const chunks = []

    // 首部 2MB
    chunks.push(file.slice(0, chunkSize))

    // 中间采样
    let offset = chunkSize
    while (offset < file.size - chunkSize) {
      chunks.push(file.slice(offset, offset + 2))
      offset += 10 * 1024 * 1024 // 每隔 10MB 取 2 字节
    }

    // 尾部 2MB
    chunks.push(file.slice(-chunkSize))

    let currentChunk = 0

    fileReader.onload = (e) => {
      spark.append(e.target.result)
      currentChunk++

      if (currentChunk < chunks.length) {
        loadNext()
      } else {
        resolve(spark.end())
      }
    }

    fileReader.onerror = reject

    function loadNext() {
      fileReader.readAsArrayBuffer(chunks[currentChunk])
    }

    loadNext()
  })
}
```

#### 3. 上传切片

```javascript
/**
 * 上传单个切片
 */
async function uploadChunk(chunk, index, hash, filename, onProgress) {
  const formData = new FormData()
  formData.append('chunk', chunk)
  formData.append('chunkIndex', index)
  formData.append('fileHash', hash)
  formData.append('filename', filename)

  return axios.post('/upload/chunk', formData, {
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(index, percent)
      }
    }
  })
}

/**
 * 并发控制上传所有切片
 */
async function uploadChunks(chunks, hash, filename, {
  concurrency = 3, // 并发数
  onProgress,
  onChunkComplete
} = {}) {
  const results = []
  let currentIndex = 0
  let completedCount = 0

  // 创建并发池
  const pool = []

  async function uploadNext() {
    if (currentIndex >= chunks.length) {
      return
    }

    const index = currentIndex++
    const chunk = chunks[index]

    try {
      const result = await uploadChunk(chunk, index, hash, filename, onProgress)
      results[index] = result
      completedCount++

      if (onChunkComplete) {
        onChunkComplete(completedCount, chunks.length)
      }

      // 继续上传下一个
      await uploadNext()
    } catch (error) {
      console.error(`切片 ${index} 上传失败`, error)
      // 重试逻辑
      await retryUpload(() => uploadChunk(chunk, index, hash, filename, onProgress), 3)
      completedCount++

      // 继续上传下一个
      await uploadNext()
    }
  }

  // 启动并发上传
  for (let i = 0; i < concurrency; i++) {
    pool.push(uploadNext())
  }

  await Promise.all(pool)
  return results
}

/**
 * 指数退避重试
 */
async function retryUpload(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) {
        throw error
      }
      // 指数退避：1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
}

/**
 * 通知服务器合并切片
 */
async function mergeChunks(hash, filename, chunkCount) {
  return axios.post('/upload/merge', {
    fileHash: hash,
    filename,
    chunkCount
  })
}
```

### 完整的 React 组件实现

```jsx
import React, { useState, useRef } from 'react'
import axios from 'axios'
import SparkMD5 from 'spark-md5'
import './FileUpload.css'

const CHUNK_SIZE = 2 * 1024 * 1024 // 2MB

function FileUpload() {
  const [file, setFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [status, setStatus] = useState('idle') // idle, hashing, uploading, paused, completed, error
  const [hashProgress, setHashProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const fileInputRef = useRef(null)
  const uploadStateRef = useRef({
    chunks: [],
    hash: '',
    uploadedChunks: new Set(),
    controller: null
  })

  // 选择文件
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadProgress(0)
      setStatus('idle')
      uploadStateRef.current = {
        chunks: [],
        hash: '',
        uploadedChunks: new Set(),
        controller: null
      }
    }
  }

  // 切分文件
  const createChunks = (file) => {
    const chunks = []
    let start = 0

    while (start < file.size) {
      chunks.push(file.slice(start, start + CHUNK_SIZE))
      start += CHUNK_SIZE
    }

    return chunks
  }

  // 计算 hash
  const calculateHash = (chunks) => {
    return new Promise((resolve, reject) => {
      const spark = new SparkMD5.ArrayBuffer()
      let currentChunk = 0
      const fileReader = new FileReader()

      fileReader.onload = (e) => {
        spark.append(e.target.result)
        currentChunk++
        setHashProgress(Math.round((currentChunk / chunks.length) * 100))

        if (currentChunk < chunks.length) {
          loadNext()
        } else {
          resolve(spark.end())
        }
      }

      fileReader.onerror = reject

      function loadNext() {
        fileReader.readAsArrayBuffer(chunks[currentChunk])
      }

      loadNext()
    })
  }

  // 检查文件是否已存在（秒传）
  const checkFileExists = async (hash) => {
    try {
      const response = await axios.post('/upload/check', { fileHash: hash })
      return response.data
    } catch (error) {
      console.error('检查文件失败', error)
      return { exists: false, uploadedChunks: [] }
    }
  }

  // 上传单个切片
  const uploadChunk = async (chunk, index, hash, filename, controller) => {
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('chunkIndex', index)
    formData.append('fileHash', hash)
    formData.append('filename', filename)

    await axios.post('/upload/chunk', formData, {
      signal: controller.signal,
      onUploadProgress: (progressEvent) => {
        // 更新单个切片进度
      }
    })
  }

  // 上传所有切片
  const uploadChunks = async (chunks, hash, filename, uploadedChunks = new Set()) => {
    const controller = new AbortController()
    uploadStateRef.current.controller = controller

    const totalChunks = chunks.length
    let completedCount = uploadedChunks.size

    const uploadTasks = chunks.map((chunk, index) => {
      // 跳过已上传的切片
      if (uploadedChunks.has(index)) {
        return Promise.resolve()
      }

      return async () => {
        if (isPaused) return

        await uploadChunk(chunk, index, hash, filename, controller)
        completedCount++
        uploadStateRef.current.uploadedChunks.add(index)

        // 更新总进度
        const progress = Math.round((completedCount / totalChunks) * 100)
        setUploadProgress(progress)

        // 保存上传状态到 localStorage
        saveUploadState(hash, index)
      }
    })

    // 并发控制
    await concurrentExecute(uploadTasks, 3)
  }

  // 并发控制执行
  const concurrentExecute = async (tasks, limit) => {
    const executing = []

    for (const task of tasks) {
      const promise = task().then(() => {
        executing.splice(executing.indexOf(promise), 1)
      })

      executing.push(promise)

      if (executing.length >= limit) {
        await Promise.race(executing)
      }
    }

    await Promise.all(executing)
  }

  // 保存上传状态
  const saveUploadState = (hash, chunkIndex) => {
    const key = `upload_${hash}`
    const state = JSON.parse(localStorage.getItem(key) || '{"uploadedChunks":[]}')
    if (!state.uploadedChunks.includes(chunkIndex)) {
      state.uploadedChunks.push(chunkIndex)
    }
    localStorage.setItem(key, JSON.stringify(state))
  }

  // 获取已上传状态
  const getUploadState = (hash) => {
    const key = `upload_${hash}`
    const state = JSON.parse(localStorage.getItem(key) || '{"uploadedChunks":[]}')
    return new Set(state.uploadedChunks)
  }

  // 合并切片
  const mergeChunks = async (hash, filename, chunkCount) => {
    await axios.post('/upload/merge', {
      fileHash: hash,
      filename,
      chunkCount
    })
  }

  // 开始上传
  const handleUpload = async () => {
    if (!file) return

    try {
      setStatus('hashing')
      setHashProgress(0)

      // 1. 切分文件
      const chunks = createChunks(file)
      uploadStateRef.current.chunks = chunks

      // 2. 计算 hash
      const hash = await calculateHash(chunks)
      uploadStateRef.current.hash = hash
      console.log('文件 hash:', hash)

      // 3. 检查文件是否已存在（秒传）
      const checkResult = await checkFileExists(hash)
      if (checkResult.exists) {
        setStatus('completed')
        setUploadProgress(100)
        alert('文件已存在，秒传成功！')
        return
      }

      // 4. 获取已上传的切片（断点续传）
      const uploadedChunks = getUploadState(hash)
      if (uploadedChunks.size > 0) {
        console.log(`发现已上传 ${uploadedChunks.size} 个切片，继续上传`)
        uploadStateRef.current.uploadedChunks = uploadedChunks
        const progress = Math.round((uploadedChunks.size / chunks.length) * 100)
        setUploadProgress(progress)
      }

      // 5. 上传切片
      setStatus('uploading')
      await uploadChunks(chunks, hash, file.name, uploadedChunks)

      // 6. 通知服务器合并切片
      await mergeChunks(hash, file.name, chunks.length)

      // 7. 完成
      setStatus('completed')
      setUploadProgress(100)

      // 清除 localStorage 中的上传状态
      localStorage.removeItem(`upload_${hash}`)

      alert('上传成功！')
    } catch (error) {
      console.error('上传失败', error)
      setStatus('error')
      alert('上传失败：' + error.message)
    }
  }

  // 暂停上传
  const handlePause = () => {
    if (uploadStateRef.current.controller) {
      uploadStateRef.current.controller.abort()
    }
    setIsPaused(true)
    setStatus('paused')
  }

  // 继续上传
  const handleResume = () => {
    setIsPaused(false)
    handleUpload()
  }

  // 取消上传
  const handleCancel = () => {
    if (uploadStateRef.current.controller) {
      uploadStateRef.current.controller.abort()
    }
    setFile(null)
    setUploadProgress(0)
    setStatus('idle')
    fileInputRef.current.value = ''
  }

  return (
    <div className="file-upload">
      <h2>大文件上传</h2>

      <div className="upload-area">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          disabled={status === 'uploading' || status === 'hashing'}
        />

        {file && (
          <div className="file-info">
            <p>文件名: {file.name}</p>
            <p>大小: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
      </div>

      {status === 'hashing' && (
        <div className="progress-section">
          <p>正在计算文件 hash...</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${hashProgress}%` }}
            />
          </div>
          <span>{hashProgress}%</span>
        </div>
      )}

      {(status === 'uploading' || status === 'paused' || status === 'completed') && (
        <div className="progress-section">
          <p>上传进度</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span>{uploadProgress}%</span>
        </div>
      )}

      <div className="button-group">
        {status === 'idle' && file && (
          <button onClick={handleUpload}>开始上传</button>
        )}

        {status === 'uploading' && (
          <>
            <button onClick={handlePause}>暂停</button>
            <button onClick={handleCancel}>取消</button>
          </>
        )}

        {status === 'paused' && (
          <>
            <button onClick={handleResume}>继续</button>
            <button onClick={handleCancel}>取消</button>
          </>
        )}

        {status === 'completed' && (
          <button onClick={() => window.location.reload()}>重新上传</button>
        )}
      </div>

      {status === 'error' && (
        <div className="error-message">
          上传失败，请重试
        </div>
      )}
    </div>
  )
}

export default FileUpload
```

```css
/* FileUpload.css */
.file-upload {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  margin-bottom: 20px;
}

.upload-area input[type="file"] {
  display: block;
  margin: 0 auto;
}

.file-info {
  margin-top: 15px;
  text-align: left;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
}

.progress-section {
  margin: 20px 0;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background-color: #f0f0f0;
  border-radius: 15px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  background-color: #ffe6e6;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}
```

### 完整的 Vue 3 组件实现

```vue
<template>
  <div class="file-upload">
    <h2>大文件上传</h2>

    <div class="upload-area">
      <input
        ref="fileInput"
        type="file"
        @change="handleFileChange"
        :disabled="status === 'uploading' || status === 'hashing'"
      />

      <div v-if="file" class="file-info">
        <p>文件名: {{ file.name }}</p>
        <p>大小: {{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
      </div>
    </div>

    <div v-if="status === 'hashing'" class="progress-section">
      <p>正在计算文件 hash...</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: hashProgress + '%' }"></div>
      </div>
      <span>{{ hashProgress }}%</span>
    </div>

    <div
      v-if="['uploading', 'paused', 'completed'].includes(status)"
      class="progress-section"
    >
      <p>上传进度</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <span>{{ uploadProgress }}%</span>
    </div>

    <div class="button-group">
      <button v-if="status === 'idle' && file" @click="handleUpload">
        开始上传
      </button>

      <template v-if="status === 'uploading'">
        <button @click="handlePause">暂停</button>
        <button @click="handleCancel">取消</button>
      </template>

      <template v-if="status === 'paused'">
        <button @click="handleResume">继续</button>
        <button @click="handleCancel">取消</button>
      </template>

      <button v-if="status === 'completed'" @click="reset">
        重新上传
      </button>
    </div>

    <div v-if="status === 'error'" class="error-message">
      上传失败，请重试
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'
import SparkMD5 from 'spark-md5'

const CHUNK_SIZE = 2 * 1024 * 1024 // 2MB

const file = ref(null)
const fileInput = ref(null)
const uploadProgress = ref(0)
const hashProgress = ref(0)
const status = ref('idle') // idle, hashing, uploading, paused, completed, error
const isPaused = ref(false)

const uploadState = reactive({
  chunks: [],
  hash: '',
  uploadedChunks: new Set(),
  controller: null
})

// 选择文件
const handleFileChange = (e) => {
  const selectedFile = e.target.files[0]
  if (selectedFile) {
    file.value = selectedFile
    uploadProgress.value = 0
    status.value = 'idle'
    uploadState.chunks = []
    uploadState.hash = ''
    uploadState.uploadedChunks = new Set()
    uploadState.controller = null
  }
}

// 切分文件
const createChunks = (file) => {
  const chunks = []
  let start = 0

  while (start < file.size) {
    chunks.push(file.slice(start, start + CHUNK_SIZE))
    start += CHUNK_SIZE
  }

  return chunks
}

// 计算 hash
const calculateHash = (chunks) => {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    let currentChunk = 0
    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      spark.append(e.target.result)
      currentChunk++
      hashProgress.value = Math.round((currentChunk / chunks.length) * 100)

      if (currentChunk < chunks.length) {
        loadNext()
      } else {
        resolve(spark.end())
      }
    }

    fileReader.onerror = reject

    function loadNext() {
      fileReader.readAsArrayBuffer(chunks[currentChunk])
    }

    loadNext()
  })
}

// 检查文件是否已存在
const checkFileExists = async (hash) => {
  try {
    const response = await axios.post('/upload/check', { fileHash: hash })
    return response.data
  } catch (error) {
    console.error('检查文件失败', error)
    return { exists: false, uploadedChunks: [] }
  }
}

// 上传单个切片
const uploadChunk = async (chunk, index, hash, filename, controller) => {
  const formData = new FormData()
  formData.append('chunk', chunk)
  formData.append('chunkIndex', index)
  formData.append('fileHash', hash)
  formData.append('filename', filename)

  await axios.post('/upload/chunk', formData, {
    signal: controller.signal
  })
}

// 上传所有切片
const uploadChunks = async (chunks, hash, filename, uploadedChunks = new Set()) => {
  const controller = new AbortController()
  uploadState.controller = controller

  const totalChunks = chunks.length
  let completedCount = uploadedChunks.size

  const uploadTasks = chunks.map((chunk, index) => {
    if (uploadedChunks.has(index)) {
      return Promise.resolve()
    }

    return async () => {
      if (isPaused.value) return

      await uploadChunk(chunk, index, hash, filename, controller)
      completedCount++
      uploadState.uploadedChunks.add(index)

      uploadProgress.value = Math.round((completedCount / totalChunks) * 100)
      saveUploadState(hash, index)
    }
  })

  await concurrentExecute(uploadTasks, 3)
}

// 并发控制
const concurrentExecute = async (tasks, limit) => {
  const executing = []

  for (const task of tasks) {
    const promise = task().then(() => {
      executing.splice(executing.indexOf(promise), 1)
    })

    executing.push(promise)

    if (executing.length >= limit) {
      await Promise.race(executing)
    }
  }

  await Promise.all(executing)
}

// 保存上传状态
const saveUploadState = (hash, chunkIndex) => {
  const key = `upload_${hash}`
  const state = JSON.parse(localStorage.getItem(key) || '{"uploadedChunks":[]}')
  if (!state.uploadedChunks.includes(chunkIndex)) {
    state.uploadedChunks.push(chunkIndex)
  }
  localStorage.setItem(key, JSON.stringify(state))
}

// 获取已上传状态
const getUploadState = (hash) => {
  const key = `upload_${hash}`
  const state = JSON.parse(localStorage.getItem(key) || '{"uploadedChunks":[]}')
  return new Set(state.uploadedChunks)
}

// 合并切片
const mergeChunks = async (hash, filename, chunkCount) => {
  await axios.post('/upload/merge', {
    fileHash: hash,
    filename,
    chunkCount
  })
}

// 开始上传
const handleUpload = async () => {
  if (!file.value) return

  try {
    status.value = 'hashing'
    hashProgress.value = 0

    const chunks = createChunks(file.value)
    uploadState.chunks = chunks

    const hash = await calculateHash(chunks)
    uploadState.hash = hash
    console.log('文件 hash:', hash)

    const checkResult = await checkFileExists(hash)
    if (checkResult.exists) {
      status.value = 'completed'
      uploadProgress.value = 100
      alert('文件已存在，秒传成功！')
      return
    }

    const uploadedChunks = getUploadState(hash)
    if (uploadedChunks.size > 0) {
      console.log(`发现已上传 ${uploadedChunks.size} 个切片，继续上传`)
      uploadState.uploadedChunks = uploadedChunks
      uploadProgress.value = Math.round((uploadedChunks.size / chunks.length) * 100)
    }

    status.value = 'uploading'
    await uploadChunks(chunks, hash, file.value.name, uploadedChunks)

    await mergeChunks(hash, file.value.name, chunks.length)

    status.value = 'completed'
    uploadProgress.value = 100

    localStorage.removeItem(`upload_${hash}`)

    alert('上传成功！')
  } catch (error) {
    console.error('上传失败', error)
    status.value = 'error'
    alert('上传失败：' + error.message)
  }
}

// 暂停
const handlePause = () => {
  if (uploadState.controller) {
    uploadState.controller.abort()
  }
  isPaused.value = true
  status.value = 'paused'
}

// 继续
const handleResume = () => {
  isPaused.value = false
  handleUpload()
}

// 取消
const handleCancel = () => {
  if (uploadState.controller) {
    uploadState.controller.abort()
  }
  reset()
}

// 重置
const reset = () => {
  file.value = null
  uploadProgress.value = 0
  status.value = 'idle'
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.file-upload {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  margin-bottom: 20px;
}

.file-info {
  margin-top: 15px;
  text-align: left;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
}

.progress-section {
  margin: 20px 0;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background-color: #f0f0f0;
  border-radius: 15px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  background-color: #ffe6e6;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}
</style>
```

### 后端实现（Node.js + Express）

```javascript
const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')

const app = express()
const upload = multer({ dest: 'uploads/temp' })

// 临时存储切片的目录
const TEMP_DIR = path.join(__dirname, 'uploads', 'temp')
// 最终文件存储目录
const UPLOAD_DIR = path.join(__dirname, 'uploads', 'files')

// 确保目录存在
fse.ensureDirSync(TEMP_DIR)
fse.ensureDirSync(UPLOAD_DIR)

// 检查文件是否已存在（秒传）
app.post('/upload/check', express.json(), async (req, res) => {
  const { fileHash } = req.body
  const filePath = path.join(UPLOAD_DIR, fileHash)

  if (fs.existsSync(filePath)) {
    // 文件已存在
    return res.json({
      exists: true,
      url: `/files/${fileHash}`
    })
  }

  // 检查是否有部分切片已上传
  const chunkDir = path.join(TEMP_DIR, fileHash)
  if (fs.existsSync(chunkDir)) {
    const uploadedChunks = fs.readdirSync(chunkDir)
      .map(filename => parseInt(filename.split('-')[0]))
      .sort((a, b) => a - b)

    return res.json({
      exists: false,
      uploadedChunks
    })
  }

  res.json({
    exists: false,
    uploadedChunks: []
  })
})

// 接收切片
app.post('/upload/chunk', upload.single('chunk'), async (req, res) => {
  const { chunkIndex, fileHash, filename } = req.body
  const chunk = req.file

  // 创建临时目录
  const chunkDir = path.join(TEMP_DIR, fileHash)
  fse.ensureDirSync(chunkDir)

  // 移动切片到对应目录
  const chunkPath = path.join(chunkDir, `${chunkIndex}-${filename}`)
  await fse.move(chunk.path, chunkPath, { overwrite: true })

  res.json({
    success: true,
    message: '切片上传成功'
  })
})

// 合并切片
app.post('/upload/merge', express.json(), async (req, res) => {
  const { fileHash, filename, chunkCount } = req.body

  const chunkDir = path.join(TEMP_DIR, fileHash)
  const filePath = path.join(UPLOAD_DIR, fileHash)

  // 获取所有切片
  const chunks = fs.readdirSync(chunkDir)
    .sort((a, b) => {
      const aIndex = parseInt(a.split('-')[0])
      const bIndex = parseInt(b.split('-')[0])
      return aIndex - bIndex
    })

  // 检查切片是否完整
  if (chunks.length !== chunkCount) {
    return res.status(400).json({
      success: false,
      message: '切片不完整'
    })
  }

  // 合并切片
  const writeStream = fs.createWriteStream(filePath)

  for (const chunk of chunks) {
    const chunkPath = path.join(chunkDir, chunk)
    const data = await fse.readFile(chunkPath)
    writeStream.write(data)
  }

  writeStream.end()

  // 等待写入完成
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve)
    writeStream.on('error', reject)
  })

  // 删除临时目录
  await fse.remove(chunkDir)

  res.json({
    success: true,
    message: '文件合并成功',
    url: `/files/${fileHash}`
  })
})

// 提供文件访问
app.use('/files', express.static(UPLOAD_DIR))

app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000')
})
```

## 断点续传

### 实现思路

断点续传的核心是：**记录哪些切片已经上传成功，下次只上传缺失的切片**。

实现步骤：
1. 前端使用 `localStorage` 记录每个切片的上传状态
2. 上传前先向服务器查询已上传的切片列表
3. 过滤掉已上传的切片，只上传未完成的部分
4. 上传完成后清除 localStorage 中的记录

### 前端实现

```javascript
/**
 * 获取服务器上已上传的切片
 */
async function getUploadedChunks(fileHash) {
  try {
    const response = await axios.post('/upload/check', { fileHash })
    return response.data.uploadedChunks || []
  } catch (error) {
    console.error('获取已上传切片失败', error)
    return []
  }
}

/**
 * 过滤已上传的切片
 */
function filterUploadedChunks(chunks, uploadedChunks) {
  const uploadedSet = new Set(uploadedChunks)
  return chunks.filter((chunk, index) => !uploadedSet.has(index))
}

/**
 * 带断点续传的完整上传流程
 */
async function uploadWithResume(file) {
  // 1. 切分文件
  const chunks = createChunks(file)

  // 2. 计算文件 hash
  const hash = await calculateHash(chunks)

  // 3. 从 localStorage 获取已上传记录
  const localUploadedChunks = getLocalUploadedChunks(hash)

  // 4. 从服务器获取已上传记录
  const serverUploadedChunks = await getUploadedChunks(hash)

  // 5. 合并两个来源的已上传记录
  const uploadedChunks = new Set([
    ...localUploadedChunks,
    ...serverUploadedChunks
  ])

  console.log(`已上传 ${uploadedChunks.size}/${chunks.length} 个切片`)

  // 6. 只上传未完成的切片
  await uploadChunks(chunks, hash, file.name, uploadedChunks)

  // 7. 合并切片
  await mergeChunks(hash, file.name, chunks.length)

  // 8. 清除本地记录
  clearLocalUploadState(hash)
}

/**
 * 从 localStorage 获取已上传切片
 */
function getLocalUploadedChunks(hash) {
  const key = `upload_${hash}`
  const state = JSON.parse(localStorage.getItem(key) || '{"uploadedChunks":[]}')
  return state.uploadedChunks
}

/**
 * 保存已上传切片到 localStorage
 */
function saveLocalUploadedChunk(hash, chunkIndex) {
  const key = `upload_${hash}`
  const state = JSON.parse(localStorage.getItem(key) || '{"uploadedChunks":[]}')

  if (!state.uploadedChunks.includes(chunkIndex)) {
    state.uploadedChunks.push(chunkIndex)
  }

  state.uploadedChunks.sort((a, b) => a - b)
  localStorage.setItem(key, JSON.stringify(state))
}

/**
 * 清除本地上传状态
 */
function clearLocalUploadState(hash) {
  const key = `upload_${hash}`
  localStorage.removeItem(key)
}
```

### 使用 IndexedDB 记录上传状态（更可靠）

`localStorage` 有容量限制（一般 5-10MB），对于大量切片可能不够用。可以使用 IndexedDB：

```javascript
/**
 * 使用 IndexedDB 管理上传状态
 */
class UploadStateDB {
  constructor() {
    this.dbName = 'FileUploadDB'
    this.storeName = 'uploadState'
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'hash' })
        }
      }
    })
  }

  async saveChunk(hash, chunkIndex) {
    const tx = this.db.transaction(this.storeName, 'readwrite')
    const store = tx.objectStore(this.storeName)

    const existing = await new Promise((resolve) => {
      const request = store.get(hash)
      request.onsuccess = () => resolve(request.result)
    })

    const uploadedChunks = existing ? existing.uploadedChunks : []
    if (!uploadedChunks.includes(chunkIndex)) {
      uploadedChunks.push(chunkIndex)
    }

    store.put({
      hash,
      uploadedChunks,
      timestamp: Date.now()
    })

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getUploadedChunks(hash) {
    const tx = this.db.transaction(this.storeName, 'readonly')
    const store = tx.objectStore(this.storeName)

    return new Promise((resolve) => {
      const request = store.get(hash)
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.uploadedChunks : [])
      }
    })
  }

  async clearState(hash) {
    const tx = this.db.transaction(this.storeName, 'readwrite')
    const store = tx.objectStore(this.storeName)
    store.delete(hash)

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
}

// 使用示例
const uploadDB = new UploadStateDB()
await uploadDB.init()

// 保存切片
await uploadDB.saveChunk(hash, 0)

// 获取已上传切片
const uploadedChunks = await uploadDB.getUploadedChunks(hash)

// 清除状态
await uploadDB.clearState(hash)
```

## 秒传

### 原理

秒传的核心思想：**如果两个文件的 hash 值相同，说明它们的内容完全一样**。

流程：
1. 用户选择文件后，计算文件的 MD5 hash
2. 向服务器发送请求，查询该 hash 对应的文件是否已存在
3. 如果存在，直接返回文件 URL，无需上传
4. 如果不存在，进行正常的切片上传

这样用户上传同一个文件时，第二次及以后都是秒传。

### 实现

**前端代码：**

```javascript
/**
 * 检查文件是否可以秒传
 */
async function checkInstantUpload(file) {
  // 1. 计算文件 hash
  console.log('正在计算文件 hash...')
  const hash = await calculateHash(createChunks(file))
  console.log('文件 hash:', hash)

  // 2. 查询服务器
  try {
    const response = await axios.post('/upload/check', {
      fileHash: hash,
      filename: file.name,
      fileSize: file.size
    })

    if (response.data.exists) {
      console.log('文件已存在，秒传成功！')
      return {
        success: true,
        url: response.data.url,
        message: '秒传成功'
      }
    }

    return {
      success: false,
      hash,
      uploadedChunks: response.data.uploadedChunks || []
    }
  } catch (error) {
    console.error('检查文件失败', error)
    return {
      success: false,
      hash,
      uploadedChunks: []
    }
  }
}

/**
 * 带秒传的上传流程
 */
async function uploadWithInstant(file) {
  // 1. 尝试秒传
  const checkResult = await checkInstantUpload(file)

  if (checkResult.success) {
    // 秒传成功
    alert('文件已存在，秒传成功！')
    return checkResult.url
  }

  // 2. 秒传失败，进行切片上传
  console.log('开始切片上传...')
  const chunks = createChunks(file)
  const hash = checkResult.hash

  await uploadChunks(chunks, hash, file.name, new Set(checkResult.uploadedChunks))
  await mergeChunks(hash, file.name, chunks.length)

  return `/files/${hash}`
}
```

**后端代码：**

```javascript
// 检查文件是否已存在
app.post('/upload/check', express.json(), async (req, res) => {
  const { fileHash, filename, fileSize } = req.body

  // 1. 检查文件是否存在
  const filePath = path.join(UPLOAD_DIR, fileHash)

  if (fs.existsSync(filePath)) {
    // 文件已存在，可以秒传

    // 可选：记录到数据库，关联用户和文件
    // await db.files.create({
    //   userId: req.user.id,
    //   fileHash,
    //   filename,
    //   fileSize,
    //   url: `/files/${fileHash}`
    // })

    return res.json({
      exists: true,
      url: `/files/${fileHash}`,
      message: '文件已存在'
    })
  }

  // 2. 文件不存在，检查是否有部分切片
  const chunkDir = path.join(TEMP_DIR, fileHash)

  if (fs.existsSync(chunkDir)) {
    const uploadedChunks = fs.readdirSync(chunkDir)
      .map(filename => parseInt(filename.split('-')[0]))
      .sort((a, b) => a - b)

    return res.json({
      exists: false,
      uploadedChunks,
      message: '可以断点续传'
    })
  }

  // 3. 完全新的文件
  res.json({
    exists: false,
    uploadedChunks: [],
    message: '需要完整上传'
  })
})
```

### 优化：文件去重与关联

在实际应用中，秒传不仅仅是返回 URL，还需要处理文件去重和用户关联：

```javascript
// 数据库表结构设计
// files 表（物理文件）
{
  id: 'primary key',
  hash: 'unique, 文件 hash',
  path: '文件存储路径',
  size: '文件大小',
  createdAt: '创建时间'
}

// user_files 表（用户文件关联）
{
  id: 'primary key',
  userId: '用户 ID',
  fileId: '文件 ID（关联 files 表）',
  filename: '用户自定义文件名',
  createdAt: '上传时间'
}

// 秒传时的处理
app.post('/upload/check', async (req, res) => {
  const { fileHash, filename } = req.body
  const userId = req.user.id

  // 查询物理文件
  const file = await db.files.findOne({ hash: fileHash })

  if (file) {
    // 文件已存在，创建用户关联
    await db.userFiles.create({
      userId,
      fileId: file.id,
      filename
    })

    return res.json({
      exists: true,
      url: file.path,
      message: '秒传成功'
    })
  }

  res.json({ exists: false })
})
```

## 并发控制

### 为什么需要并发控制？

同时上传太多切片会导致：

1. **占用过多带宽** - 影响其他网络请求
2. **浏览器连接数限制** - Chrome 对同一域名最多 6 个并发连接
3. **服务端压力大** - 可能导致服务器过载
4. **进度显示不准确** - 太多并发请求难以准确计算进度

### 实现并发控制

#### 方法 1：使用 Promise 池

```javascript
/**
 * 并发控制执行异步任务
 * @param {Function[]} tasks - 任务函数数组
 * @param {number} limit - 并发限制
 */
async function concurrentExecute(tasks, limit = 3) {
  const results = []
  const executing = [] // 正在执行的 Promise 池

  for (const [index, task] of tasks.entries()) {
    // 创建任务 Promise
    const promise = Promise.resolve().then(() => task())
    results[index] = promise

    // 如果任务数超过限制，需要等待
    if (tasks.length >= limit) {
      // 记录执行完成后从池中移除
      const e = promise.then(() => {
        executing.splice(executing.indexOf(e), 1)
      })
      executing.push(e)

      // 如果达到并发限制，等待最快的一个完成
      if (executing.length >= limit) {
        await Promise.race(executing)
      }
    }
  }

  // 等待所有任务完成
  return Promise.all(results)
}

// 使用示例
const chunks = createChunks(file)
const tasks = chunks.map((chunk, index) => {
  return () => uploadChunk(chunk, index, hash, filename)
})

await concurrentExecute(tasks, 3) // 最多 3 个并发
```

#### 方法 2：使用 async-pool 库

```javascript
import asyncPool from 'tiny-async-pool'

async function uploadChunksWithPool(chunks, hash, filename) {
  const tasks = chunks.map((chunk, index) => {
    return () => uploadChunk(chunk, index, hash, filename)
  })

  // 并发限制为 3
  await asyncPool(3, tasks, task => task())
}
```

#### 方法 3：自定义并发控制类

```javascript
class ConcurrentUploader {
  constructor(concurrency = 3) {
    this.concurrency = concurrency
    this.running = 0
    this.queue = []
    this.results = []
  }

  async add(task, index) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, index, resolve, reject })
      this.run()
    })
  }

  async run() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const { task, index, resolve, reject } = this.queue.shift()
      this.running++

      try {
        const result = await task()
        this.results[index] = result
        resolve(result)
      } catch (error) {
        reject(error)
      } finally {
        this.running--
        this.run() // 继续执行队列中的任务
      }
    }
  }

  async all() {
    // 等待队列清空
    while (this.queue.length > 0 || this.running > 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return this.results
  }
}

// 使用示例
const uploader = new ConcurrentUploader(3)

chunks.forEach((chunk, index) => {
  uploader.add(() => uploadChunk(chunk, index, hash, filename), index)
})

await uploader.all()
console.log('所有切片上传完成')
```

### 动态调整并发数

根据网络状况动态调整并发数：

```javascript
class AdaptiveConcurrentUploader {
  constructor(initialConcurrency = 3) {
    this.concurrency = initialConcurrency
    this.minConcurrency = 1
    this.maxConcurrency = 6
    this.successCount = 0
    this.failCount = 0
  }

  adjustConcurrency() {
    // 如果成功率高，增加并发数
    if (this.successCount > 10 && this.failCount === 0) {
      this.concurrency = Math.min(this.concurrency + 1, this.maxConcurrency)
      this.successCount = 0
      console.log(`增加并发数到 ${this.concurrency}`)
    }

    // 如果失败率高，减少并发数
    if (this.failCount > 3) {
      this.concurrency = Math.max(this.concurrency - 1, this.minConcurrency)
      this.failCount = 0
      console.log(`减少并发数到 ${this.concurrency}`)
    }
  }

  async upload(task) {
    try {
      const result = await task()
      this.successCount++
      this.adjustConcurrency()
      return result
    } catch (error) {
      this.failCount++
      this.adjustConcurrency()
      throw error
    }
  }
}
```

## 进度计算

### 单个切片进度

使用 XMLHttpRequest 或 Axios 的进度回调：

```javascript
/**
 * 使用 XMLHttpRequest 上传（支持进度）
 */
function uploadChunkWithProgress(chunk, index, hash, filename, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()

    formData.append('chunk', chunk)
    formData.append('chunkIndex', index)
    formData.append('fileHash', hash)
    formData.append('filename', filename)

    // 监听上传进度
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100)
        if (onProgress) {
          onProgress(index, percent)
        }
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error(`上传失败: ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('网络错误'))
    })

    xhr.open('POST', '/upload/chunk')
    xhr.send(formData)
  })
}

/**
 * 使用 Axios 上传（支持进度）
 */
async function uploadChunkWithAxios(chunk, index, hash, filename, onProgress) {
  const formData = new FormData()
  formData.append('chunk', chunk)
  formData.append('chunkIndex', index)
  formData.append('fileHash', hash)
  formData.append('filename', filename)

  return axios.post('/upload/chunk', formData, {
    onUploadProgress: (progressEvent) => {
      if (progressEvent.lengthComputable) {
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100)
        if (onProgress) {
          onProgress(index, percent)
        }
      }
    }
  })
}
```

### 总体进度计算

#### 方法 1：基于已完成切片数量

```javascript
class UploadProgress {
  constructor(totalChunks) {
    this.totalChunks = totalChunks
    this.completedChunks = 0
  }

  onChunkComplete() {
    this.completedChunks++
    const progress = Math.round((this.completedChunks / this.totalChunks) * 100)
    console.log(`上传进度: ${progress}%`)
    return progress
  }
}

// 使用
const progress = new UploadProgress(chunks.length)

for (const [index, chunk] of chunks.entries()) {
  await uploadChunk(chunk, index, hash, filename)
  const percent = progress.onChunkComplete()
  updateUI(percent)
}
```

#### 方法 2：基于每个切片的实时进度（更精确）

```javascript
class DetailedUploadProgress {
  constructor(totalChunks) {
    this.totalChunks = totalChunks
    this.chunkProgress = new Array(totalChunks).fill(0) // 每个切片的进度
  }

  updateChunkProgress(chunkIndex, percent) {
    this.chunkProgress[chunkIndex] = percent
    return this.getTotalProgress()
  }

  getTotalProgress() {
    const sum = this.chunkProgress.reduce((acc, val) => acc + val, 0)
    return Math.round(sum / this.totalChunks)
  }
}

// 使用
const progress = new DetailedUploadProgress(chunks.length)

chunks.forEach((chunk, index) => {
  uploadChunkWithProgress(chunk, index, hash, filename, (chunkIndex, percent) => {
    const totalProgress = progress.updateChunkProgress(chunkIndex, percent)
    console.log(`总进度: ${totalProgress}%`)
    updateUI(totalProgress)
  })
})
```

#### 方法 3：加权进度（考虑切片大小）

```javascript
class WeightedUploadProgress {
  constructor(chunks) {
    this.chunks = chunks
    this.totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
    this.chunkProgress = new Map() // chunkIndex -> { size, loaded }

    chunks.forEach((chunk, index) => {
      this.chunkProgress.set(index, { size: chunk.size, loaded: 0 })
    })
  }

  updateChunkProgress(chunkIndex, loaded) {
    const chunk = this.chunkProgress.get(chunkIndex)
    if (chunk) {
      chunk.loaded = loaded
    }
    return this.getTotalProgress()
  }

  getTotalProgress() {
    let totalLoaded = 0

    for (const chunk of this.chunkProgress.values()) {
      totalLoaded += chunk.loaded
    }

    return Math.round((totalLoaded / this.totalSize) * 100)
  }
}

// 使用
const progress = new WeightedUploadProgress(chunks)

chunks.forEach((chunk, index) => {
  const xhr = new XMLHttpRequest()

  xhr.upload.addEventListener('progress', (e) => {
    const totalProgress = progress.updateChunkProgress(index, e.loaded)
    updateUI(totalProgress)
  })

  // ... 上传逻辑
})
```

### 进度持久化

将进度保存到 localStorage，刷新页面后可以恢复：

```javascript
class PersistentProgress {
  constructor(fileHash, totalChunks) {
    this.fileHash = fileHash
    this.totalChunks = totalChunks
    this.key = `progress_${fileHash}`
    this.load()
  }

  load() {
    const saved = localStorage.getItem(this.key)
    if (saved) {
      const data = JSON.parse(saved)
      this.chunkProgress = data.chunkProgress
    } else {
      this.chunkProgress = new Array(this.totalChunks).fill(0)
    }
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify({
      chunkProgress: this.chunkProgress
    }))
  }

  updateChunkProgress(chunkIndex, percent) {
    this.chunkProgress[chunkIndex] = percent
    this.save()
    return this.getTotalProgress()
  }

  getTotalProgress() {
    const sum = this.chunkProgress.reduce((acc, val) => acc + val, 0)
    return Math.round(sum / this.totalChunks)
  }

  clear() {
    localStorage.removeItem(this.key)
  }
}
```

## 错误重试

### 指数退避重试

```javascript
/**
 * 指数退避重试策略
 * @param {Function} fn - 要执行的函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} baseDelay - 基础延迟时间（毫秒）
 */
async function retryWithExponentialBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      // 最后一次尝试失败，抛出错误
      if (attempt === maxRetries - 1) {
        throw error
      }

      // 计算延迟时间：1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`第 ${attempt + 1} 次失败，${delay}ms 后重试...`)

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// 使用示例
await retryWithExponentialBackoff(
  () => uploadChunk(chunk, index, hash, filename),
  3,
  1000
)
```

### 带抖动的指数退避

为了避免大量请求同时重试造成服务器压力，加入随机抖动：

```javascript
async function retryWithJitter(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error
      }

      // 基础延迟
      const exponentialDelay = baseDelay * Math.pow(2, attempt)

      // 加入随机抖动（0-50% 的随机浮动）
      const jitter = Math.random() * exponentialDelay * 0.5
      const delay = exponentialDelay + jitter

      console.log(`重试前等待 ${Math.round(delay)}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

### 针对特定错误的重试策略

```javascript
async function retryWithStrategy(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    shouldRetry = () => true, // 判断是否应该重试
    onRetry = () => {}, // 重试回调
  } = options

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      // 判断是否应该重试
      if (attempt === maxRetries - 1 || !shouldRetry(error)) {
        throw error
      }

      // 执行重试回调
      onRetry(attempt, error)

      // 延迟
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// 使用示例
await retryWithStrategy(
  () => uploadChunk(chunk, index, hash, filename),
  {
    maxRetries: 5,
    baseDelay: 1000,
    shouldRetry: (error) => {
      // 只对网络错误和 5xx 错误重试
      if (error.code === 'ECONNABORTED') return true
      if (error.response && error.response.status >= 500) return true
      return false
    },
    onRetry: (attempt, error) => {
      console.log(`第 ${attempt + 1} 次重试，错误:`, error.message)
    }
  }
)
```

### 完整的重试管理器

```javascript
class RetryManager {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3
    this.baseDelay = options.baseDelay || 1000
    this.maxDelay = options.maxDelay || 30000
    this.retryCount = new Map() // 记录每个任务的重试次数
  }

  async execute(taskId, fn) {
    const currentRetry = this.retryCount.get(taskId) || 0

    try {
      const result = await fn()
      this.retryCount.delete(taskId) // 成功后清除重试记录
      return result
    } catch (error) {
      if (currentRetry >= this.maxRetries) {
        this.retryCount.delete(taskId)
        throw new Error(`任务 ${taskId} 重试 ${this.maxRetries} 次后仍然失败`)
      }

      // 更新重试次数
      this.retryCount.set(taskId, currentRetry + 1)

      // 计算延迟
      const delay = Math.min(
        this.baseDelay * Math.pow(2, currentRetry),
        this.maxDelay
      )

      console.log(`任务 ${taskId} 第 ${currentRetry + 1} 次重试，等待 ${delay}ms`)

      await new Promise(resolve => setTimeout(resolve, delay))

      // 递归重试
      return this.execute(taskId, fn)
    }
  }

  getRetryCount(taskId) {
    return this.retryCount.get(taskId) || 0
  }

  clear() {
    this.retryCount.clear()
  }
}

// 使用示例
const retryManager = new RetryManager({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000
})

for (const [index, chunk] of chunks.entries()) {
  await retryManager.execute(
    `chunk-${index}`,
    () => uploadChunk(chunk, index, hash, filename)
  )
}
```

## 大文件下载

### 分片下载

使用 HTTP Range 请求头实现分片下载：

```javascript
/**
 * 分片下载大文件
 * @param {string} url - 文件 URL
 * @param {number} chunkSize - 每片大小（字节）
 */
async function downloadFileInChunks(url, chunkSize = 2 * 1024 * 1024) {
  // 1. 获取文件大小
  const headResponse = await fetch(url, { method: 'HEAD' })
  const fileSize = parseInt(headResponse.headers.get('content-length'))

  if (!fileSize) {
    throw new Error('无法获取文件大小')
  }

  console.log(`文件大小: ${(fileSize / 1024 / 1024).toFixed(2)} MB`)

  // 2. 计算需要下载的片数
  const chunks = Math.ceil(fileSize / chunkSize)
  const chunkBlobs = []

  // 3. 并发下载所有片段
  const downloadTasks = []

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize - 1, fileSize - 1)

    downloadTasks.push(downloadChunk(url, start, end, i))
  }

  async function downloadChunk(url, start, end, index) {
    const response = await fetch(url, {
      headers: {
        'Range': `bytes=${start}-${end}`
      }
    })

    if (response.status !== 206) {
      throw new Error(`下载切片 ${index} 失败`)
    }

    const blob = await response.blob()
    chunkBlobs[index] = blob

    console.log(`切片 ${index + 1}/${chunks} 下载完成`)
  }

  // 4. 等待所有片段下载完成
  await Promise.all(downloadTasks)

  // 5. 合并 Blob
  const fileBlob = new Blob(chunkBlobs)

  return fileBlob
}

// 使用示例
const fileBlob = await downloadFileInChunks('https://example.com/large-file.zip')

// 触发下载
const url = URL.createObjectURL(fileBlob)
const a = document.createElement('a')
a.href = url
a.download = 'large-file.zip'
a.click()
URL.revokeObjectURL(url)
```

### 断点续传下载

```javascript
class ResumableDownloader {
  constructor(url, filename) {
    this.url = url
    this.filename = filename
    this.chunkSize = 2 * 1024 * 1024 // 2MB
    this.fileSize = 0
    this.chunks = []
    this.downloadedChunks = new Set()
    this.storageKey = `download_${this.getUrlHash(url)}`
  }

  getUrlHash(url) {
    // 简单的 hash 函数
    let hash = 0
    for (let i = 0; i < url.length; i++) {
      hash = ((hash << 5) - hash) + url.charCodeAt(i)
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }

  async init() {
    // 获取文件大小
    const response = await fetch(this.url, { method: 'HEAD' })
    this.fileSize = parseInt(response.headers.get('content-length'))

    // 计算切片数量
    const chunkCount = Math.ceil(this.fileSize / this.chunkSize)
    this.chunks = Array.from({ length: chunkCount }, (_, i) => ({
      index: i,
      start: i * this.chunkSize,
      end: Math.min((i + 1) * this.chunkSize - 1, this.fileSize - 1)
    }))

    // 加载已下载的切片
    this.loadProgress()
  }

  loadProgress() {
    const saved = localStorage.getItem(this.storageKey)
    if (saved) {
      const data = JSON.parse(saved)
      this.downloadedChunks = new Set(data.downloadedChunks)
      console.log(`找到已下载的 ${this.downloadedChunks.size} 个切片`)
    }
  }

  saveProgress(chunkIndex) {
    this.downloadedChunks.add(chunkIndex)
    localStorage.setItem(this.storageKey, JSON.stringify({
      downloadedChunks: Array.from(this.downloadedChunks)
    }))
  }

  async downloadChunk(chunk) {
    const response = await fetch(this.url, {
      headers: {
        'Range': `bytes=${chunk.start}-${chunk.end}`
      }
    })

    if (response.status !== 206) {
      throw new Error(`下载切片 ${chunk.index} 失败`)
    }

    const blob = await response.blob()

    // 保存到 IndexedDB
    await this.saveChunkToIndexedDB(chunk.index, blob)

    this.saveProgress(chunk.index)

    return blob
  }

  async saveChunkToIndexedDB(index, blob) {
    // 使用 IndexedDB 存储切片
    const db = await this.openDB()
    const tx = db.transaction('chunks', 'readwrite')
    const store = tx.objectStore('chunks')

    await store.put({ index, blob })
  }

  async loadChunkFromIndexedDB(index) {
    const db = await this.openDB()
    const tx = db.transaction('chunks', 'readonly')
    const store = tx.objectStore('chunks')

    return new Promise((resolve, reject) => {
      const request = store.get(index)
      request.onsuccess = () => {
        resolve(request.result ? request.result.blob : null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FileDownloader', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('chunks')) {
          db.createObjectStore('chunks', { keyPath: 'index' })
        }
      }
    })
  }

  async download(onProgress) {
    await this.init()

    const chunkBlobs = new Array(this.chunks.length)

    // 下载缺失的切片
    for (const chunk of this.chunks) {
      if (this.downloadedChunks.has(chunk.index)) {
        // 从 IndexedDB 加载
        chunkBlobs[chunk.index] = await this.loadChunkFromIndexedDB(chunk.index)
      } else {
        // 下载
        chunkBlobs[chunk.index] = await this.downloadChunk(chunk)
      }

      if (onProgress) {
        const progress = Math.round((this.downloadedChunks.size / this.chunks.length) * 100)
        onProgress(progress)
      }
    }

    // 合并
    const fileBlob = new Blob(chunkBlobs)

    // 清理
    this.cleanup()

    return fileBlob
  }

  async cleanup() {
    // 清除 localStorage
    localStorage.removeItem(this.storageKey)

    // 清除 IndexedDB
    const db = await this.openDB()
    const tx = db.transaction('chunks', 'readwrite')
    const store = tx.objectStore('chunks')
    store.clear()
  }
}

// 使用示例
const downloader = new ResumableDownloader(
  'https://example.com/large-file.zip',
  'large-file.zip'
)

const fileBlob = await downloader.download((progress) => {
  console.log(`下载进度: ${progress}%`)
})

// 触发下载
const url = URL.createObjectURL(fileBlob)
const a = document.createElement('a')
a.href = url
a.download = 'large-file.zip'
a.click()
URL.revokeObjectURL(url)
```

## 完整示例代码

这里提供一个完整可用的大文件上传组件（Vue 3 Composition API）：

```vue
<template>
  <div class="large-file-uploader">
    <h1>大文件上传示例</h1>

    <!-- 文件选择区域 -->
    <div class="upload-zone" @click="selectFile">
      <input
        ref="fileInputRef"
        type="file"
        style="display: none"
        @change="handleFileChange"
      />
      <div v-if="!file" class="upload-placeholder">
        <svg width="64" height="64" viewBox="0 0 24 24">
          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        <p>点击选择文件</p>
      </div>
      <div v-else class="file-selected">
        <p><strong>{{ file.name }}</strong></p>
        <p>{{ formatFileSize(file.size) }}</p>
      </div>
    </div>

    <!-- Hash 计算进度 -->
    <div v-if="state.status === 'hashing'" class="progress-section">
      <h3>正在计算文件标识...</h3>
      <ProgressBar :value="state.hashProgress" />
    </div>

    <!-- 上传进度 -->
    <div
      v-if="['uploading', 'paused', 'merging'].includes(state.status)"
      class="progress-section"
    >
      <h3>{{ statusText }}</h3>
      <ProgressBar :value="state.uploadProgress" />
      <div class="progress-details">
        <span>{{ state.completedChunks }} / {{ state.totalChunks }} 个切片</span>
        <span>{{ state.uploadProgress }}%</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button
        v-if="file && state.status === 'idle'"
        @click="startUpload"
        class="btn-primary"
      >
        开始上传
      </button>

      <button
        v-if="state.status === 'uploading'"
        @click="pauseUpload"
        class="btn-secondary"
      >
        暂停
      </button>

      <button
        v-if="state.status === 'paused'"
        @click="resumeUpload"
        class="btn-primary"
      >
        继续上传
      </button>

      <button
        v-if="['uploading', 'paused'].includes(state.status)"
        @click="cancelUpload"
        class="btn-danger"
      >
        取消
      </button>

      <button
        v-if="state.status === 'completed'"
        @click="reset"
        class="btn-secondary"
      >
        重新上传
      </button>
    </div>

    <!-- 成功消息 -->
    <div v-if="state.status === 'completed'" class="success-message">
      上传成功！
    </div>

    <!-- 错误消息 -->
    <div v-if="state.status === 'error'" class="error-message">
      上传失败：{{ state.errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import SparkMD5 from 'spark-md5'

// 配置
const CHUNK_SIZE = 2 * 1024 * 1024 // 2MB
const CONCURRENT_LIMIT = 3 // 并发上传数

// 状态
const file = ref(null)
const fileInputRef = ref(null)

const state = reactive({
  status: 'idle', // idle, hashing, uploading, paused, merging, completed, error
  hashProgress: 0,
  uploadProgress: 0,
  completedChunks: 0,
  totalChunks: 0,
  errorMessage: '',
  fileHash: '',
  chunks: [],
  uploadedChunks: new Set(),
  controller: null
})

// 计算属性
const statusText = computed(() => {
  switch (state.status) {
    case 'uploading': return '正在上传...'
    case 'paused': return '已暂停'
    case 'merging': return '正在合并文件...'
    default: return ''
  }
})

// 选择文件
const selectFile = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (e) => {
  const selectedFile = e.target.files?.[0]
  if (selectedFile) {
    file.value = selectedFile
    resetState()
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

// 切分文件
const createChunks = (file) => {
  const chunks = []
  let start = 0

  while (start < file.size) {
    chunks.push(file.slice(start, start + CHUNK_SIZE))
    start += CHUNK_SIZE
  }

  return chunks
}

// 计算文件 hash
const calculateHash = (chunks) => {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    let currentChunk = 0
    const fileReader = new FileReader()

    const loadNext = () => {
      if (currentChunk < chunks.length) {
        fileReader.readAsArrayBuffer(chunks[currentChunk])
      } else {
        resolve(spark.end())
      }
    }

    fileReader.onload = (e) => {
      spark.append(e.target.result)
      currentChunk++
      state.hashProgress = Math.round((currentChunk / chunks.length) * 100)
      loadNext()
    }

    fileReader.onerror = reject

    loadNext()
  })
}

// 检查文件是否存在
const checkFileExists = async (hash) => {
  try {
    const { data } = await axios.post('/api/upload/check', { fileHash: hash })
    return data
  } catch (error) {
    console.error('检查文件失败', error)
    return { exists: false, uploadedChunks: [] }
  }
}

// 上传单个切片
const uploadChunk = async (chunk, index) => {
  const formData = new FormData()
  formData.append('chunk', chunk)
  formData.append('chunkIndex', index)
  formData.append('fileHash', state.fileHash)
  formData.append('filename', file.value.name)

  await axios.post('/api/upload/chunk', formData, {
    signal: state.controller?.signal
  })
}

// 并发上传切片
const uploadChunks = async () => {
  const executing = []
  let currentIndex = 0

  const uploadNext = async () => {
    while (currentIndex < state.chunks.length) {
      const index = currentIndex++

      // 跳过已上传的切片
      if (state.uploadedChunks.has(index)) {
        state.completedChunks++
        updateProgress()
        continue
      }

      try {
        await uploadChunk(state.chunks[index], index)
        state.uploadedChunks.add(index)
        state.completedChunks++
        updateProgress()
        saveProgress()
      } catch (error) {
        if (error.name === 'CanceledError') {
          // 用户取消
          return
        }
        console.error(`切片 ${index} 上传失败`, error)
        // 重试
        currentIndex-- // 回退索引，下次重试
      }
    }
  }

  // 启动并发上传
  for (let i = 0; i < CONCURRENT_LIMIT; i++) {
    executing.push(uploadNext())
  }

  await Promise.all(executing)
}

// 更新进度
const updateProgress = () => {
  state.uploadProgress = Math.round(
    (state.completedChunks / state.totalChunks) * 100
  )
}

// 保存上传进度
const saveProgress = () => {
  const key = `upload_${state.fileHash}`
  localStorage.setItem(key, JSON.stringify({
    uploadedChunks: Array.from(state.uploadedChunks)
  }))
}

// 加载上传进度
const loadProgress = () => {
  const key = `upload_${state.fileHash}`
  const saved = localStorage.getItem(key)

  if (saved) {
    const data = JSON.parse(saved)
    state.uploadedChunks = new Set(data.uploadedChunks)
    state.completedChunks = state.uploadedChunks.size
    updateProgress()
  }
}

// 合并切片
const mergeChunks = async () => {
  state.status = 'merging'

  await axios.post('/api/upload/merge', {
    fileHash: state.fileHash,
    filename: file.value.name,
    chunkCount: state.totalChunks
  })

  // 清除进度记录
  const key = `upload_${state.fileHash}`
  localStorage.removeItem(key)
}

// 开始上传
const startUpload = async () => {
  try {
    // 1. 计算 hash
    state.status = 'hashing'
    state.chunks = createChunks(file.value)
    state.totalChunks = state.chunks.length
    state.fileHash = await calculateHash(state.chunks)

    console.log('文件 hash:', state.fileHash)

    // 2. 检查是否可以秒传
    const checkResult = await checkFileExists(state.fileHash)

    if (checkResult.exists) {
      state.status = 'completed'
      state.uploadProgress = 100
      alert('文件已存在，秒传成功！')
      return
    }

    // 3. 加载已上传的切片
    loadProgress()

    if (checkResult.uploadedChunks?.length > 0) {
      checkResult.uploadedChunks.forEach(index => {
        state.uploadedChunks.add(index)
      })
      state.completedChunks = state.uploadedChunks.size
      updateProgress()
    }

    // 4. 上传切片
    state.status = 'uploading'
    state.controller = new AbortController()

    await uploadChunks()

    // 5. 合并切片
    await mergeChunks()

    // 6. 完成
    state.status = 'completed'

  } catch (error) {
    console.error('上传失败', error)
    state.status = 'error'
    state.errorMessage = error.message
  }
}

// 暂停上传
const pauseUpload = () => {
  state.controller?.abort()
  state.status = 'paused'
}

// 继续上传
const resumeUpload = () => {
  state.status = 'uploading'
  state.controller = new AbortController()
  uploadChunks().then(() => {
    return mergeChunks()
  }).then(() => {
    state.status = 'completed'
  }).catch((error) => {
    state.status = 'error'
    state.errorMessage = error.message
  })
}

// 取消上传
const cancelUpload = () => {
  state.controller?.abort()
  reset()
}

// 重置状态
const resetState = () => {
  state.status = 'idle'
  state.hashProgress = 0
  state.uploadProgress = 0
  state.completedChunks = 0
  state.totalChunks = 0
  state.errorMessage = ''
  state.fileHash = ''
  state.chunks = []
  state.uploadedChunks = new Set()
  state.controller = null
}

const reset = () => {
  file.value = null
  resetState()
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<script>
// ProgressBar 组件
const ProgressBar = {
  props: {
    value: {
      type: Number,
      default: 0
    }
  },
  template: `
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: value + '%' }">
        <span v-if="value > 5">{{ value }}%</span>
      </div>
    </div>
  `
}

export default {
  components: {
    ProgressBar
  }
}
</script>

<style scoped>
.large-file-uploader {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
}

.upload-zone {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-zone:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.upload-placeholder svg {
  color: #999;
  margin-bottom: 16px;
}

.upload-placeholder p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.file-selected {
  padding: 20px;
}

.file-selected p {
  margin: 8px 0;
  font-size: 16px;
  color: #333;
}

.progress-section {
  margin: 40px 0;
}

.progress-section h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
}

.progress-bar {
  width: 100%;
  height: 40px;
  background: #f0f0f0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890ff, #36cfc9);
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 40px 0;
}

button {
  padding: 12px 32px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-danger {
  background: #ff4d4f;
  color: white;
}

.btn-danger:hover {
  background: #ff7875;
}

.success-message {
  padding: 16px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  color: #52c41a;
  text-align: center;
  font-size: 16px;
}

.error-message {
  padding: 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #ff4d4f;
  text-align: center;
  font-size: 16px;
}
</style>
```

