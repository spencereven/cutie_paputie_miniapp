# 📋 Duolingo 小程序 - 详细实现计划

根据 `overview-ui.pen` 完整设计稿和用户反馈的完整开发路线

---

## 🎯 项目目标

实现与 Duolingo iOS 设计稿完全一致的微信小程序，包括登录流程、学习首页、排行榜、课程资料、关卡详情等核心功能。

---

## 📊 需求汇总

### 用户选择
- ✅ 登录流程: **全部一起实现** (Flow 1-4)
- ✅ TDesign 使用: **混合模式** (核心交互用 TDesign，样式按设计稿调整)
- ✅ 优先模块:
  1. League 排行榜页面
  2. Courses 课程资料页面
  3. Level Detail 关卡详情页
  4. Materials Player 播放器

---

## 🗂️ 完整模块结构

### 第一阶段: 登录模块 (4个页面)

#### Login Flow 1: Sign Back In (已有账户登录)
**路径**: `/pages/login/welcome/`
**现状**: ⚠️ 基础框架已有，需要按设计稿优化

**包含内容**:
- 🦉 Duolingo 猫头鹰角色动画
- "Sign back in" 标题
- Account Card (展示已保存账户)
  - 用户头像 (绿色圆形 #58CC02)
  - 用户名和邮箱
  - 右侧箭头指示器
- "Add another account" 选项
- "MANAGE ACCOUNTS" 链接

**组件需求**:
- Account Card 组件
- Avatar 组件
- 纯展示性页面

**TDesign 使用**:
- `t-button` 用于账户卡片的可点击效果

---

#### Login Flow 2: Already Have Account (选择登录方式)
**路径**: `/pages/login/auth-choice/` (需更新)
**现状**: ⚠️ 已存在但需重构

**包含内容**:
- 后退按钮
- "Already have an account?" 标题
- "SIGN IN" 绿色按钮 (#58CC02)
- 分割线
- "New to Duolingo?" 标题
- "GET STARTED" 白色边框按钮

**组件需求**:
- 双选项卡片组件
- 按钮组件

**TDesign 使用**:
- `t-button` 主操作按钮
- `t-icon` 后退按钮

---

#### Login Flow 3: Enter Details (输入凭证)
**路径**: `/pages/login/signin/` (新建)
**现状**: 🔴 需要新建

**包含内容**:
- 后退按钮 + "Enter your details" 标题
- Input Card (高度100px)
  - Email 输入框
  - Password 输入框
  - Eye/Eye-off 图标切换密码显示
  - 中间分割线
- "SIGN IN" 蓝色按钮 (#1CB0F6)
- "FORGOT PASSWORD" 链接
- 第三方登录区域:
  - Google 登录按钮
  - Facebook 登录按钮
  - Apple 登录按钮
- 法律条款文本

**组件需求**:
- 自定义 Input Card 组件
- 第三方按钮组件

**TDesign 使用**:
- `t-input` 输入框
- `t-button` 登录按钮
- `t-icon` 密码显示切换
- `t-checkbox` 如果需要记住密码

---

#### Login Flow 4: 注册流程 (新建账户)
**路径**: `/pages/login/register/` (新建)
**现状**: 🔴 需要新建

**包含内容**:
- 后退按钮
- "Create your account" 标题
- 多个 Input Card:
  - Name 输入框
  - Email 输入框
  - Password 输入框
  - Birthday 选择器
- "SIGN UP" 按钮
- 第三方注册选项 (同Flow 3)

**组件需求**:
- Input Card 组件 (可复用)
- Date Picker 组件

**TDesign 使用**:
- `t-input` 所有输入框
- `t-date-time-picker` 生日选择
- `t-button` 注册按钮

---

### 第二阶段: 主流程页面

#### Home Page (已有)
**路径**: `/pages/index/index`
**现状**: ✅ 已更新

**已实现**:
- Metrics 组件
- Unit Banner 组件
- Level Card 列表
- Bottom Nav 组件

---

#### League / Leaderboard (排行榜)
**路径**: `/pages/league/sapphire/` (新建)
**优先级**: 🔴 **HIGH**

**包含内容**:
- 顶部导航 (League 名称，如 "Sapphire League")
- 当前用户卡片 (突出显示)
  - 排名
  - 头像
  - 用户名
  - 积分
  - 排名徽章 (升/降/保持)
- 排行榜列表 (虚拟滚动优化)
  - 排名号 (1-3 有特殊样式)
  - 用户头像
  - 用户名
  - 积分
  - 排名变化指示器

**TDesign 使用**:
- `t-list` 排行榜列表
- `t-avatar` 用户头像
- `t-badge` 排名徽章

---

#### Courses / Materials List (课程资料)
**路径**: `/pages/courses/list/` (新建)
**优先级**: 🔴 **HIGH**

**包含内容**:
- 顶部导航 + 搜索栏
- 课程卡片列表
  - 课程封面图
  - 课程名称
  - 课程描述
  - 学习进度条
  - 资料数量指示
- 搜索和筛选功能

**组件需求**:
- Course Card 组件
- Search Bar 组件

**TDesign 使用**:
- `t-search` 搜索框
- `t-card` 课程卡片
- `t-progress` 进度条

---

#### Materials / Detail (资料详情)
**路径**: `/pages/materials/detail/` (新建)
**优先级**: 🟡 **MEDIUM**

**包含内容**:
- 顶部导航 (资料标题)
- 资料描述
- 资料类型标签 (PDF / Audio / Video)
- 下载/播放按钮
- 相关资料列表

**组件需求**:
- Material Item 组件
- 下载状态指示器

**TDesign 使用**:
- `t-button` 下载/播放按钮
- `t-tag` 资料类型标签
- `t-loading` 加载状态

---

#### Level Detail (关卡详情)
**路径**: `/pages/level/detail/` (新建)
**优先级**: 🟡 **MEDIUM**

**包含内容**:
- 后退按钮 + 关卡标题
- 关卡进度卡片
  - 关卡名称
  - 当前进度条
  - 目标说明
- 操作按钮
  - "START" / "CONTINUE" / "REVIEW"
  - 三个按钮根据关卡状态显示
- 关卡成绩展示 (如已完成)
  - 获得星数 (1-3)
  - 用时
  - 正确率
- 下一步提示

**组件需求**:
- Level Progress 卡片组件
- 星级显示组件

**TDesign 使用**:
- `t-button` 操作按钮
- `t-progress` 进度条
- `t-rate` 星级显示

---

#### Materials Player (播放器)
**路径**: `/pages/materials/player/` (新建)
**优先级**: 🟡 **MEDIUM**

**包含内容**:

##### PDF Player
- PDF 文件展示
- 页码显示 (当前页/总页)
- 上一页/下一页按钮
- 缩放控制
- 全屏按钮

##### Audio Player
- 播放控制 (播放/暂停/停止)
- 进度条 (可拖动)
- 当前时间/总时长
- 音量控制
- 播放列表 (如多个音频)

##### Video Player
- 视频播放器 (使用微信原生视频标签)
- 进度条
- 全屏按钮
- 清晰度切换 (如有)
- 播放速度调整

**组件需求**:
- Audio Player 组件
- Video Player 组件
- PDF Viewer 组件

**TDesign 使用**:
- `t-slider` 进度条/音量
- `t-button` 控制按钮
- `t-icon` 播放/暂停图标

---

## 🛠️ 技术方案

### TDesign 集成

#### 安装和配置
```
npm install tdesign-miniprogram
```

#### 使用方式
```json
{
  "usingComponents": {
    "t-button": "tdesign-miniprogram/button/button",
    "t-input": "tdesign-miniprogram/input/input",
    "t-icon": "tdesign-miniprogram/icon/icon",
    // ... 其他组件
  }
}
```

#### 混合策略
- ✅ **使用 TDesign**: Button, Input, Icon, Progress, Avatar, Badge, Card, List, Slider
- ⚠️ **参考 TDesign 修改**: 自定义组件按 overview-ui.pen 样式调整
- 🎨 **自定义实现**: 特殊卡片、复杂布局

---

## 📅 实现时间表

### 第一周
- [ ] 完成登录模块 (Flow 1-4) - 3天
  - [ ] Flow 1: Sign Back In
  - [ ] Flow 2: Auth Choice
  - [ ] Flow 3: Enter Details (新建)
  - [ ] Flow 4: Register Info (新建)
- [ ] League 排行榜页面 - 1.5天
- [ ] Courses 课程列表 - 1.5天

### 第二周
- [ ] Materials Player (播放器) - 2天
- [ ] Level Detail 页面 - 1.5天
- [ ] 各页面间导航和状态管理 - 1.5天
- [ ] 后端 API 对接基础框架 - 1天

### 第三周
- [ ] API 全量对接
- [ ] 数据缓存和离线支持
- [ ] 动画和交互优化
- [ ] 性能优化和分包
- [ ] 测试和修复

---

## 📦 新需要的组件

### 登录模块组件

#### Account Card 组件
```wxml
<account-card
  avatar="{{user.avatar}}"
  name="{{user.name}}"
  email="{{user.email}}"
  bind:tap="handleSelectAccount"
></account-card>
```

#### Input Card 组件 (复用于 Flow 3 & 4)
```wxml
<input-card
  type="email|password|text"
  placeholder="{{placeholder}}"
  value="{{value}}"
  bind:change="handleInputChange"
></input-card>
```

### 主流程组件

#### Leaderboard Row 组件
```wxml
<leaderboard-row
  rank="{{item.rank}}"
  avatar="{{item.avatar}}"
  name="{{item.name}}"
  score="{{item.score}}"
  trend="{{item.trend}}"
  isCurrentUser="{{item.isCurrentUser}}"
></leaderboard-row>
```

#### Course Card 组件
```wxml
<course-card
  id="{{item.id}}"
  title="{{item.title}}"
  cover="{{item.cover}}"
  progress="{{item.progress}}"
  materialCount="{{item.materialCount}}"
  bind:tap="handleCourseTap"
></course-card>
```

#### Material Item 组件
```wxml
<material-item
  id="{{item.id}}"
  title="{{item.title}}"
  type="{{item.type}}"
  downloaded="{{item.downloaded}}"
  bind:tap="handleMaterialTap"
></material-item>
```

#### Audio Player 组件
```wxml
<audio-player
  src="{{audioUrl}}"
  title="{{audioTitle}}"
  bind:play="handlePlay"
  bind:pause="handlePause"
></audio-player>
```

---

## 🎨 设计规范更新

### 新增颜色
```
--color-green: #58CC02       // 成功/Sign in 按钮
--color-green-dark: #6DD400  // Owl 深绿
--color-blue-primary: #1CB0F6 // 登录/主操作
--color-gray-light: #CFCFCF  // 禁用/锁定
--color-gray-dark: #5A5A5A   // 标题文本
```

### 新增间距规则
```
--space-form: 16px  // 表单项间距
--space-input: 12px // 输入框内部
--space-list: 8px   // 列表项间距
```

---

## 📝 API 接口规划

### 认证相关
```
POST /auth/login              # 登录
POST /auth/register           # 注册
POST /auth/refresh-token      # 刷新 Token
POST /auth/logout             # 登出
```

### 排行榜
```
GET /league/current           # 获取当前联赛
GET /league/leaderboard       # 获取排行榜列表
GET /league/user-rank         # 获取用户排名
```

### 课程和资料
```
GET /courses                  # 获取课程列表
GET /courses/{id}             # 获取课程详情
GET /courses/{id}/materials   # 获取课程资料
GET /materials/{id}           # 获取资料详情
POST /materials/{id}/download # 下载资料
```

### 关卡
```
GET /levels/{id}              # 获取关卡详情
PATCH /levels/{id}/progress   # 更新关卡进度
GET /levels/{id}/results      # 获取关卡成绩
```

---

## ✅ 验收标准

### 登录模块
- [ ] 所有4个Flow 页面完整实现
- [ ] 账户选择和切换正常
- [ ] 表单验证完善
- [ ] 第三方登录支持

### League 排行榜
- [ ] 排行榜列表正确显示
- [ ] 当前用户高亮
- [ ] 排名变化指示器准确
- [ ] 虚拟滚动性能良好 (1000+ 项)

### Courses 课程
- [ ] 课程列表正确显示
- [ ] 搜索功能工作
- [ ] 进度条准确
- [ ] 跳转到资料详情

### Materials Player
- [ ] PDF/Audio/Video 都能正常播放
- [ ] 进度保存
- [ ] 离线支持

### Level Detail
- [ ] 关卡信息完整
- [ ] 按钮状态正确
- [ ] 成绩显示准确

---

## 🚀 后续优化方向

1. **性能优化**
   - 分包加载
   - 图片优化和懒加载
   - 数据预加载

2. **用户体验**
   - 加载动画
   - 空态和错误态
   - 触觉反馈
   - 网络异常处理

3. **功能扩展**
   - 在线同步
   - 社交功能
   - 成就系统
   - 积分兑换

---

**文档版本**: 2.0
**最后更新**: 2026-02-11
**状态**: 📋 等待实现

