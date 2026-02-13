# 🧩 Duolingo 小程序 - 组件使用指南

基于 `overview-ui.pen` 设计稿的完整可复用组件库

---

## 📋 目录

1. [顶部指标组件 (Metrics)](#顶部指标组件)
2. [单元横幅组件 (Unit Banner)](#单元横幅组件)
3. [关卡卡片组件 (Level Card)](#关卡卡片组件)
4. [Section卡片组件 (Section Card)](#section卡片组件)
5. [底部导航组件 (Bottom Navigation)](#底部导航组件)

---

## 顶部指标组件

### 路径
`/components/metrics/metrics`

### 功能
展示用户的四个主要指标：心形(生命值)、火焰(连续天数)、宝石(货币)、闪电(能量)

### 属性 (Properties)

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| hearts | Number | 5 | 心形指标数值 |
| streak | Number | 0 | 火焰指标数值 |
| gems | Number | 0 | 宝石指标数值 |
| power | Number | 0 | 闪电指标数值 |

### 事件 (Events)

| 事件名 | 说明 | 回调参数 |
|--------|------|--------|
| metrictap | 点击指标项时触发 | `{ type: string }` |

### 使用示例

```wxml
<!-- 在页面中注册组件 -->
<metrics
  hearts="{{19}}"
  streak="{{846}}"
  gems="{{8369}}"
  power="{{25}}"
  bind:metrictap="handleMetricTap"
></metrics>
```

```js
// 在页面 JSON 中配置
{
  "usingComponents": {
    "metrics": "/components/metrics/metrics"
  }
}
```

### 样式定制
- 组件使用固定大小和颜色，通过 CSS 变量可自定义
- 响应式适配所有设备

---

## 单元横幅组件

### 路径
`/components/unit-banner/unit-banner`

### 功能
展示当前学习单元的标题和快捷操作按钮，采用蓝色渐变背景

### 属性 (Properties)

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| sectionLabel | String | 'SECTION 1, UNIT 1' | Section 标签文本 |
| title | String | 'Getting started' | 单元标题 |

### 事件 (Events)

| 事件名 | 说明 | 回调参数 |
|--------|------|--------|
| action | 点击操作按钮时触发 | `{ timestamp: number }` |

### 使用示例

```wxml
<unit-banner
  sectionLabel="SECTION 2, UNIT 99"
  title="Morning: Talk about getting ready"
  bind:action="handleBannerAction"
></unit-banner>
```

```js
Page({
  handleBannerAction() {
    console.log('Banner action clicked');
  }
})
```

### 样式特点
- 蓝色渐变背景 (#2CB7FF → #1FAEE8)
- 高度 72px，自适应宽度
- 包含图标按钮，支持点击反馈

---

## 关卡卡片组件

### 路径
`/components/level-card/level-card`

### 功能
展示单个关卡的信息卡片，支持多种图标类型和锁定状态

### 属性 (Properties)

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| id | String | '' | 卡片唯一标识 |
| title | String | 'Level' | 卡片标题 |
| subtitle | String | 'Practice' | 卡片副标题 |
| iconContent | String | '⭐' | 图标内容（Emoji 或文本） |
| iconType | String | 'blue' | 图标背景类型：'blue' \| 'brown' \| 'gray' \| 'green' |
| showLock | Boolean | false | 是否显示锁定状态 |

### 事件 (Events)

| 事件名 | 说明 | 回调参数 |
|--------|------|--------|
| tap | 点击卡片时触发（未锁定） | `{ id: string }` |
| locktap | 点击锁定的卡片时触发 | `{ id: string }` |

### 使用示例

```wxml
<level-card
  id="level_1"
  title="Level 1"
  subtitle="Intro"
  iconType="blue"
  iconContent="⭐"
  showLock="{{false}}"
  bind:tap="handleLevelClick"
></level-card>
```

```js
Page({
  data: {
    levels: [
      { id: 1, title: 'Level 1', subtitle: 'Intro', iconType: 'blue', iconContent: '⭐' },
      { id: 2, title: 'Level 2', subtitle: 'Speaking', iconType: 'blue', iconContent: '🎤' },
      { id: 3, title: 'Chest', subtitle: 'Reward', iconType: 'brown', iconContent: '💰' }
    ]
  },
  handleLevelClick(e) {
    const { id } = e.detail;
    console.log('Clicked level:', id);
  }
})
```

### 图标类型

| 类型 | 背景色 | 适用场景 |
|------|--------|--------|
| blue | 浅蓝色 | 普通课程关卡 |
| brown | 棕色 | 奖励/treasure chest |
| gray | 浅灰色 | 锁定的关卡 |
| green | 绿色 | 特殊关卡 |

---

## Section卡片组件

### 路径
`/components/section-card/section-card`

### 功能
展示 Section 的详细信息卡片，包含可选的顶部内容区（对话框+角色）和进度条

### 属性 (Properties)

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| id | String | '' | 卡片唯一标识 |
| title | String | 'Section 1' | Section 标题 |
| badgeText | String | '5 to 9' | 徽章文本（级别范围） |
| badgeIcon | String | '🚩' | 徽章图标 |
| progress | Number | 100 | 进度百分比 (0-100) |
| hasTopContent | Boolean | false | 是否显示顶部内容区 |
| topBgColor | String | 'blue' | 顶部背景色：'blue' |
| bubbleText | String | '' | 对话框文本 |
| showCharacter | Boolean | false | 是否显示角色图标 |
| characterIcon | String | '🦉' | 角色图标 |
| jumpText | String | '' | 跳过按钮文本（为空时不显示） |

### 事件 (Events)

| 事件名 | 说明 | 回调参数 |
|--------|------|--------|
| tap | 点击卡片时触发 | `{ id: string }` |

### 使用示例

```wxml
<!-- 简单的 Section 卡片（无顶部内容） -->
<section-card
  id="section_1"
  title="Section 1"
  badgeText="5 to 9"
  progress="{{100}}"
></section-card>

<!-- 包含对话框和角色的 Section 卡片 -->
<section-card
  id="section_2"
  title="Section 2"
  badgeText="10 to 19"
  progress="{{65}}"
  hasTopContent="{{true}}"
  bubbleText="Je commence en français."
  showCharacter="{{true}}"
  characterIcon="🦉"
></section-card>

<!-- 包含跳过选项的 Section 卡片 -->
<section-card
  id="section_3"
  title="Section 3"
  badgeText="20 to 29"
  progress="{{45}}"
  hasTopContent="{{true}}"
  bubbleText="Je connais quelques mots."
  showCharacter="{{true}}"
  jumpText="JUMP HERE"
  bind:tap="handleSectionTap"
></section-card>
```

```js
Page({
  data: {
    sections: [
      {
        id: 1,
        title: 'Section 1',
        badgeText: '5 to 9',
        progress: 100,
        hasTopContent: false
      },
      {
        id: 2,
        title: 'Section 2',
        badgeText: '10 to 19',
        progress: 65,
        hasTopContent: true,
        bubbleText: 'Je commence en français.',
        showCharacter: false
      }
    ]
  },
  handleSectionTap(e) {
    const { id } = e.detail;
    console.log('Tapped section:', id);
  }
})
```

### 进度条
- 自动限制在 0-100 范围内
- 绿色填充背景 (#40C400)
- 平滑的宽度动画

---

## 底部导航组件

### 路径
`/components/bottom-nav/bottom-nav`

### 功能
应用底部导航栏，包含 Home、League、Courses、More 四个导航项，支持激活状态切换

### 属性 (Properties)

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| activeTab | String | 'home' | 当前激活的标签：'home' \| 'league' \| 'courses' \| 'more' |

### 事件 (Events)

| 事件名 | 说明 | 回调参数 |
|--------|------|--------|
| navchange | 导航切换时触发 | `{ tab: string, timestamp: number }` |

### 使用示例

```wxml
<bottom-nav
  activeTab="{{currentTab}}"
  bind:navchange="handleNavChange"
></bottom-nav>
```

```js
Page({
  data: {
    currentTab: 'home'
  },
  handleNavChange(e) {
    const { tab } = e.detail;
    this.setData({ currentTab: tab });

    switch (tab) {
      case 'home':
        wx.navigateTo({ url: '/pages/index/index' });
        break;
      case 'league':
        wx.navigateTo({ url: '/pages/league/sapphire/sapphire' });
        break;
      case 'courses':
        wx.navigateTo({ url: '/pages/courses/list/list' });
        break;
      case 'more':
        wx.showActionSheet({ itemList: ['设置', '关于'] });
        break;
    }
  }
})
```

### 导航项

| 标签 | 图标 | 说明 |
|------|------|------|
| home | 🏠 | 首页 |
| league | 🏆 | 排行榜 |
| courses | 📚 | 课程资料 |
| more | ⋯ | 更多选项 |

### 激活状态
- 激活项背景色：#E5F6FF
- 激活项有圆角，其他项无背景
- 点击时有缩放反馈动画

---

## 🎨 设计系统

### 颜色系统

```css
/* 主色 */
--color-primary: #2CB7FF      /* 蓝色 */
--color-primary-light: #E5F6FF
--color-primary-dark: #1FAEE8

/* 功能色 */
--color-success: #40C400      /* 绿色 */
--color-warning: #F5A623      /* 金色 */
--color-error: #FF4458        /* 红色 */

/* 中立色 */
--color-bg: #F5F5F5
--color-text-primary: #4A4A4A
--color-text-secondary: #8A8A8A
--color-text-disabled: #999999
--color-border: #E6E6E6
```

### 间距系统

```
4px (xs), 6px (sm), 8px (md), 12px (lg), 16px (xl), 24px (2xl), 32px (3xl)
```

### 圆角系统

```
4px (xs), 6px (sm), 8px (md), 10px (lg), 12px (xl), 14px (2xl), 16px (3xl)
```

### 字体大小

```
10px (xs), 11px (sm), 12px (md), 13px (base), 14px (lg), 16px (xl), 18px (2xl)
```

---

## 📱 响应式设计

所有组件均支持响应式设计，在以下断点自动调整：

- **小屏幕** (≤375px)：减小 padding、margin、font-size
- **中等屏幕** (376px-768px)：标准尺寸
- **大屏幕** (≥769px)：可能需要额外的水平 padding

---

## 🚀 最佳实践

### 1. 组件导入

```js
// 在页面 JSON 中配置（推荐）
{
  "usingComponents": {
    "metrics": "/components/metrics/metrics",
    "unit-banner": "/components/unit-banner/unit-banner",
    "level-card": "/components/level-card/level-card",
    "section-card": "/components/section-card/section-card",
    "bottom-nav": "/components/bottom-nav/bottom-nav"
  }
}
```

### 2. 数据绑定

```js
// 使用 wx:for 渲染列表
<level-card
  wx:for="{{levels}}"
  wx:key="id"
  id="{{item.id}}"
  title="{{item.title}}"
  subtitle="{{item.subtitle}}"
></level-card>
```

### 3. 事件处理

```js
// 接收组件事件并处理
handleLevelClick(e) {
  const { id } = e.detail;
  // 处理逻辑
}
```

### 4. 动态属性更新

```js
// 使用 setData 更新组件属性
this.setData({
  hearts: newValue,
  progress: newValue
});
```

---

## 🔧 常见问题

### Q: 如何修改组件样式？

A: 组件使用的是 WXSS，可以通过以下方式修改：

1. 直接编辑组件文件的 `.wxss`
2. 在使用组件的页面的 `.wxss` 中覆盖样式（使用更高的特异性）
3. 在 `app.wxss` 中定义全局样式

### Q: 如何处理组件间通信？

A: 使用事件系统：
- 子组件通过 `triggerEvent` 发送事件
- 父组件通过 `bind:eventname` 监听事件

### Q: 如何在不同页面使用相同的组件？

A: 只需在页面 JSON 中配置 `usingComponents`，就可以在该页面使用对应的组件。

### Q: 组件支持插槽 (slot) 吗？

A: 目前这些组件不使用插槽，如需扩展功能，可以：
1. 修改组件源码
2. 创建新的衍生组件
3. 使用组件的属性配置灵活的内容

---

## 📞 支持与反馈

遇到问题或有改进建议？

1. 查看各组件源代码的注释
2. 参考示例页面的实现
3. 检查微信开发者工具的控制台错误

---

**最后更新**: 2026-02-11
**组件版本**: 1.0.0
**兼容性**: 微信小程序基础库 >= 2.6.0

