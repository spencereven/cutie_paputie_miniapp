# 🎯 Duolingo 小程序完整实现计划

基于 overview-ui.pen 的设计和产品方案的完整开发路线图

---

## 📋 项目信息

**项目名**: Duolingo 微信小程序 (完整版)
**基础框架**: 微信小程序原生开发 + TDesign UI 组件库
**设计参考**: overview-ui.pen (Duolingo iOS)
**目标完成度**: 100% 按照产品设计方案实现

---

## 🗂️ 完整文件结构

```
duolingo-miniapp/
│
├── pages/
│   ├── login/                          # 登录模块
│   │   ├── welcome/
│   │   │   ├── welcome.wxml            # 登录欢迎屏
│   │   │   ├── welcome.js
│   │   │   └── welcome.wxss
│   │   │
│   │   ├── auth-choice/
│   │   │   ├── auth-choice.wxml        # 授权选择页
│   │   │   ├── auth-choice.js
│   │   │   └── auth-choice.wxss
│   │   │
│   │   ├── authorizing/
│   │   │   ├── authorizing.wxml        # 授权加载页
│   │   │   ├── authorizing.js
│   │   │   └── authorizing.wxss
│   │   │
│   │   └── register-info/
│   │       ├── register-info.wxml      # 信息补充页
│   │       ├── register-info.js
│   │       └── register-info.wxss
│   │
│   ├── index/                          # Home 首页（现有）
│   │   ├── index.wxml
│   │   ├── index.js
│   │   └── index.wxss
│   │
│   ├── sections/                       # Sections 模块
│   │   ├── list/
│   │   │   ├── list.wxml               # Sections 列表页（已解锁）
│   │   │   ├── list.js
│   │   │   └── list.wxss
│   │   │
│   │   └── locked/
│   │       ├── locked.wxml             # Sections2（未解锁区域）
│   │       ├── locked.js
│   │       └── locked.wxss
│   │
│   ├── level/                          # Level 关卡模块
│   │   ├── detail/
│   │   │   ├── detail.wxml             # 单个关卡详情页
│   │   │   ├── detail.js
│   │   │   └── detail.wxss
│   │
│   ├── league/                         # 排行榜模块
│   │   ├── sapphire/
│   │   │   ├── sapphire.wxml           # Sapphire League 排行榜
│   │   │   ├── sapphire.js
│   │   │   └── sapphire.wxss
│   │
│   ├── courses/                        # 课程资料模块
│   │   ├── list/
│   │   │   ├── list.wxml               # 课程列表页
│   │   │   ├── list.js
│   │   │   └── list.wxss
│   │
│   ├── materials/                      # 资源详情模块
│   │   ├── detail/
│   │   │   ├── detail.wxml             # 课程资料详情页
│   │   │   ├── detail.js
│   │   │   └── detail.wxss
│   │   │
│   │   └── player/
│   │       ├── player.wxml             # 统一资源播放页
│   │       ├── player.js
│   │       └── player.wxss
│   │
│   └── profile/                        # 用户个人页（可选）
│       ├── profile.wxml
│       ├── profile.js
│       └── profile.wxss
│
├── components/                         # 可复用组件
│   ├── status-bar/                     # 状态栏组件
│   │   ├── status-bar.wxml
│   │   ├── status-bar.js
│   │   └── status-bar.wxss
│   │
│   ├── level-card/                     # Level 卡片组件
│   │   ├── level-card.wxml
│   │   ├── level-card.js
│   │   └── level-card.wxss
│   │
│   ├── section-card/                   # Section 卡片组件
│   │   ├── section-card.wxml
│   │   ├── section-card.js
│   │   └── section-card.wxss
│   │
│   ├── course-card/                    # 课程卡片组件
│   │   ├── course-card.wxml
│   │   ├── course-card.js
│   │   └── course-card.wxss
│   │
│   ├── material-item/                  # 资源项组件
│   │   ├── material-item.wxml
│   │   ├── material-item.js
│   │   └── material-item.wxss
│   │
│   ├── leaderboard-row/                # 排行榜行组件
│   │   ├── leaderboard-row.wxml
│   │   ├── leaderboard-row.js
│   │   └── leaderboard-row.wxss
│   │
│   ├── audio-player/                   # 音频播放器组件
│   │   ├── audio-player.wxml
│   │   ├── audio-player.js
│   │   └── audio-player.wxss
│   │
│   └── video-player/                   # 视频播放器组件
│       ├── video-player.wxml
│       ├── video-player.js
│       └── video-player.wxss
│
├── services/                           # API 服务层
│   ├── api.js                          # API 请求封装
│   ├── auth.js                         # 认证服务
│   ├── section.js                      # Section 服务
│   ├── level.js                        # Level 服务
│   ├── league.js                       # League 服务
│   ├── course.js                       # Course 服务
│   └── material.js                     # Material 服务
│
├── utils/                              # 工具函数
│   ├── storage.js                      # 本地存储工具
│   ├── request.js                      # 网络请求工具
│   ├── format.js                       # 格式化工具
│   ├── validator.js                    # 验证工具
│   └── constant.js                     # 常量定义
│
├── store/                              # 全局状态（可选 Vuex 替代）
│   ├── user.js                         # 用户状态
│   ├── section.js                      # Section 状态
│   ├── level.js                        # Level 状态
│   └── index.js                        # 状态管理入口
│
├── assets/                             # 静态资源
│   ├── icons/                          # 图标集合
│   ├── images/                         # 图片资源
│   └── fonts/                          # 字体文件
│
├── app.js                              # 应用入口（现有）
├── app.json                            # 应用配置（已修复）
├── app.wxss                            # 全局样式（已修复）
├── project.config.json                 # 开发工具配置
├── sitemap.json                        # 页面映射
│
├── IMPLEMENTATION_PLAN.md              # 本文件
├── FIXES.md                            # 修复记录
├── README.md                           # 项目说明
└── TDESIGN_GUIDE.md                    # TDesign 集成指南
```

