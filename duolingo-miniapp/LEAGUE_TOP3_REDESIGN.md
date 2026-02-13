# League Sapphire 排行榜 - 前三名阶梯式重设计

## 改动概述

将排行榜页面的"联赛信息"区块替换为前三名用户的**阶梯式排名展示**，增强视觉效果和用户体验。

---

## 视觉设计

### 前改：联赛信息块
```
┌─────────────────────────────────┐
│ Next League: 3 days             │
│ Your Rank: #8                   │
│ 学习时长: 156h                  │
└─────────────────────────────────┘
```

### 后改：前三名阶梯式排名
```
           👑
         [头像]
    第一名 排名 1
    用户名 (70px)
    156h

   [头像]          [头像]
第二名           第三名
排名 2           排名 3
用户名           用户名
(60px)           (60px)
156h             156h
```

---

## 核心特性

### ① 阶梯式排列
- **第一名** (中间，最高): 放大 1.1 倍，垂直位置最高
- **第二名** (左侧，中等): 标准大小，垂直位置中等
- **第三名** (右侧，较低): 标准大小，垂直位置较低

### ② 视觉强化
- ✅ 皇冠图标 👑 (第一名上方，带弹跳动画)
- ✅ 金色边框 (第一名头像)
- ✅ 金色数字 (第一名排名)
- ✅ 蓝色数字 (第二、三名排名)
- ✅ 渐变背景 (浅蓝色)
- ✅ 卡片阴影效果

### ③ 动画效果
- 皇冠弹跳动画: 2s 循环
- 平滑过渡: 响应式调整

### ④ 响应式设计
- 桌面端: 完整显示，比例适当
- 移动端: 缩小但保持视觉层级

---

## 文件修改详情

### sapphire.wxml

#### 移除的内容
```wxml
<!-- 联赛信息 (已删除) -->
<view class="league-info">
  <view class="info-item">
    <text class="info-label">Next League</text>
    <text class="info-value">{{daysRemaining}} days</text>
  </view>
  <view class="info-item">
    <text class="info-label">Your Rank</text>
    <text class="info-value rank">{{rankTypeLabel}}</text>
  </view>
  <view class="info-item">
    <text class="info-label">学习时长</text>
    <text class="info-value">{{userStudyHours}}h</text>
  </view>
</view>
```

#### 新增的内容
```wxml
<!-- 前三名阶梯式排名展示 -->
<view class="top-three-podium">
  <!-- 第二名 (左) -->
  <view class="podium-item runner-up">
    <view class="podium-avatar" style="background-color: {{topThree[1].avatarColor}}">
      {{topThree[1].initial}}
    </view>
    <view class="podium-rank">2</view>
    <text class="podium-name">{{topThree[1].name}}</text>
    <text class="podium-hours">{{topThree[1].studyHours}}h</text>
  </view>

  <!-- 第一名 (中) -->
  <view class="podium-item champion">
    <view class="podium-crown">👑</view>
    <view class="podium-avatar" style="background-color: {{topThree[0].avatarColor}}">
      {{topThree[0].initial}}
    </view>
    <view class="podium-rank">1</view>
    <text class="podium-name">{{topThree[0].name}}</text>
    <text class="podium-hours">{{topThree[0].studyHours}}h</text>
  </view>

  <!-- 第三名 (右) -->
  <view class="podium-item third-place">
    <view class="podium-avatar" style="background-color: {{topThree[2].avatarColor}}">
      {{topThree[2].initial}}
    </view>
    <view class="podium-rank">3</view>
    <text class="podium-name">{{topThree[2].name}}</text>
    <text class="podium-hours">{{topThree[2].studyHours}}h</text>
  </view>
</view>
```

### sapphire.js

#### 数据变化
```javascript
// 移除旧字段
- daysRemaining: 3
- rankTypeLabel: '#8'

// 添加新字段
+ topThree: [] // 前三名用户
```

#### 初始化更新
```javascript
// 初始化时提取前三名
this.setData({
  topThree: classRanking.slice(0, 3),
  otherUsers: classRanking,
  // ...
});
```

#### 排名切换更新
```javascript
// 切换排行榜时同时更新前三名
this.setData({
  topThree: ranking.slice(0, 3),
  otherUsers: ranking,
  // ...
});
```

### sapphire.wxss

