# API 与后台设计（MVP v1）

## 1. 目标
- 支撑当前小程序核心流程：登录、首页学习路径、关卡学习、课程资料、排行榜、成就。
- 从“纯 mock 数据”迁移到“真实 API + 数据库存储”。
- 保持现有页面结构基本不动，优先替换数据来源与鉴权逻辑。

## 2. 推荐技术栈
- 运行时：Node.js 20+
- 框架：Fastify（性能和类型支持更轻量）
- ORM：Prisma
- 数据库：PostgreSQL
- 认证：JWT Access Token + Refresh Token
- 缓存（可选）：Redis（排行榜、热点读取）

说明：如果你更偏向 Express/NestJS，我可以按你偏好切换，接口设计不变。

## 3. API 规范
- Base URL：`/api/v1`
- 鉴权头：`Authorization: Bearer <access_token>`
- 响应结构：
```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```
- 错误结构：
```json
{
  "code": 40001,
  "message": "invalid_token",
  "data": null
}
```

## 4. 核心数据模型（MVP）
- `users`
字段：`id` `email` `password_hash` `name` `birthday` `avatar_url` `created_at` `updated_at`
- `user_sessions`
字段：`id` `user_id` `refresh_token_hash` `expires_at` `device_info` `created_at`
- `sections`
字段：`id` `title` `subtitle` `sort_order` `is_locked` `created_at`
- `levels`
字段：`id` `section_id` `title` `subtitle` `type(audio|video|practice)` `sort_order`
- `materials`
字段：`id` `course_id` `type(pdf|audio|video)` `title` `url` `duration` `size`
- `user_progress`
字段：`id` `user_id` `section_id` `level_id` `status(not_started|in_progress|done)` `score` `updated_at`
- `leaderboard_snapshots`
字段：`id` `scope(class|campus|national)` `user_id` `study_hours` `rank` `snapshot_date`
- `achievements`
字段：`id` `name` `icon` `description`
- `user_achievements`
字段：`id` `user_id` `achievement_id` `unlocked_at`

## 5. 接口清单（MVP）

### 5.1 Auth
- `POST /auth/wechat-login`
请求：`{ "code": "wx.login code", "profile": { "nickName": "", "avatarUrl": "" } }`
- `POST /auth/register`
请求：`{ "name": "", "email": "", "password": "", "birthday": "YYYY-MM-DD" }`
- `POST /auth/login`
请求：`{ "email": "", "password": "" }`
- `POST /auth/refresh`
请求：`{ "refreshToken": "" }`
- `POST /auth/logout`
请求：`{ "refreshToken": "" }`

### 5.2 User
- `GET /users/me`
- `PATCH /users/me`
请求：`{ "name": "", "birthday": "" }`

### 5.3 Learning Path
- `GET /sections`
返回：首页/路径页需要的 section 列表与进度
- `GET /sections/:id`
返回：section 详情 + lessons
- `GET /levels/:id`
返回：level 页面所需音频/视频/句卡数据
- `POST /levels/:id/attempts`
请求：`{ "mode": "interactive|practice", "score": 80, "durationSec": 120 }`

### 5.4 Courses & Materials
- `GET /courses`
- `GET /courses/:id/materials`

### 5.5 Leaderboard & Achievement
- `GET /leaderboard?scope=class|campus|national`（首版保持 mock 数据）
- `GET /achievements`

## 6. 与当前前端页面的对接映射
- `pages/login/signin/signin.js`
从本地校验改为 `POST /auth/login`
- `pages/login/register/register.js`
从 mock 注册改为 `POST /auth/register`
- `pages/index/index.js`
从本地 `last_section` + mock levels 改为 `GET /sections`（并保留本地兜底）
- `pages/sections/list/list.js`
改为 `GET /sections`
- `pages/section/detail/detail.js`
改为 `GET /sections/:id`
- `pages/level/detail/detail.js`
改为 `GET /levels/:id`
- `pages/courses/list/list.js`
改为 `GET /courses`
- `pages/materials/detail/detail.js`
改为 `GET /courses/:id/materials`
- `pages/league/sapphire/sapphire.js`
改为 `GET /leaderboard`
- `pages/achievement/achievement.js`
改为 `GET /achievements`

## 7. 鉴权与安全
- Access Token 有效期：2 小时
- Refresh Token 有效期：30 天
- 密码哈希：`bcrypt`
- 所有写接口做参数校验（zod/ajv）
- 生产环境强制 HTTPS
- 关键日志打点：登录成功/失败、token 刷新、学习提交

## 8. 迭代顺序（建议）
- 第 1 阶段（先打通主干）
`auth/register` `auth/login` `users/me` `sections`
- 第 2 阶段（学习流程）
`sections/:id` `levels/:id` `levels/:id/attempts`
- 第 3 阶段（课程资料）
`courses` `courses/:id/materials`
- 第 4 阶段（排行榜与成就）
`leaderboard` `achievements`

## 9. 交付物（下一步我可直接开始）
- `backend/` 服务脚手架（Fastify + Prisma + PostgreSQL）
- 数据库 schema + migration + seed
- API 路由与基础鉴权中间件
- 前端 `services/api.js` + `services/auth.js` 封装
- 首批页面接入：登录、首页、sections
