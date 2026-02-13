// Login Flow 1: Sign Back In - 已有账户登录页面

Page({
  data: {
    savedAccounts: [
      {
        id: 1,
        name: 'Sam Lee',
        email: 'samlee.mobbin+3@gmail.com',
        avatarBg: '#58CC02'
      },
      {
        id: 2,
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        avatarBg: '#2CB7FF'
      }
    ],
    selectedAccountId: 1
  },

  onLoad() {
    // 检查是否已登录
    this.checkLoginStatus();
  },

  /**
   * 检查登录状态 - 如果已登录直接跳转到首页
   */
  checkLoginStatus() {
    const token = wx.getStorageSync('user_token');
    if (token) {
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }
  },

  /**
   * 选择账户 - 跳转到密码输入页
   */
  handleSelectAccount(e) {
    const { name, email } = e.detail;

    // 保存选定的账户信息到临时存储
    wx.setStorageSync('selected_account', {
      name,
      email,
      timestamp: Date.now()
    });

    // 跳转到输入密码页 (Flow 3)
    wx.navigateTo({
      url: '/pages/login/signin/signin'
    });
  },

  /**
   * 添加另一个账户 - 跳转到选择登录方式页
   */
  handleAddAccount() {
    wx.navigateTo({
      url: '/pages/login/auth-choice/auth-choice?from=welcome'
    });
  },

  /**
   * 管理账户 - 暂时显示提示
   */
  handleManageAccounts() {
    wx.showToast({
      title: '管理账户功能开发中',
      icon: 'none',
      duration: 1500
    });
  }
});