---

## 📱 页面开发顺序（推荐）

### 第一阶段：登录模块 (2-3 天)

- [x] welcome.wxml/js/wxss - 欢迎屏
- [x] auth-choice.wxml/js/wxss - 授权选择
- [x] authorizing.wxml/js/wxss - 加载屏
- [x] register-info.wxml/js/wxss - 信息补充
- [ ] 后端接口对接

### 第二阶段：首页与关卡 (2-3 天)

- [x] index.wxml/js/wxss - 首页（现有，需增强）
- [ ] sections/list - Sections 列表
- [ ] sections/locked - 未解锁区域
- [ ] level/detail - 关卡详情
- [ ] 状态栏、Level 卡片等组件

### 第三阶段：排行榜与课程 (2 天)

- [ ] league/sapphire - 排行榜页面
- [ ] courses/list - 课程列表
- [ ] materials/detail - 资料详情
- [ ] 课程卡片、资源项组件

### 第四阶段：播放器与优化 (2-3 天)

- [ ] materials/player - 统一播放器
  - [ ] PDF 查看
  - [ ] 音频播放
  - [ ] 视频播放
- [ ] 性能优化、分包加载、缓存

### 第五阶段：测试与发布 (1-2 天)

- [ ] 完整测试
- [ ] 兼容性测试
- [ ] 上线发布

**总计**: 约 2-3 周完成全功能开发

---

## 🔧 核心技术栈

### 前端

```
微信小程序原生:
- WXML (视图层)
- WXSS (样式层)
- JavaScript (逻辑层)

UI 组件库:
- TDesign (Button, Input, Dialog, Tabs, etc.)
- 自定义组件 (StatusBar, LevelCard, etc.)
```

### 后端接口（待开发）

```
API Base URL: https://api.duolingo-mini.com/v1

认证:
POST /auth/login                 # 登录
POST /auth/verify-phone         # 手机号验证
POST /user/register             # 注册用户信息

Section & Level:
GET /sections                   # 获取 Section 列表
GET /sections/{id}              # 获取单个 Section 详情
GET /levels/{id}                # 获取 Level 详情
PATCH /user/progress            # 更新学习进度

League:
GET /league/current             # 获取当前联赛
GET /league/leaderboard         # 获取排行榜

Courses:
GET /courses                    # 获取课程列表
GET /courses/{id}/materials     # 获取课程资料列表

Materials:
GET /materials/{id}             # 获取资源详情
GET /materials/{id}/url         # 获取资源下载 URL
```

---

## 💾 本地存储策略

```javascript
// 用户登录信息
wx.setStorage({
  key: 'user_token',
  data: 'jwt_token_xxx'
});

// 用户基本信息
wx.setStorage({
  key: 'user_info',
  data: {
    id: 'user_123',
    nickname: 'Tom',
    gender: 'M',
    currentSection: 'section_1'
  }
});

// 缓存的 Section 列表
wx.setStorage({
  key: 'sections_cache',
  data: sectionsData,
  expire: 3600000 // 1 小时过期
});

// 已下载的资源
wx.setStorage({
  key: 'downloaded_materials',
  data: [
    { materialId: 'mat_1', filePath: 'file/path' }
  ]
});
```

