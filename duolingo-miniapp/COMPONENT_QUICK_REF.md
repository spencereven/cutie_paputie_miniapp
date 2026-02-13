# 📌 组件快速参考

快速查阅和复制粘贴组件代码片段

---

## 📦 Metrics (顶部指标)

### 注册
```json
{
  "usingComponents": {
    "metrics": "/components/metrics/metrics"
  }
}
```

### 基础用法
```wxml
<metrics
  hearts="{{hearts}}"
  streak="{{streak}}"
  gems="{{gems}}"
  power="{{power}}"
></metrics>
```

### 完整示例
```js
Page({
  data: {
    hearts: 19,
    streak: 846,
    gems: 8369,
    power: 25
  }
})
```

---

## 🎯 Unit Banner (单元横幅)

### 注册
```json
{
  "usingComponents": {
    "unit-banner": "/components/unit-banner/unit-banner"
  }
}
```

### 基础用法
```wxml
<unit-banner
  sectionLabel="SECTION 2, UNIT 99"
  title="Morning: Talk about getting ready"
  bind:action="handleBannerAction"
></unit-banner>
```

### 事件处理
```js
Page({
  handleBannerAction() {
    console.log('Banner clicked');
  }
})
```

---

## 🃏 Level Card (关卡卡片)

### 注册
```json
{
  "usingComponents": {
    "level-card": "/components/level-card/level-card"
  }
}
```

### 单个卡片
```wxml
<level-card
  id="1"
  title="Level 1"
  subtitle="Intro"
  iconType="blue"
  iconContent="⭐"
  showLock="{{false}}"
  bind:tap="handleLevelClick"
></level-card>
```

### 列表渲染
```wxml
<view class="levels-container">
  <level-card
    wx:for="{{levels}}"
    wx:key="id"
    id="{{item.id}}"
    title="{{item.title}}"
    subtitle="{{item.subtitle}}"
    iconType="{{item.iconType}}"
    iconContent="{{item.iconContent}}"
    showLock="{{item.showLock}}"
    bind:tap="handleLevelClick"
  ></level-card>
</view>
```

### 数据结构
```js
Page({
  data: {
    levels: [
      { id: 1, title: 'Level 1', subtitle: 'Intro', iconType: 'blue', iconContent: '⭐', showLock: false },
      { id: 2, title: 'Level 2', subtitle: 'Speaking', iconType: 'blue', iconContent: '🎤', showLock: false },
      { id: 3, title: 'Chest', subtitle: 'Reward', iconType: 'brown', iconContent: '💰', showLock: false },
      { id: 4, title: 'Story', subtitle: 'Adventure', iconType: 'green', iconContent: '🎯', showLock: false },
      { id: 5, title: 'Review', subtitle: 'Practice', iconType: 'blue', iconContent: '🔄', showLock: false },
      { id: 6, title: 'Listen', subtitle: 'Locked', iconType: 'gray', iconContent: '🎧', showLock: true }
    ]
  },
  handleLevelClick(e) {
    const { id } = e.detail;
    console.log('Clicked:', id);
  }
})
```

### 图标类型
- `blue` - 蓝色（普通课程）
- `brown` - 棕色（奖励）
- `gray` - 灰色（锁定）
- `green` - 绿色（特殊）

---

## 📖 Section Card (Section卡片)

### 注册
```json
{
  "usingComponents": {
    "section-card": "/components/section-card/section-card"
  }
}
```

### 简单卡片
```wxml
<section-card
  id="1"
  title="Section 1"
  badgeText="5 to 9"
  progress="{{100}}"
></section-card>
```

### 完整卡片
```wxml
<section-card
  id="2"
  title="Section 2"
  badgeText="10 to 19"
  badgeIcon="🚩"
  progress="{{65}}"
  hasTopContent="{{true}}"
  topBgColor="blue"
  bubbleText="Je commence en français."
  showCharacter="{{true}}"
  characterIcon="🦉"
  jumpText="JUMP HERE"
  bind:tap="handleSectionTap"
></section-card>
```

