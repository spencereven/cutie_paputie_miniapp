// Login Flow 3: Sign In - 输入凭证登录

const authService = require('../../../services/auth');

Page({
  data: {
    email: '',
    password: ''
  },

  onLoad() {
    console.log('Sign in page loaded');

    const selectedAccount = wx.getStorageSync('selected_account');
    if (selectedAccount && selectedAccount.email) {
      this.setData({
        email: selectedAccount.email
      });
    }
  },

  /**
   * 处理输入框变化
   */
  handleInputChange(e) {
    const { field, value } = e.detail;
    if (field === 1) {
      this.setData({ email: value });
    } else if (field === 2) {
      this.setData({ password: value });
    }
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
   * 主登录入口：邮箱密码登录
   */
  handleSignIn() {
    this.handleEmailLogin();
  },

  /**
   * 邮箱密码登录
   */
  async handleEmailLogin() {
    const { email, password } = this.data;
    if (!email.trim()) {
      wx.showToast({
        title: 'Please enter email',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    if (!password.trim()) {
      wx.showToast({
        title: 'Please enter password',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    wx.showLoading({
      title: 'Signing in...'
    });

    try {
      await authService.loginWithEmail({
        email: email.trim(),
        password: password.trim()
      });
      wx.hideLoading();
      wx.showToast({
        title: 'Sign in successful',
        icon: 'success',
        duration: 1200
      });
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/index/index'
        });
      }, 300);
    } catch (err) {
      wx.hideLoading();
      wx.showToast({
        title: 'Invalid email or password',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 微信登录
   */
  async handleWechatLogin() {
    wx.showLoading({
      title: 'Signing in...'
    });

    try {
      const profile = await this.getWechatProfileSafe();
      await authService.loginWithWechat(profile);
      wx.hideLoading();
      wx.showToast({
        title: 'Sign in successful',
        icon: 'success',
        duration: 1200
      });

      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/index/index'
        });
      }, 300);
    } catch (err) {
      wx.hideLoading();
      wx.showToast({
        title: 'WeChat login failed',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 尝试获取微信用户信息（失败时返回空对象）
   */
  getWechatProfileSafe() {
    return new Promise((resolve) => {
      if (!wx.getUserProfile) {
        resolve({});
        return;
      }

      wx.getUserProfile({
        desc: '用于完善你的个人资料',
        success: (res) => {
          resolve(res.userInfo || {});
        },
        fail: () => {
          resolve({});
        }
      });
    });
  },

  /**
   * 忘记密码
   */
  handleForgotPassword() {
    wx.showToast({
      title: 'Feature coming soon',
      icon: 'none',
      duration: 2000
    });
    // 实际应该导航到重置密码页面
    // wx.navigateTo({ url: '/pages/login/reset-password/reset-password' });
  },

  /**
   * Google 登录
   */
  handleGoogleLogin() {
    this.handleWechatLogin();
  },

  /**
   * Facebook 登录
   */
  handleFacebookLogin() {
    wx.showToast({
      title: 'Facebook login coming soon',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * Apple 登录
   */
  handleAppleLogin() {
    wx.showToast({
      title: 'Apple login coming soon',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到注册页面
   */
  handleSignUp() {
    wx.navigateTo({
      url: '/pages/login/register/register'
    });
  }
});
