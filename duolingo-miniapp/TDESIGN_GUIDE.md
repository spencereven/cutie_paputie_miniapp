# 🎨 TDesign UI组件库集成指南

## 概述

本指南展示如何在Duolingo小程序中集成和使用TDesign组件库，以加速UI开发。

## 📦 安装TDesign

### 方式1: NPM安装（推荐）

```bash
# 进入项目目录
cd duolingo-miniapp

# 安装TDesign小程序组件库
npm install tdesign-miniprogram

# 安装完成后，在微信开发者工具中构建npm
# 菜单 > 工具 > 构建npm
```

### 方式2: 直接下载

从 [TDesign GitHub](https://github.com/Tencent/tdesign-miniprogram) 下载，解压到项目根目录

## 🚀 使用组件

### 1. 在Page的JSON中注册组件

**pages/index/index.json**:

```json
{
  "navigationBarTitleText": "Duolingo",
  "usingComponents": {
    "t-button": "tdesign-miniprogram/button/button",
    "t-badge": "tdesign-miniprogram/badge/badge",
    "t-tabbar": "tdesign-miniprogram/tabbar/tabbar",
    "t-tab-bar-item": "tdesign-miniprogram/tab-bar-item/tab-bar-item"
  }
}
```

### 2. 在WXML中使用组件

**pages/index/index.wxml**:

```wxml
<!-- 使用TDesign按钮 -->
<t-button theme="primary" size="large" bind:tap="handleStart">
  开始学习
</t-button>

<!-- 使用TDesign徽章 -->
<t-badge count="10">
  <view class="slot-header">❤️</view>
</t-badge>

<!-- 使用TDesign标签栏替代底部导航 -->
<t-tabbar value="{{activeTab}}" bind:change="onTabChange">
  <t-tab-bar-item icon="home" label="首页" value="0"/>
  <t-tab-bar-item icon="star" label="成就" value="1"/>
  <t-tab-bar-item icon="more" label="更多" value="2"/>
</t-tabbar>
```

## 📱 推荐组件使用方案

### 按钮组件 (t-button)

```wxml
<!-- 主要操作按钮 -->
<t-button theme="primary" bind:tap="handleStart">
  开始课程
</t-button>

<!-- 次要操作 -->
<t-button theme="light" bind:tap="handleSkip">
  跳过
</t-button>

<!-- 危险操作 -->
<t-button theme="danger" bind:tap="handleDelete">
  删除
</t-button>
```

### 徽章组件 (t-badge)

```wxml
<!-- 显示未读数 -->
<t-badge count="10" max-count="99">
  <view class="badge-wrapper">❤️</view>
</t-badge>

<!-- 显示点 -->
<t-badge dot>
  <view class="dot-wrapper">消息</view>
</t-badge>
```

### 标签栏组件 (t-tabbar)

```wxml
<t-tabbar value="{{activeTab}}" bind:change="onTabChange" safe-area-inset-bottom>
  <t-tab-bar-item
    icon="home"
    label="首页"
    value="0"
    badge="{{tabBadges[0]}}"
  />
  <t-tab-bar-item icon="star" label="成就" value="1"/>
  <t-tab-bar-item icon="user" label="我的" value="2"/>
</t-tabbar>
```

### 对话框组件 (t-dialog)

```wxml
<t-dialog
  visible="{{showDialog}}"
  title="确认"
  content="是否确定删除?"
  confirm-btn="确定"
  cancel-btn="取消"
  bind:confirm="onConfirm"
  bind:cancel="onCancel"
/>
```

### 输入框组件 (t-input)

```wxml
<t-input
  bind:input="onInput"
  type="text"
  placeholder="搜索课程..."
  clearable
/>
```

### 卡片组件 (t-cell)

```wxml
<view class="cell-container">
  <t-cell title="学习进度" value="80%"/>
  <t-cell title="当前等级" value="8级"/>
  <t-cell title="连胜天数" value="7天" is-link bind:tap="toStats"/>
</view>
```

## 🎨 样式定制

### 创建TDesign主题配置

**pages/index/index.wxss**:

```wxss
/* 覆盖TDesign主题变量 */
page {
  --td-brand-color: #2CB7FF;
  --td-brand-color-6: #E5F6FF;
  --td-success-color: #00A870;
  --td-warning-color: #F5A623;
  --td-error-color: #E94B3C;
  --td-text-color-primary: #111111;
  --td-text-color-secondary: #666666;
  --td-bg-color-primary: #FFFFFF;
}

/* 自定义TDesign组件 */
:deep(.t-button--primary) {
  border-radius: 12px;
}

:deep(.t-badge) {
  --td-badge-bg-color: #2CB7FF;
}
```

## 📋 TDesign主要组件列表

| 组件 | 用途 | 推荐场景 |
|------|------|--------|
| `t-button` | 按钮 | 操作按钮 |
| `t-badge` | 徽章 | 计数显示 |
| `t-tabbar` | 标签栏 | 底部导航 |
| `t-navbar` | 导航栏 | 顶部标题栏 |
| `t-dialog` | 对话框 | 确认提示 |
| `t-input` | 输入框 | 表单输入 |
| `t-cell` | 单元格 | 列表项 |
| `t-icon` | 图标 | 各类图标 |
| `t-popup` | 弹窗 | 浮层展示 |
| `t-loading` | 加载 | 加载动画 |

## 💻 完整示例：改进的首页

**pages/index/index.wxml**:

```wxml
<view class="page">
  <!-- 使用TDesign导航栏 -->
  <t-navbar
    title="Duolingo"
    left-icon="home"
    right-icon="setting"
  />

  <!-- 主容器 -->
  <scroll-view class="main-container" scroll-y="true">
    <!-- 指标卡片使用徽章 -->
    <view class="metrics-container">
      <view class="metric-item">
        <t-badge count="10" max-count="99">
          <view class="badge-wrapper">❤️</view>
        </t-badge>
      </view>
      <view class="metric-item">
        <t-badge count="846">
          <view class="badge-wrapper">🔥</view>
        </t-badge>
      </view>
      <!-- 其他指标... -->
    </view>

    <!-- 课程列表使用Cell组件 -->
    <view class="levels-container">
      <t-cell
        wx:for="{{levels}}"
        wx:key="id"
        title="{{item.title}}"
        description="{{item.subtitle}}"
        left-icon="{{item.icon}}"
        is-link
        bind:tap="handleLevelClick"
        data-id="{{item.id}}"
      />
    </view>
  </scroll-view>

  <!-- 使用TDesign标签栏替代底部导航 -->
  <t-tabbar
    value="{{activeTab}}"
    bind:change="handleTabChange"
    safe-area-inset-bottom
  >
    <t-tab-bar-item icon="home" label="首页" value="0"/>
    <t-tab-bar-item icon="star" label="成就" value="1"/>
    <t-tab-bar-item icon="user" label="我的" value="2"/>
  </t-tabbar>
</view>
```

**pages/index/index.js**:

```javascript
Page({
  data: {
    activeTab: '0',
    levels: [
      { id: 1, title: 'Level 1', subtitle: 'Intro', icon: '🟦' },
      // ... 更多课程
    ]
  },

  handleTabChange(e) {
    const tab = e.detail;
    console.log('Tab changed to:', tab);

    if (tab === '1') {
      wx.navigateTo({ url: '/pages/achievement/achievement' });
    }
  },

  handleLevelClick(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: `开始第${id}课`,
      icon: 'success'
    });
  }
});
```

## 🔧 高级配置

### 配置全局TDesign主题

在 `app.wxss` 中：

```wxss
:root {
  /* 品牌色 */
  --td-brand-color: #2CB7FF;
  --td-brand-color-1: #f0f9ff;
  --td-brand-color-2: #ddf3ff;
  --td-brand-color-3: #b3e0ff;
  --td-brand-color-4: #85c8ff;
  --td-brand-color-5: #5db0ff;
  --td-brand-color-6: #35a7ff;
  --td-brand-color-7: #1f9fff;
  --td-brand-color-8: #0d91ff;
  --td-brand-color-9: #0081e0;

  /* 文本色 */
  --td-text-color-primary: #111111;
  --td-text-color-secondary: #666666;
  --td-text-color-disabled: #999999;

  /* 背景色 */
  --td-bg-color-primary: #ffffff;
  --td-bg-color-secondary: #f5f5f5;

  /* 边框色 */
  --td-border-color-light: #e6e6e6;
  --td-border-color-base: #d9d9d9;
}
```

### 使用TDesign Icon

```wxml
<!-- 安装icon库后使用 -->
<t-icon name="home" size="24" color="#2CB7FF" />
<t-icon name="star" size="24" color="#F5A623" />
<t-icon name="setting" size="24" color="#666666" />
```

## 📚 资源链接

- [TDesign小程序官网](https://tdesign.tencent.com/miniprogram/overview)
- [组件文档](https://tdesign.tencent.com/miniprogram/components)
- [GitHub仓库](https://github.com/Tencent/tdesign-miniprogram)
- [设计规范](https://tdesign.tencent.com/design/introduce)

## ⚠️ 注意事项

1. **NPM构建**: 安装后需在微信开发者工具中构建npm
2. **路径问题**: 组件路径为 `tdesign-miniprogram/组件名/组件名`
3. **样式冲突**: 自定义样式可能与TDesign冲突，使用 `:deep()` 覆盖
4. **性能**: TDesign组件较重，按需使用

## 🎯 最佳实践

✅ **推荐做法**：
- 只引入需要的组件
- 统一使用TDesign还是原生组件
- 在全局样式中配置主题
- 使用TDESIGN提供的icon

❌ **避免做法**：
- 混用多个UI库
- 过度自定义导致样式混乱
- 不必要地引入所有组件
- 忽视性能影响

---

**更新时间**: 2026年2月11日