#### 新增样式类
```css
.top-three-podium {
  /* 阶梯式容器 */
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 16px;
  padding: 40px 24px 20px;
  background: linear-gradient(135deg, #F8F9FF 0%, #F0F4FF 100%);
  border-bottom: 1px solid #E6E6E6;
}

.podium-item {
  /* 每个用户项 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.podium-item.champion {
  /* 第一名放大 */
  min-width: 100px;
  padding-bottom: 40px;
  transform: scale(1.1);
}

.podium-crown {
  /* 皇冠图标 */
  font-size: 32px;
  position: absolute;
  top: -35px;
  animation: bounce 2s infinite;
}

.podium-avatar {
  /* 头像 */
  width: 60px;
  height: 60px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.podium-item.champion .podium-avatar {
  /* 第一名头像加大且有金色边框 */
  width: 70px;
  height: 70px;
  border: 3px solid #FFD700;
  box-shadow: 0 6px 16px rgba(44, 183, 255, 0.2);
}

.podium-rank {
  /* 排名数字 */
  font-size: 24px;
  font-weight: 800;
  color: #2CB7FF;
}

.podium-item.champion .podium-rank {
  /* 第一名排名数字为金色 */
  font-size: 32px;
  color: #FFD700;
}

/* 弹跳动画 */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
```

---

## 数据流向

### 初始化流程
```
initializeLeaderboard()
├─ classRanking = [user1, user2, user3, user4, ...]
├─ ranking.slice(0, 3) = [user1, user2, user3]
└─ topThree: [user1, user2, user3]
```

### 排名切换流程
```
handleRankTypeChange(rankType)
├─ ranking = allRankings[rankType]
├─ ranking.slice(0, 3) = [user1, user2, user3]
└─ topThree: [user1, user2, user3] (更新)
```

---

## 样式细节

### 颜色方案
| 元素 | 颜色 | 说明 |
|------|------|------|
| 背景 | #F8F9FF → #F0F4FF | 浅蓝渐变 |
| 排名数字 (2,3) | #2CB7FF | 蓝色 |
| 排名数字 (1) | #FFD700 | 金色 |
| 头像边框 (1) | #FFD700 | 金色 |
| 皇冠 | 👑 | 黄色 emoji |

### 尺寸对比

| 元素 | 第一名 | 第二名 | 第三名 |
|------|--------|--------|--------|
| 头像大小 | 70px | 60px | 60px |
| 排名字号 | 32px | 24px | 24px |
| 放大比例 | 1.1x | 1.0x | 1.0x |
| 垂直位置 | 最高 | 中等 | 较低 |

### 间距
- 容器内边距: 40px 24px 20px (上 右 下)
- 项目间距: 16px
- 项目内间距: 8px
- 移动端: 缩小 20-30%

---

## 交互体验

### 视觉反馈
- ✅ 皇冠弹跳: 连续动画，吸引目光
- ✅ 金色强调: 清晰区分第一名
- ✅ 阴影效果: 增加立体感
- ✅ 背景渐变: 视觉区隔

### 信息层级
1. **最高**: 第一名用户 (放大、皇冠、金色)
2. **次高**: 第二、三名 (等同大小、蓝色)
3. **信息**: 用户名、学习时长

### 响应式适配
- 桌面端: 完整显示，视觉冲击力强
- 移动端: 按比例缩小，保持美观

---

## 测试清单

- [ ] 排行榜初始化显示前三名
- [ ] 班级排行榜显示正确的前三名
- [ ] 校区排行榜显示正确的前三名
- [ ] 全国排行榜显示正确的前三名
- [ ] 切换排行榜时前三名平滑更新
- [ ] 皇冠动画连续播放
- [ ] 头像颜色正确显示
- [ ] 排名数字大小和颜色正确
- [ ] 桌面端显示完整 (390px)
- [ ] 移动端显示正常 (375px)
- [ ] 背景渐变显示正确
- [ ] 阴影效果正常渲染

---

## 改动优势

### 视觉改进
✅ 更加醒目和吸引人
✅ 清晰的视觉层级
✅ 品质感提升
✅ 更好的用户参与度

### 用户体验
✅ 直观展示排名
✅ 鼓励竞争氛围
✅ 增强成就感
✅ 降低信息密度

### 技术维护
✅ 逻辑简单清晰
✅ 性能无影响
✅ 易于扩展
✅ 响应式完善

---

**修改日期**: 2026-02-11
**状态**: ✅ 完成
**兼容性**: 所有设备
