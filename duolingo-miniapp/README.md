# 🎯 Duolingo 微信小程序

使用微信原生开发 + TDesign UI组件库复刻Duolingo iOS应用界面的小程序项目。

## 📋 项目简介

这是一个完整的微信小程序项目，完美复现了Duolingo应用的iOS界面设计。项目采用微信小程序原生开发方式，不依赖任何前端框架，保证最高的性能和兼容性。

## ✨ 主要特性

✅ **原生小程序开发**
- 使用微信原生WXML、WXSS、JavaScript
- 无第三方框架依赖
- 性能最优化

✅ **完整界面复现**
- 状态栏显示
- 顶部指标卡片（心、火焰、宝石、闪电）
- 蓝色渐变横幅
- 7个课程项目列表
- 底部导航栏

✅ **交互功能**
- 课程项目点击反馈
- 页面导航
- 成就展示
- 排行榜

✅ **UI设计**
- Duolingo品牌色调
- iOS风格圆角设计
- 响应式布局
- 流畅的交互动画

## 📁 项目结构

```
duolingo-miniapp/
├── app.js                          # 应用入口 + 登录守卫
├── app.json                        # 应用路由配置（17 个页面）
├── app.wxss                        # 全局样式
├── components/                     # 可复用组件（bottom-nav / input-card / level-card ...）
├── pages/
│   ├── login/                      # 登录流（welcome/auth-choice/signin/register）
│   ├── index/                      # 首页（学习路径入口）
│   ├── sections/ + section/        # 学习路径与 section 详情
│   ├── level/ + lesson/            # 关卡详情与练习流程
│   ├── courses/ + materials/       # 课程目录与课堂资料
│   ├── player/                     # PDF / Audio / Video 播放器
│   ├── league/                     # 排行榜
│   └── achievement/                # 成就页面
└── README.md
```

## 🚀 快速开始

### 1. 安装微信开发者工具

下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 2. 打开项目

在微信开发者工具中：
- 选择 "打开" 或 "新建项目"
- 选择项目目录：`D:\project\pencil_test\cutie_paputie_miniapp\duolingo-miniapp`
- 填写项目名称：`duolingo-miniapp`
- AppID：使用测试号（获取 > 设置 > 获取AppID）

### 3. 预览/发布

- **预览**：点击 "预览" 按钮，扫码查看
- **真机调试**：点击 "真机调试" 按钮
- **上传**：点击 "上传" 准备发布
- **提交审核**：在小程序后台提交审核

## 📱 页面说明

当前共 17 个页面，核心模块如下：

- 登录模块：`pages/login/*`
- 首页与学习路径：`pages/index/index`、`pages/sections/list/list`、`pages/section/detail/detail`
- 关卡与练习：`pages/level/detail/detail`、`pages/lesson/interactive/interactive`、`pages/lesson/practice/practice`
- 课程与资料：`pages/courses/list/list`、`pages/materials/detail/detail`
- 多媒体播放器：`pages/player/pdf/pdf`、`pages/player/audio/audio`、`pages/player/video/video`
- 排行榜与成就：`pages/league/sapphire/sapphire`、`pages/achievement/achievement`

默认首屏为登录欢迎页：`pages/login/welcome/welcome`。

## 🎨 样式系统

### 品牌颜色

```css
--color-blue: #2CB7FF          /* Duolingo蓝 */
--color-light-blue: #1FAEE8    /* 浅蓝 */
--color-sky-blue: #1FA5FF      /* 天蓝 */
--color-gold: #F5A623          /* 金色 */
--color-light-gray: #E6E6E6    /* 浅灰 */
--color-dark-gray: #B0B0B0     /* 深灰 */
```

### 间距系统

```
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 16px
--spacing-xl: 24px
--spacing-2xl: 32px
```

### 圆角系统

```
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
```

## 🔧 开发指南

### 修改课程数据

编辑 `pages/index/index.js` 中的 `levels` 数组：

```javascript
levels: [
  { id: 1, title: '你的课程', subtitle: '描述', icon: '🟦' },
  // 添加更多项目
]
```

### 修改统计数据

编辑 `app.js` 中的 `globalData`:

```javascript
globalData: {
  stats: {
    hearts: 10,
    streak: 846,
    gems: 8309,
    boosts: 25
  }
}
```

### 添加新页面

1. 在 `pages/` 目录创建新文件夹
2. 创建 `.wxml`、`.js`、`.wxss` 文件
3. 在 `app.json` 中注册页面：

```json
{
  "pages": [
    "pages/index/index",
    "pages/achievement/achievement",
    "pages/yourpage/yourpage"
  ]
}
```

## 📲 小程序特性

### 使用的API

- `wx.getSystemInfo()` - 获取系统信息
- `wx.showToast()` - 显示提示
- `wx.showActionSheet()` - 操作菜单
- `wx.navigateTo()` - 页面导航

### 事件处理

- `bindtap` - 点击事件
- `scroll-view` - 可滚动容器
- `wx:for` - 列表渲染
- `wx:key` - 列表项标识

## 🎯 TDesign集成（可选）

虽然当前项目使用原生样式，但可以集成TDesign：

```bash
# 安装TDesign小程序
npm install tdesign-miniprogram

# 在page的json中引入组件
{
  "usingComponents": {
    "t-button": "tdesign-miniprogram/button/button"
  }
}
```

### TDesign推荐组件

- `t-button` - 按钮
- `t-dialog` - 弹框
- `t-navbar` - 导航栏
- `t-badge` - 徽章
- `t-tabbar` - 标签栏

## 📊 性能优化

✅ **已优化的方面：**
- 轻量级WXSS样式
- 异步数据加载
- 事件委托
- 列表虚拟滚动（scroll-view）

✅ **建议的优化：**
- 使用分包加载
- 异步组件
- 图片懒加载
- 本地缓存

## 🐛 常见问题

### Q: 如何获得AppID？
A: 在微信小程序后台 > 设置 > 获取AppID，或使用测试号

### Q: 如何真机调试？
A: 点击开发者工具中的 "真机调试"，手机扫码即可

### Q: 如何发布上线？
A:
1. 上传代码（开发者工具 > 上传）
2. 在小程序后台提交审核
3. 审核通过后上线

### Q: 如何添加TDesign组件？
A: 参考上方"TDesign集成"部分

## 📚 相关资源

- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [WXSS参考](https://developers.weixin.qq.com/miniprogram/dev/reference/wxss/)
- [API参考](https://developers.weixin.qq.com/miniprogram/dev/api/)
- [TDesign小程序](https://tdesign.tencent.com/miniprogram/overview)

## 🔗 相关项目

- React + Tailwind 版本：`../duolingo-ios/`
- Pencil原始设计：Node ID `10cNB`

## 📝 开发建议

### 短期优化
- [ ] 集成TDesign组件
- [ ] 添加页面加载动画
- [ ] 实现数据持久化

### 中期功能
- [ ] 集成后端API
- [ ] 添加用户认证
- [ ] 实现课程详情页

### 长期规划
- [ ] 离线功能
- [ ] 小程序云开发
- [ ] 数据同步
- [ ] 分析统计

## 📄 许可证

MIT License

## 👨‍💻 开发工具

- 微信开发者工具
- VSCode / WebStorm
- 小程序开发框架：原生

---

**项目位置**: `D:\project\pencil_test\duolingo-miniapp`

**创建时间**: 2026年2月11日

**祝你开发愉快！** 🚀