### 数据结构
```js
Page({
  data: {
    sections: [
      {
        id: 1,
        title: 'Section 1',
        badgeText: '5 to 9',
        badgeIcon: '🚩',
        progress: 100,
        hasTopContent: false
      },
      {
        id: 2,
        title: 'Section 2',
        badgeText: '10 to 19',
        badgeIcon: '🚩',
        progress: 65,
        hasTopContent: true,
        topBgColor: 'blue',
        bubbleText: 'Je commence en français.',
        showCharacter: false,
        characterIcon: '🦉',
        jumpText: ''
      },
      {
        id: 3,
        title: 'Section 3',
        badgeText: '20 to 29',
        badgeIcon: '🚩',
        progress: 45,
        hasTopContent: true,
        topBgColor: 'blue',
        bubbleText: 'Je connais quelques mots.',
        showCharacter: true,
        characterIcon: '🦉',
        jumpText: 'JUMP HERE'
      }
    ]
  },
  handleSectionTap(e) {
    const { id } = e.detail;
    console.log('Tapped:', id);
  }
})
```

---

## 🧭 Bottom Nav (底部导航)

### 注册
```json
{
  "usingComponents": {
    "bottom-nav": "/components/bottom-nav/bottom-nav"
  }
}
```

### 基础用法
```wxml
<bottom-nav
  activeTab="{{currentTab}}"
  bind:navchange="handleNavChange"
></bottom-nav>
```

### 完整实现
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
        wx.showActionSheet({ itemList: ['设置', '关于', '退出登录'] });
        break;
    }
  }
})
```

### 导航项列表
- `home` - 首页
- `league` - 排行榜
- `courses` - 课程
- `more` - 更多

---

## 🎨 完整页面示例

### 首页结构
```wxml
<view class="page">
  <scroll-view class="main-container" scroll-y="true">
    <!-- 顶部指标 -->
    <metrics hearts="{{hearts}}" streak="{{streak}}" gems="{{gems}}" power="{{power}}"></metrics>

    <!-- 单元横幅 -->
    <unit-banner sectionLabel="{{sectionLabel}}" title="{{bannerTitle}}" bind:action="handleBannerAction"></unit-banner>

    <!-- 关卡列表 -->
    <view class="levels-container">
      <level-card
        wx:for="{{levels}}"
        wx:key="id"
        id="{{item.id}}"
        title="{{item.title}}"
        subtitle="{{item.subtitle}}"
        iconType="{{item.iconType}}"
        iconContent="{{item.iconContent}}"
        showLock="{{item.showLock}}"
        bind:tap="handleLevelClick"
      ></level-card>
    </view>
  </scroll-view>

  <!-- 底部导航 -->
  <bottom-nav activeTab="{{activeTab}}" bind:navchange="handleNavChange"></bottom-nav>
</view>
```

### Section 列表页结构
```wxml
<view class="page">
  <!-- 顶部导航 -->
  <view class="top-nav">
    <text class="nav-back" bindtap="handleBack">←</text>
    <text class="nav-title">{{courseLanguage}}</text>
    <view class="nav-spacer"></view>
  </view>

  <view class="nav-divider"></view>

  <!-- Section 列表 -->
  <scroll-view class="content-container" scroll-y="true">
    <view class="sections-list">
      <section-card
        wx:for="{{sections}}"
        wx:key="id"
        id="{{item.id}}"
        title="{{item.title}}"
        badgeText="{{item.badgeText}}"
        progress="{{item.progress}}"
        hasTopContent="{{item.hasTopContent}}"
        bubbleText="{{item.bubbleText}}"
        showCharacter="{{item.showCharacter}}"
        jumpText="{{item.jumpText}}"
        bind:tap="handleSectionTap"
      ></section-card>
    </view>
  </scroll-view>
</view>
```

---

## 💡 常用代码片段

### 初始化数据
```js
Page({
  data: {
    hearts: 19,
    streak: 846,
    gems: 8369,
    power: 25,
    sectionLabel: 'SECTION 2, UNIT 99',
    bannerTitle: 'Morning: Talk about\ngetting ready',
    currentTab: 'home',
    levels: [],
    sections: []
  }
})
```

### 导航到 Sections 页面
```js
wx.navigateTo({
  url: '/pages/sections/list/list'
})
```

### 更新指标
```js
this.setData({
  hearts: 15,
  gems: 8400
})
```

### 更新进度
```js
this.setData({
  ['sections[0].progress']: 75
})
```

---

## 📂 文件结构
```
duolingo-miniapp/
├── components/
│   ├── metrics/
│   │   ├── metrics.wxml
│   │   ├── metrics.wxss
│   │   ├── metrics.js
│   │   └── metrics.json
│   ├── unit-banner/
│   ├── level-card/
│   ├── section-card/
│   └── bottom-nav/
├── pages/
│   ├── index/
│   └── sections/list/
├── COMPONENTS_GUIDE.md
└── COMPONENT_QUICK_REF.md (本文件)
```

---

**快速参考版本**: 1.0.0
**最后更新**: 2026-02-11

