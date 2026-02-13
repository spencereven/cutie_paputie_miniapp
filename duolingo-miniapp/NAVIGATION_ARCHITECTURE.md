# 🗺️ Navigation Architecture - 导航架构

## 完整导航流程图

```
┌─────────────────────────────────────────────────────────────┐
│ 登录流程 / Login Flow                                        │
└─────────────────────────────────────────────────────────────┘

Welcome Page (/pages/login/welcome/welcome)
    ↓ (选择现有账户或添加新账户)
    ├→ SignIn Page (/pages/login/signin/signin)
    │    ↓ (登录成功 - Sign in successful)
    │    → Section 1 Detail Page (/pages/section/detail/detail?section=1) [reLaunch]
    │
    └→ Register Page (/pages/login/register/register)
         ↓ (注册成功 - Sign up successful)
         → Section 1 Detail Page (/pages/section/detail/detail?section=1) [reLaunch]


┌─────────────────────────────────────────────────────────────┐
│ 主应用流程 / Main App Flow                                  │
└─────────────────────────────────────────────────────────────┘

Section 1 Detail (/pages/section/detail/detail?section=1)
    ├→ 课程列表点击 (Click Lesson)
    │    ↓
    │    → Level Detail (/pages/level/detail/detail?id=X&section=1)
    │         ↓ (返回 Back)
    │         → Section 1 Detail (navigateBack)
    │
    └→ 返回按钮 (Click Back Button)
         ↓ (无上一页时)
         → Home Page (/pages/index/index) [reLaunch]


Home Page (/pages/index/index)
    ├→ 横幅操作 (Click Banner)
    │    ↓
    │    → Sections List (/pages/sections/list/list) [navigateTo]
    │         ↓ (选择Section Click Section)
    │         → Section Detail (/pages/section/detail/detail?section=N) [navigateTo]
    │              ↓ (返回Close)
    │              → Home Page (navigateBack)
    │
    ├→ 关卡卡片点击 (Click Level Card)
    │    ↓
    │    → Level Detail (/pages/level/detail/detail?id=X)
    │
    ├→ 底部导航 (Bottom Navigation)
    │    ├→ League Tab
    │    │    → Leaderboard (/pages/league/sapphire/sapphire)
    │    │
    │    ├→ Courses Tab
    │    │    → Courses List (/pages/courses/list/list)
    │    │         → Course Materials (/pages/materials/detail/detail)
    │    │
    │    └→ More Menu
    │         └→ Logout → Welcome Page
    │
    └→ 底部导航-Home (Already on home)
```

---

## 页面导航规则

### 1️⃣ 登录页面 (Login Pages)

#### Welcome Page (`/pages/login/welcome/welcome`)
| 操作 | 目标 | 方法 |
|------|------|------|
| 选择账户 | SignIn | `navigateTo` |
| 添加账户 | Auth Choice | `navigateTo` |
| 检测已登录 | Section 1 | `reLaunch` |

#### SignIn Page (`/pages/login/signin/signin`)
| 操作 | 目标 | 方法 | 参数 |
|------|------|------|------|
| 登录成功 | Section 1 | `reLaunch` | `?section=1` |
| 返回 | Welcome | `navigateBack` | - |
| 注册 | Register | `navigateTo` | - |

#### Register Page (`/pages/login/register/register`)
| 操作 | 目标 | 方法 | 参数 |
|------|------|------|------|
| 注册成功 | Section 1 | `reLaunch` | `?section=1` |
| 返回 | Welcome | `navigateBack` | - |
| 登录 | SignIn | `navigateTo` | - |

---

### 2️⃣ 学习流程 (Learning Path)

#### Section Detail Page (`/pages/section/detail/detail`)
| 操作 | 目标 | 方法 | 参数 |
|------|------|------|------|
| 点击课程 | Level Detail | `navigateTo` | `?id=X&section=N` |
| 返回按钮 | 上一页 or 首页 | `navigateBack` or `reLaunch` | - |

**返回逻辑**:
```javascript
const pages = getCurrentPages();
if (pages.length > 1) {
  wx.navigateBack({ delta: 1 });  // 有上一页
} else {
  wx.reLaunch({ url: '/pages/index/index' });  // 无上一页，回首页
}
```

#### Level Detail Page (`/pages/level/detail/detail`)
| 操作 | 目标 | 方法 | 参数 |
|------|------|------|------|
| 返回 | Section Detail | `navigateBack` | - |

---

### 3️⃣ 首页与导航 (Home & Navigation)

#### Home Page (`/pages/index/index`)
| 操作 | 目标 | 方法 | 参数 |
|------|------|------|------|
| 横幅操作 | Sections List | `navigateTo` | - |
| 关卡卡片 | Level Detail | `navigateTo` | `?id=X` |
| League Tab | Leaderboard | `navigateTo` | - |
| Courses Tab | Courses List | `navigateTo` | - |
| Logout | Welcome | `navigateTo` | - |

