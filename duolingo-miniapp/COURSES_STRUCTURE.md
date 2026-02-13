# 课程部分 - 文件结构 & 架构说明

## 目录布局

```
duolingo-miniapp/
├── pages/
│   ├── courses/
│   │   └── list/                    (课程目录页)
│   │       ├── list.wxml            (水平卡片布局)
│   │       ├── list.js              (模拟数据、导航)
│   │       ├── list.wxss            (卡片样式)
│   │       └── list.json            (页面配置)
│   │
│   └── materials/
│       └── detail/                  (课堂资料页)
│           ├── detail.wxml          (分区布局)
│           ├── detail.js            (音频播放逻辑)
│           ├── detail.wxss          (完整样式)
│           └── detail.json          (页面配置)
```

## 组件层级结构

### 课程列表页面
```
page
├── top-bar (顶部导航)
│   ├── back-btn (返回按钮)
│   ├── page-title (页面标题)
│   └── spacer (占位符)
├── content (滚动容器)
│   ├── header (头部)
│   │   ├── main-title ("课程目录")
│   │   └── main-subtitle ("选择一节课...")
│   ├── courses-container (课程容器)
│   │   └── course-card (×3) [弹性布局]
│   │       ├── card-thumbnail (缩略图)
│   │       ├── card-content (内容区)
│   │       └── card-chevron (箭头)
│   └── bottom-spacing (底部空白)
```

### 课堂资料页面
```
page
├── top-bar (顶部导航)
│   ├── back-btn (返回按钮)
│   ├── page-title (页面标题)
│   └── spacer (占位符)
├── content (滚动容器)
│   ├── header (头部)
│   │   ├── main-title ("课堂资料")
│   │   └── main-subtitle ("老师上传的...")
│   ├── section (课件分区)
│   │   ├── section-title ("课件")
│   │   └── material-card (文件卡片)
│   │       ├── icon-container (图标)
│   │       ├── card-content (内容)
│   │       └── card-cta (操作链接)
│   ├── section (音频分区)
│   │   ├── section-title ("音频")
│   │   └── audio-player (×3)
│   │       ├── play-button (播放按钮)
│   │       ├── progress-container (进度条)
│   │       └── duration-text (时长)
│   ├── section (视频分区)
│   │   ├── section-title ("视频")
│   │   └── video-card (视频卡片)
│   │       ├── video-thumbnail (缩略图)
│   │       └── video-info (视频信息)
│   └── bottom-spacing (底部空白)
├── bottom-nav (底部导航)
│   └── nav-item (×5 导航项)
```

## 数据流向

### 课程列表 → 课堂资料
```javascript
// 点击课程卡片，导航到资料页
handleCourseClick(e) {
  const courseId = e.currentTarget.dataset.id;
  wx.navigateTo({
    url: `/pages/materials/detail/detail?id=${courseId}`
  });
}
```

### 课堂资料 - 音频状态管理
```javascript
// 三个音频播放器的状态
data: {
  audioStates: [
    { isPlaying: false, progress: 0, duration: '0:12' },
    { isPlaying: false, progress: 0, duration: '0:08' },
    { isPlaying: false, progress: 0, duration: '0:15' }
  ]
}

// 音频进度模拟：0 → 100%，每100ms增加2%
simulateAudioProgress(index) {
  if (!this.data.audioStates[index].isPlaying) return;
  const newProgress = Math.min(currentProgress + 2, 100);
  setTimeout(() => this.simulateAudioProgress(index), 100);
}
```

## 样式架构

### 色彩方案
```css
/* 主色 */
#2CB7FF  - 蓝色 (按钮、活跃状态)

/* 文字色 */
#4A4A4A  - 深灰 (标题、主要文本)
#8A8A8A  - 中灰 (副标题)
#B0B0B0  - 浅灰 (元信息)
#C0C0C0  - 极浅灰 (非活跃图标)

/* 背景色 */
#FFFFFF  - 白色 (卡片、分区)
#F7F7F7  - 浅灰 (音频播放器)
#E6E6E6  - 边框灰

/* 强调背景色 */
#E5F6FF  - 浅蓝 (图标背景)
#DDEEFF  - 更浅蓝 (视频缩略图)
```

### 字体排版
```css
/* 标题 */
font-size: 22px; font-weight: 800;  /* 主标题 */
font-size: 16px; font-weight: 800;  /* 分区标题 */
font-size: 15px; font-weight: 800;  /* 卡片标题 */

/* 副标题 */
font-size: 12px; font-weight: 600;  /* 副标题、元信息 */

/* 正文 */
font-size: 14px; font-weight: 600;  /* 常规文本 */
font-size: 12px; font-weight: 600;  /* 小号文本 */
```

## 响应式设计

### 桌面端 (≥390px)
- 常规内边距/间距
- 标准大小缩略图 (90x90)
- 标准字号大小

### 移动端 (≤375px)
- 减小内边距 (16px 代替 20px)
- 缩小缩略图 (80x80)
- 略小字号 (-1-2px)
- 紧凑导航按钮

## 集成点

### 必需导航
1. 首页/首屏 → 课程列表
2. 课程列表 → 课堂资料

### 可选导航
1. 底部导航图标 (目前为静态)
2. 课件"查看全部"链接

## 测试建议

### 视觉测试
- [ ] 与设计截图对比 (mLJNo, CRc7l)
- [ ] 检查响应式断点 (390px, 375px)
- [ ] 验证色彩准确度
- [ ] 检查字体 (大小、粗细)

### 功能测试
- [ ] 课程列表显示 3 节课
- [ ] 点击课程卡片导航到资料页
- [ ] 音频播放器独立播放/暂停
- [ ] 返回按钮返回前一页
- [ ] 底部导航图标正常显示

### 性能
- [ ] 滚动容器平滑滚动
- [ ] 音频进度平滑更新 (100ms间隔)
- [ ] 交互无卡顿

---
**架构版本**: 1.0
**最后更新**: 2026-02-11
