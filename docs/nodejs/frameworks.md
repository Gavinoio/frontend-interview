# Node.js Web 框架对比

## 概述

Node.js 生态中有多种 Web 框架，从轻量级的 Express、Koa 到企业级的 NestJS、Fastify。本文对比分析各框架的特点和适用场景。

---

## 一、框架全览

| 框架 | 定位 | 特点 | GitHub Stars | 适用场景 |
|------|------|------|--------------|----------|
| Express | 轻量级 | 简单灵活，生态成熟 | 60k+ | 中小型项目、API |
| Koa | 轻量级 | async/await，洋葱模型 | 35k+ | 中小型项目 |
| Fastify | 高性能 | 极速，Schema 验证 | 30k+ | 高性能 API |
| NestJS | 企业级 | TypeScript，模块化 | 60k+ | 大型企业应用 |
| Hapi | 企业级 | 配置驱动，插件系统 | 14k+ | 企业级应用 |
| Egg.js | 企业级 | 阿里出品，约定优于配置 | 18k+ | 企业级应用 |

---

## 二、Express

### 1. 基本用法

```javascript
const express = require('express')
const app = express()

// 中间件
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/users/:id', (req, res) => {
  const { id } = req.params
  res.json({ id, name: 'John' })
})

app.post('/users', (req, res) => {
  const { name, email } = req.body
  res.status(201).json({ id: 1, name, email })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

### 2. 路由模块化

```javascript
// routes/users.js
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.json([{ id: 1, name: 'John' }])
})

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'John' })
})

router.post('/', (req, res) => {
  res.status(201).json(req.body)
})

module.exports = router

// app.js
const usersRouter = require('./routes/users')
app.use('/api/users', usersRouter)
```

### 3. 中间件

```javascript
// 日志中间件
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`)
  next()
}

// 认证中间件
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// 使用
app.use(logger)
app.get('/protected', auth, (req, res) => {
  res.json({ user: req.user })
})
```

### 优缺点

```
优点:
- 学习曲线低
- 生态最成熟
- 中间件丰富
- 社区活跃

缺点:
- 回调地狱 (可用 async/await 解决)
- 无内置验证
- 结构灵活但可能混乱
```

---

## 三、Koa

### 1. 基本用法

```javascript
const Koa = require('koa')
const Router = require('@koa/router')
const bodyParser = require('koa-bodyparser')

const app = new Koa()
const router = new Router()

// 中间件
app.use(bodyParser())

// 路由
router.get('/', (ctx) => {
  ctx.body = 'Hello World'
})

router.get('/users/:id', (ctx) => {
  const { id } = ctx.params
  ctx.body = { id, name: 'John' }
})

router.post('/users', (ctx) => {
  const { name, email } = ctx.request.body
  ctx.status = 201
  ctx.body = { id: 1, name, email }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000)
```

### 2. 洋葱模型

```javascript
// Koa 中间件按洋葱模型执行
app.use(async (ctx, next) => {
  console.log('1. 进入第一层')
  const start = Date.now()

  await next()  // 进入下一层

  const ms = Date.now() - start
  console.log(`4. 返回第一层 - ${ms}ms`)
})

app.use(async (ctx, next) => {
  console.log('2. 进入第二层')

  await next()

  console.log('3. 返回第二层')
})

app.use(async (ctx) => {
  console.log('处理请求')
  ctx.body = 'Hello'
})

// 输出顺序:
// 1. 进入第一层
// 2. 进入第二层
// 处理请求
// 3. 返回第二层
// 4. 返回第一层 - Xms
```

### 3. 错误处理

```javascript
// 全局错误处理
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = {
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
    ctx.app.emit('error', err, ctx)
  }
})

// 监听错误事件
app.on('error', (err, ctx) => {
  console.error('Server error:', err)
})

// 抛出错误
router.get('/error', (ctx) => {
  const error = new Error('Something went wrong')
  error.status = 400
  throw error
})
```

### 优缺点

```
优点:
- 原生 async/await
- 洋葱模型清晰
- 轻量无捆绑
- Context 设计优雅

缺点:
- 生态不如 Express
- 需要组装多个库
- 社区相对较小
```

---

## 四、Fastify

### 1. 基本用法

```javascript
const fastify = require('fastify')({ logger: true })

// 路由
fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

fastify.get('/users/:id', async (request, reply) => {
  const { id } = request.params
  return { id, name: 'John' }
})

fastify.post('/users', async (request, reply) => {
  const { name, email } = request.body
  reply.code(201)
  return { id: 1, name, email }
})

// 启动服务
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

### 2. Schema 验证

```javascript
// JSON Schema 验证
const userSchema = {
  body: {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: { type: 'string', minLength: 2 },
      email: { type: 'string', format: 'email' },
      age: { type: 'integer', minimum: 0 }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string' }
      }
    }
  }
}