---

## 🎨 设计系统规范

### 颜色

```
// 主色系
--color-primary: #2CB7FF      // 蓝色
--color-primary-light: #E5F6FF
--color-primary-dark: #1FAEE8

// 功能色
--color-success: #5AC956      // 绿色
--color-warning: #F5A623      // 金色
--color-error: #FF4458        // 红色

// 中立色
--color-bg: #F5F5F5           // 页面背景
--color-bg-secondary: #FFFFFF
--color-text-primary: #111111
--color-text-secondary: #666666
--color-text-disabled: #999999
--color-border: #E6E6E6
```

### 圆角

```
--radius-sm: 4px      // 小元素
--radius-md: 8px      // 卡片
--radius-lg: 12px     // 大卡片、弹窗
--radius-xl: 16px     // 特殊元素
--radius-full: 50%    // 圆形
```

### 间距

```
--space-xs: 4px
--space-sm: 8px
--space-md: 12px
--space-lg: 16px
--space-xl: 24px
--space-2xl: 32px
```

### 字体

```
--font-size-xs: 10px   // 辅助文本
--font-size-sm: 12px   // 小文本
--font-size-base: 14px // 正文
--font-size-md: 16px   // 副标题
--font-size-lg: 18px   // 标题
--font-size-xl: 20px   // 大标题
--font-size-2xl: 28px  // 超大标题

--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

---

## 🔄 数据流与状态管理

### 用户状态流

```
启动应用
  ↓
  ├─ [已登录且 Token 有效]
  │  └─ 获取用户信息 → Home
  │
  └─ [未登录或 Token 过期]
     └─ Login/Welcome
        └─ Login/Auth-Choice
           ├─ 微信登录 → Login/Authorizing → Login/Register-Info → Home
           └─ 游客模式 → Home (功能受限)
```

### Section 选择流

```
Home
  ↓ 点击 Section 横幅
Sections/List (显示所有已解锁 Section)
  ├─ 点击 Section 卡片 → 更新 currentSection
  │                    → 返回 Home
  │
  └─ 下滑到 Sections/Locked (显示未解锁 Section)
     └─ 点击未解锁 Section → 弹窗提示解锁条件
```

### Level 关卡流

```
Home (Level 列表)
  ↓ 点击 Level 卡片
Level/Detail (关卡详情)
  ├─ 点击"开始/继续" → 练习流程 (后续开发)
  ├─ 点击"查看成绩" → 显示反馈
  └─ 返回 → Home
```

---

## 📡 网络请求流程

### 请求拦截器

```javascript
// request.js - 统一请求处理

const request = (url, options = {}) => {
  // 1. 检查 Token 有效性
  // 2. 添加 Authorization 头
  // 3. 设置超时
  // 4. 发送请求
  // 5. 处理响应
  // 6. 错误重试
  // 7. Token 过期刷新
  return promise
}

