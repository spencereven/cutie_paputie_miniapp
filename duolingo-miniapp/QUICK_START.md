# 🚀 微信小程序 - 快速开始

## 5分钟上手指南

### 1️⃣ 准备工具

下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 2️⃣ 打开项目

```
微信开发者工具 > 打开 > 选择项目目录
D:\project\pencil_test\duolingo-miniapp
```

### 3️⃣ 配置AppID

项目打开后会提示缺少AppID：
- 点击 "获取AppID" 或
- 使用测试号（无需真实AppID即可预览）

### 4️⃣ 编译预览

1. 点击工具栏的 "编译" 按钮
2. 在模拟器中查看效果
3. 或点击 "预览" > 扫码在手机中预览

### ✅ 完成！

你现在可以看到Duolingo小程序界面了！

---

## 📁 项目文件说明

| 文件/文件夹 | 说明 |
|----------|------|
| `app.js` | 应用入口，全局配置 |
| `app.json` | 应用配置（页面、底部导航等） |
| `app.wxss` | 全局样式 |
| `pages/index/` | 首页（学习界面） |
| `pages/achievement/` | 成就页面 |
| `project.config.json` | 开发者工具配置 |

---

## 🎯 常见操作

### 修改学习统计

编辑 `app.js`:

```javascript
globalData: {
  stats: {
    hearts: 10,      // 心
    streak: 846,     // 火焰
    gems: 8309,      // 宝石
    boosts: 25       // 闪电
  }
}
```

### 修改课程列表

编辑 `pages/index/index.js`:

```javascript
levels: [
  { id: 1, title: '你的课程', subtitle: '描述', icon: '🟦' },
  { id: 2, title: '第二课', subtitle: '中等难度', icon: '🟦' },
  // 添加更多课程
]
```

### 修改成就

编辑 `pages/achievement/achievement.js`:

```javascript
badges: [
  { id: 1, name: '首次登陆', icon: '🎉', unlocked: true },
  // 添加更多徽章
]
```

---

## 💻 开发者工具快捷键

| 快捷键 | 功能 |
|-------|------|
| Ctrl+B | 编译 |
| Ctrl+P | 预览 |
| F12 | 打开开发者工具 |
| Ctrl+Shift+L | 清除缓存 |
| Ctrl+K | 打开命令面板 |

---

## 🔧 调试技巧

### 查看控制台输出

打开开发者工具 (F12) > Console 标签

### 调试JavaScript

在代码中加入 `console.log()`:

```javascript
handleLevelClick(e) {
  const id = e.currentTarget.dataset.id;
  console.log('Clicked level:', id);  // 在console中查看输出
}
```

### 查看网络请求

开发者工具 > Network 标签（如果有API调用）

### 清除本地数据

工具栏 > 清除缓存 > 全部清除

---

## 📲 真机预览

1. 点击工具栏 "预览" 按钮
2. 用微信扫描二维码
3. 在手机上查看效果

**注意**: 手机和电脑需要在同一个Wi-Fi网络

---

## 🚢 上传发布

### 步骤1: 上传代码

```
工具栏 > 上传 > 输入版本号和备注 > 上传
```

### 步骤2: 小程序后台提交

1. 登录 [小程序后台](https://mp.weixin.qq.com)
2. 开发 > 版本管理
3. 选择上传的版本 > 提交审核

### 步骤3: 审核通过

腾讯审核通常需要1-7天

### 步骤4: 发布上线

审核通过后，点击发布

---

## ❓ 常见问题

### Q: 为什么编译失败？
A: 检查：
- 是否有语法错误
- 所有文件路径是否正确
- 是否缺少必要的配置文件

### Q: 模拟器显示不正常？
A:
- 尝试清除缓存
- 重启开发者工具
- 检查窗口大小是否过小

### Q: 如何获得AppID？
A:
- 在小程序后台获得（需要企业认证）
- 或使用开发者工具提供的测试号

### Q: 如何集成TDesign？
A: 查看 `TDESIGN_GUIDE.md`

---

## 📚 更多资源

- **完整说明**: 查看 `README.md`
- **TDesign集成**: 查看 `TDESIGN_GUIDE.md`
- **官方文档**: https://developers.weixin.qq.com/miniprogram/dev/

---

## 💡 下一步

- [ ] 预览项目效果
- [ ] 修改课程数据
- [ ] 尝试添加新功能
- [ ] 集成TDesign组件
- [ ] 连接真实API

---

祝你开发愉快！ 🎉

**项目位置**: `D:\project\pencil_test\duolingo-miniapp`