fastify.post('/users', { schema: userSchema }, async (request, reply) => {
  const { name, email } = request.body
  reply.code(201)
  return { id: 1, name, email }
})

// 验证失败自动返回 400 错误
```

### 3. 插件系统

```javascript
// 定义插件
async function dbPlugin(fastify, options) {
  const db = await connectToDatabase(options.uri)

  fastify.decorate('db', db)

  fastify.addHook('onClose', async () => {
    await db.close()
  })
}

// 注册插件
fastify.register(dbPlugin, {
  uri: 'mongodb://localhost:27017/mydb'
})

// 路由中使用
fastify.get('/users', async (request, reply) => {
  const users = await fastify.db.collection('users').find().toArray()
  return users
})

// 插件封装
fastify.register(async function (fastify) {
  // 这里的装饰器只在这个作用域内可用
  fastify.decorate('util', { /* ... */ })

  fastify.get('/scoped', async () => {
    return fastify.util.doSomething()
  })
})
```

### 4. 钩子

```javascript
// 请求生命周期钩子
fastify.addHook('onRequest', async (request, reply) => {
  console.log('Request received')
})

fastify.addHook('preHandler', async (request, reply) => {
  // 认证检查
  if (!request.headers.authorization) {
    reply.code(401).send({ error: 'Unauthorized' })
  }
})

fastify.addHook('onSend', async (request, reply, payload) => {
  console.log('Sending response')
  return payload
})

fastify.addHook('onResponse', async (request, reply) => {
  console.log(`Response sent: ${reply.statusCode}`)
})

fastify.addHook('onError', async (request, reply, error) => {
  console.error('Error:', error)
})
```

### 优缺点

```
优点:
- 性能极高
- Schema 验证
- 插件系统完善
- TypeScript 友好

缺点:
- 学习曲线略高
- 生态不如 Express
- 某些场景过于严格
```

---

## 五、NestJS

### 1. 项目结构

```
src/
├── app.module.ts
├── app.controller.ts
├── app.service.ts
├── main.ts
└── users/
    ├── users.module.ts
    ├── users.controller.ts
    ├── users.service.ts
    ├── dto/
    │   ├── create-user.dto.ts
    │   └── update-user.dto.ts
    └── entities/
        └── user.entity.ts
```

### 2. 基本用法

```typescript
// main.ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000)
}
bootstrap()

// app.module.ts
import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'

@Module({
  imports: [UsersModule]
})
export class AppModule {}
```

### 3. Controller

```typescript
// users.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.usersService.findAll(page, limit)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id)
  }
}
```

### 4. Service

```typescript
// users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async findAll(page = 1, limit = 10) {
    const [data, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit
    })
    return { data, total, page, limit }
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User #${id} not found`)
    }
    return user
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto)
    return this.usersRepository.save(user)
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update(id, updateUserDto)
    return this.findOne(id)
  }

  async remove(id: number) {
    const result = await this.usersRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`User #${id} not found`)
    }
  }
}
```

### 5. DTO 与验证

```typescript
// dto/create-user.dto.ts
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsOptional()
  @IsString()
  avatar?: string
}

// dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### 6. 中间件与守卫

```typescript
// 中间件
import { Injectable, NestMiddleware } from '@nestjs/common'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    console.log(`${req.method} ${req.url}`)
    next()
  }
}

// 守卫
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const token = request.headers.authorization?.split(' ')[1]

    if (!token) return false

    try {
      const user = this.validateToken(token)
      request.user = user
      return true
    } catch {
      return false
    }
  }
}

// 使用守卫
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {}

// 拦截器
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        code: 0,
        data,
        message: 'success'
      }))
    )
  }
}
```

### 优缺点

```
优点:
- TypeScript 原生支持
- 模块化架构
- 依赖注入
- 完整的企业级特性
- 类似 Angular 的开发体验

缺点:
- 学习曲线陡峭
- 代码量较多
- 对简单项目可能过重
- 性能不如 Fastify
```

---

## 六、框架选择指南

### 决策流程

```
1. 项目规模？
   - 小型/原型 → Express / Koa
   - 中型 → Fastify
   - 大型/企业级 → NestJS

2. 团队背景？
   - 熟悉 Angular → NestJS
   - 追求简单 → Express / Koa
   - 追求性能 → Fastify

3. TypeScript？
   - 强制要求 → NestJS
   - 可选 → 其他

4. 性能要求？
   - 极高 → Fastify
   - 一般 → 任意
```

### 性能对比

```
请求/秒 (越高越好):

Fastify     ~65,000
Koa         ~50,000
Express     ~35,000
NestJS      ~30,000 (基于 Express)
NestJS      ~55,000 (基于 Fastify)
```

---