#### Sections List Page (`/pages/sections/list/list`)
| 操作 | 目标 | 方法 | 参数 |
|------|------|------|------|
| 点击Section | Section Detail | `navigateTo` | `?section=N` |
| 关闭按钮 | 上一页 or 首页 | `navigateBack` or `reLaunch` | - |
| 锁定Section点击 | Toast提示 | `showToast` | - |

**返回逻辑**:
```javascript
const pages = getCurrentPages();
if (pages.length > 1) {
  wx.navigateBack({ delta: 1 });  // 返回上一页
} else {
  wx.reLaunch({ url: '/pages/index/index' });  // 回首页
}
```

---

## 导航方法说明

### `reLaunch` - 关键时刻使用
用于**彻底切换应用栈**的场景：
- ✅ 登录成功后进入应用
- ✅ 返回首页时（清空堆栈）
- ❌ 普通页面之间导航

**特点**:
- 清空所有页面堆栈
- 进入新页面
- 无法通过 `navigateBack` 返回

### `navigateTo` - 普通导航使用
用于正常的**页面跳转**：
- ✅ 页面之间的导航
- ✅ 打开新页面
- ✅ 需要返回时

**特点**:
- 保留页面堆栈
- 可通过 `navigateBack` 返回
- 支持传递参数

### `navigateBack` - 返回使用
用于**返回上一页**：
- ✅ 点击返回/关闭按钮
- ✅ 完成操作后返回

**特点**:
- 返回上一页
- 销毁当前页面
- 不支持页面跳转

---

## 参数传递规范

### URL 参数格式
```javascript
// 单个参数
/pages/level/detail/detail?id=1

// 多个参数
/pages/level/detail/detail?id=1&section=1

// 在 onLoad 中获取
onLoad(options) {
  const id = options.id;      // "1"
  const section = options.section;  // "1"
}
```

### 支持的参数
| 页面 | 参数 | 说明 | 示例 |
|------|------|------|------|
| section/detail | `section` | Section ID (1-3) | `?section=1` |
| level/detail | `id` | Level ID | `?id=1` |
| level/detail | `section` | Section ID | `?id=1&section=1` |

---

## 状态管理

### 登录状态
```javascript
// 保存
wx.setStorageSync('user_token', 'token_value');
wx.setStorageSync('user_info', { name, email });

// 检查
const token = wx.getStorageSync('user_token');
if (token) {
  // 已登录
}

// 清除（退出登录）
wx.removeStorageSync('user_token');
wx.removeStorageSync('user_info');
```

### 临时数据
```javascript
// 页面间传递（短期）
wx.setStorageSync('selected_account', { name, email });
const account = wx.getStorageSync('selected_account');
```

---

## 导航栈管理

### 获取当前栈
```javascript
const pages = getCurrentPages();
const currentPage = pages[pages.length - 1];
const previousPage = pages[pages.length - 2];
```

### 栈操作示例
```javascript
// 返回到上一页
wx.navigateBack({ delta: 1 });

// 返回到两页前
wx.navigateBack({ delta: 2 });

// 回首页（清空栈）
wx.reLaunch({ url: '/pages/index/index' });
```

---

## 常见问题 (FAQ)

### Q: 为什么登录后用 `reLaunch` 而不是 `navigateTo`？
**A**: 因为登录时需要清除之前的登录页栈，防止用户按返回键返回登录页。`reLaunch` 会清空整个页面栈。

### Q: Section 返回时如何判断是否有上一页？
**A**: 使用 `getCurrentPages()` 检查栈长度：
```javascript
if (pages.length > 1) {
  // 有上一页
  wx.navigateBack();
} else {
  // 没有上一页，回首页
  wx.reLaunch({ url: '/pages/index/index' });
}
```

### Q: 如何从深层页面直接回到首页？
**A**: 使用 `reLaunch`：
```javascript
wx.reLaunch({ url: '/pages/index/index' });
```

### Q: 可以一次返回多个页面吗？
**A**: 可以，使用 `delta` 参数：
```javascript
wx.navigateBack({ delta: 2 }); // 返回两个页面
```

---

## 最佳实践

### ✅ DO
- 使用 `getCurrentPages()` 智能决定返回方式
- 登录成功用 `reLaunch` 清空栈
- 页面参数通过 URL query 传递
- 临时数据使用 `setStorageSync`

### ❌ DON'T
- 不要在 `navigateBack` 时传递参数
- 不要过深的页面嵌套（超过5级）
- 不要混乱地使用导航方法
- 不要忘记处理返回逻辑

---

## 测试清单

- [ ] 登录 → Section 1 导航成功
- [ ] Section 1 返回 → 首页
- [ ] 首页横幅 → Sections List
- [ ] Sections List 关闭 → 首页
- [ ] 选择 Section 2 → Section Detail
- [ ] 点击课程 → Level Detail
- [ ] Level 返回 → Section Detail
- [ ] 支持返回多层级
- [ ] 退出登录 → Welcome 页面
- [ ] 登录状态检查正确

---

**最后更新**: 2026-02-11
**状态**: ✅ 完成并测试