// 错误处理
request.interceptor.response.use(
  response => {
    if (response.code === 401) {
      // Token 过期，跳转登录
      wx.navigateTo({ url: '/pages/login/welcome' })
    }
    return response
  }
)
```

### 缓存策略

```javascript
// 获取 Section 列表（带缓存）
const getSections = async () => {
  const cached = wx.getStorageSync('sections_cache');
  if (cached && !isExpired(cached.timestamp)) {
    return cached.data;
  }

  const data = await request('/sections');
  wx.setStorageSync('sections_cache', {
    data,
    timestamp: Date.now()
  });
  return data;
}
```

---

## ✅ 开发检查清单

### 登录模块
- [ ] Welcome 页面样式完成
- [ ] 微信授权逻辑实现
- [ ] 手机号登录接口对接
- [ ] 游客模式实现
- [ ] Token 存储与管理
- [ ] 登录状态检查逻辑

### Home 首页
- [ ] 用户进度卡片显示
- [ ] 当前 Section 显示
- [ ] Level 列表渲染
- [ ] 锁定关卡禁用交互
- [ ] 下拉刷新实现
- [ ] 进度更新接口对接

### Sections 模块
- [ ] Section 列表页开发
- [ ] Section 卡片样式
- [ ] 已解锁/未解锁区分
- [ ] 切换 Section 逻辑
- [ ] 解锁条件提示

### Level 关卡
- [ ] 关卡详情页开发
- [ ] 进度条显示
- [ ] 不同状态按钮显示
- [ ] 成绩展示页面
- [ ] 练习流程预留接口

### 排行榜
- [ ] Leaderboard 列表渲染
- [ ] 当前用户高亮
- [ ] 排名实时更新
- [ ] 升降级信息显示
- [ ] WebSocket 推送实现（可选）

### 课程资料
- [ ] 课程列表开发
- [ ] 搜索功能实现
- [ ] 资料详情页开发
- [ ] 资源类型区分（PDF/音频/视频）
- [ ] 资源下载与缓存

### 播放器
- [ ] PDF 预览器
- [ ] 音频播放器
- [ ] 视频播放器
- [ ] 进度保存
- [ ] 离线支持

### 性能优化
- [ ] 分包加载配置
- [ ] 长列表虚拟滚动
- [ ] 图片懒加载
- [ ] 数据缓存策略
- [ ] API 请求合并

---

## 🚀 发布前检查

### 功能完整性
- [ ] 所有 12 个页面开发完成
- [ ] 所有交互逻辑实现
- [ ] 所有接口对接完成
- [ ] 离线功能测试通过

### 性能与兼容性
- [ ] 首页加载时间 < 2s
- [ ] 列表滚动流畅（60fps）
- [ ] 支持 iOS 13+ / Android 8+
- [ ] 网络异常处理完善

### UI/UX 质量
- [ ] 所有页面UI符合设计稿
- [ ] 文案清晰无错别字
- [ ] 空态/加载态完整
- [ ] 错误提示友好

### 安全性
- [ ] Token 安全存储
- [ ] API 请求加密（HTTPS）
- [ ] 用户数据脱敏
- [ ] 日志不输出敏感信息

### 上线发布
- [ ] 提交微信审核
- [ ] 等待审核通过（通常 1-7 天）
- [ ] 灰度发布（10% 用户）
- [ ] 监控数据 & 反馈
- [ ] 全量发布

---

## 📚 相关文档

- [x] README.md - 项目说明
- [x] QUICK_START.md - 快速开始
- [x] TDESIGN_GUIDE.md - TDesign 集成
- [x] PROJECT_INFO.md - 项目详情
- [ ] IMPLEMENTATION_PLAN.md - **本文件**
- [ ] API_DOCUMENTATION.md - API 文档（需编写）
- [ ] TESTING_GUIDE.md - 测试指南（需编写）

---

## 💬 常见问题与解决方案

### Q: 如何处理小程序的 Token 过期？

A:
```javascript
// 自动 Token 刷新
const request = async (url, options) => {
  try {
    return await fetchAPI(url, options);
  } catch (error) {
    if (error.code === 401) {
      // Token 过期，调用刷新接口
      await refreshToken();
      // 重试原请求
      return fetchAPI(url, options);
    }
  }
}
```

### Q: 如何实现排行榜的实时更新？

A:
```javascript
// 使用 WebSocket
const connectWebSocket = () => {
  const ws = new WebSocket('wss://api.duolingo.com/league');
  ws.onmessage = (event) => {
    const { type, data } = JSON.parse(event.data);
    if (type === 'rank_update') {
      updateLeaderboard(data);
      // 高亮当前用户的新排名
    }
  }
}
```

### Q: 视频播放时如何支持离线？

A:
```javascript
// 下载视频到本地
const downloadVideo = async (materialId) => {
  const downloadTask = wx.downloadFile({
    url: `${API_URL}/materials/${materialId}/download`,
    filePath: `${wx.env.USER_DATA_PATH}/videos/${materialId}.mp4`
  });

  downloadTask.onProgressUpdate((res) => {
    updateDownloadProgress(materialId, res.progress);
  });
}

// 播放时优先用本地文件
const playVideo = (materialId) => {
  const localPath = getLocalFilePath(materialId);
  if (localPath && fileExists(localPath)) {
    // 播放本地文件
    setVideoSource(localPath);
  } else {
    // 播放在线文件
    setVideoSource(`${API_URL}/materials/${materialId}`);
  }
}
```

---

## 📞 支持与反馈

遇到问题？

1. 查看本文档
2. 查看 README.md / TDESIGN_GUIDE.md
3. 检查微信开发者工具的控制台错误
4. 提交 Issue 或反馈

---

**最后更新**: 2026-02-11
**维护者**: Claude Code
**状态**: 🚀 准备开始开发

