// Login Flow 2: Auth Choice - 选择登录或注册

Page({
  data: {},

  onLoad() {
    console.log('Auth choice page loaded');
  },

  /**
   * 后退 - 返回上一页
   */
  handleBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 已有账户 - 跳转到 Sign In (Flow 3)
   */
  handleSignIn() {
    wx.navigateTo({
      url: '/pages/login/signin/signin'
    });
  },

  /**
   * 新用户 - 跳转到注册 (Flow 4)
   */
  handleGetStarted() {
    wx.navigateTo({
      url: '/pages/login/register/register'
    });
  }
});
