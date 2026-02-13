# League Sapphire 排行榜 - 快速参考

## 📍 页面位置
`/pages/league/sapphire/sapphire`

## 🎯 核心功能

### 排名选择 (新增)
```
┌──────────────────────────────────┐
│ 排名方式: [班级] [校区] [全国]   │ ← 可选择
└──────────────────────────────────┘
```

### 排行榜信息
```
联赛剩余时间: 3 days
用户排名: #8 (班级) / #8 (校区) / #32 (全国)
学习时长: 156h (音频 + 视频)
```

### 排行榜列表
```
┌────┬─────────────────────┬────────┐
│排名│ 用户                │学习时长│
├────┼─────────────────────┼────────┤
│ #1 │Alex Chen            │ 285h   │
│ #2 │Jessica Lee          │ 272h   │
│ #3 │Marco Rossi          │ 261h   │
│...                              ...│
│ #8 │Sam Lee (当前用户) ✓ │ 156h   │ ← 高亮显示
│ #9 │Tom Brown            │ 214h   │
└────┴─────────────────────┴────────┘
```

## 📊 数据对比

| 项目 | 班级 | 校区 | 全国 |
|------|------|------|------|
| 显示人数 | 12 | 12 | 15 |
| 用户排名 | #8 | #8 | #32 |
| 学习时长 | 156h | 156h | 156h |
| 最高学习时长 | 285h | 285h | 285h |

## 🔧 主要变化

### 数据字段
```javascript
// 旧
points: 4250 XP

// 新
studyHours: 156  // 单位: h (小时)
```

### 页面信息
```wxml
<!-- 旧 -->
<text>{{userPoints}} XP</text>

<!-- 新 -->
<text>{{userStudyHours}}h</text>
```

## 🎨 UI 元素

### 排名选择器
```
[班级] [校区] [全国]
 激活   禁用   禁用
```

**样式**:
- 默认: 浅灰 #F5F5F5
- 激活: 蓝色 #2CB7FF
- 圆角: 8px
- 过渡: 0.2s

### 用户行高亮
```
背景色: #F0FFF0 (浅绿)
左边框: #58CC02 (绿色) 4px
```

## 📱 响应式

### 桌面端 (≥390px)
- 排名选择器: 全宽
- 字号: 13px (标签) / 12px (按钮)
- 内边距: 12px

### 移动端 (≤375px)
- 排名选择器: 全宽，更紧凑
- 字号: 12px (标签) / 11px (按钮)
- 内边距: 10px

## 💻 代码示例

### 切换排行榜
```javascript
handleRankTypeChange(e) {
  const rankType = e.currentTarget.dataset.type;
  // 'class' | 'campus' | 'national'

  this.setData({
    rankType: rankType,
    otherUsers: this.allRankings[rankType],
    userRank: updatedRank,
    rankTypeLabel: '#' + updatedRank
  });
}
```

### 初始化数据
```javascript
initializeLeaderboard() {
  // 3 个排行榜
  const classRanking = [/*12 users*/];
  const campusRanking = [/*12 users*/];
  const nationalRanking = [/*15 users*/];

  this.allRankings = {
    class: classRanking,
    campus: campusRanking,
    national: nationalRanking
  };
}
```

## 📝 HTML 结构

```wxml
<!-- 排名选择器 -->
<view class="rank-selector">
  <view class="selector-label">排名方式:</view>
  <view class="selector-buttons">
    <view class="selector-btn active">班级</view>
    <view class="selector-btn">校区</view>
    <view class="selector-btn">全国</view>
  </view>
</view>

<!-- 排行榜信息 -->
<view class="league-info">
  <view class="info-item">
    <text class="info-label">Next League</text>
    <text class="info-value">3 days</text>
  </view>
  <view class="info-item">
    <text class="info-label">Your Rank</text>
    <text class="info-value rank">#8</text>
  </view>
  <view class="info-item">
    <text class="info-label">学习时长</text>
    <text class="info-value">156h</text>
  </view>
</view>

<!-- 排行榜列表 -->
<scroll-view class="leaderboard" scroll-y="true">
  <view class="leaderboard-header">
    <text class="rank-col">排名</text>
    <text class="user-col">用户</text>
    <text class="points-col">学习时长</text>
  </view>

  <view class="leaderboard-row current-user">
    <text class="rank-col">#8</text>
    <view class="user-info">
      <view class="user-avatar">S</view>
      <text class="user-name">Sam Lee</text>
    </view>
    <text class="points-col">156h</text>
  </view>

  <view class="leaderboard-row">
    <text class="rank-col">#1</text>
    <view class="user-info">
      <view class="user-avatar">A</view>
      <view class="user-details">
        <text class="user-name">Alex Chen</text>
        <text class="user-level">Level 42</text>
      </view>
    </view>
    <text class="points-col">285h</text>
  </view>
</scroll-view>
```

## 🧪 测试点

```
□ 班级排行榜显示 (用户 #8)
□ 校区排行榜显示 (用户 #8)
□ 全国排行榜显示 (用户 #32)
□ 按钮切换无延迟
□ 学习时长单位正确 (h)
□ 用户行高亮显示
□ 移动端布局正确
□ 列表可滚动
```

## 🔄 状态管理

| 状态 | 类型 | 说明 |
|------|------|------|
| rankType | string | 'class' / 'campus' / 'national' |
| rankTypeLabel | string | '#8' / '#32' 等 |
| userRank | number | 用户排名 (1-999) |
| userStudyHours | number | 用户学习时长 (小时) |
| otherUsers | array | 排行榜用户列表 |

## 📈 数据示例

```javascript
// 用户对象
{
  id: 1,
  rank: 1,
  name: 'Alex Chen',
  initial: 'A',
  level: 42,
  studyHours: 285,      // 关键: 学习时长 (小时)
  avatarColor: '#FF6B6B'
}

// Page 数据
{
  daysRemaining: 3,
  rankType: 'class',
  rankTypeLabel: '#8',
  userRank: 8,
  userStudyHours: 156,  // 关键: 用户学习时长
  userName: 'Sam Lee',
  userInitial: 'S',
  otherUsers: []
}
```

---

**最后更新**: 2026-02-11
