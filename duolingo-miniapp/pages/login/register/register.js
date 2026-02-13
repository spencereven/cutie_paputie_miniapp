// Login Flow 4: Register - 新用户注册

const authService = require('../../../services/auth');

Page({
  data: {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthday: ''
  },

  onLoad() {
    console.log('Register page loaded');
  },

  /**
   * 处理名字输入
   */
  handleNameChange(e) {
    const { field, value } = e.detail;
    if (field === 1) {
      this.setData({ name: value });
    }
  },

  /**
   * 处理邮箱输入
   */
  handleEmailChange(e) {
    const { field, value } = e.detail;
    if (field === 1) {
      this.setData({ email: value });
    }
  },

  /**
   * 处理密码输入
   */
  handlePasswordChange(e) {
    const { field, value } = e.detail;
    if (field === 1) {
      this.setData({ password: value });
    } else if (field === 2) {
      this.setData({ confirmPassword: value });
    }
  },

  /**
   * 处理生日选择
   */
  handleBirthdayChange(e) {
    const birthday = e.detail.value;
    this.setData({ birthday });
  },

  /**
   * 兼容旧模板中的点击事件（如果仍绑定 handleSelectBirthday）
   */
  handleSelectBirthday() {
    wx.showModal({
      title: 'Date of birth',
      editable: true,
      placeholderText: 'YYYY-MM-DD',
      content: this.data.birthday || '',
      success: (res) => {
        if (!res.confirm) return;
        const value = (res.content || '').trim();
        if (!this.isValidDate(value)) {
          wx.showToast({
            title: 'Use YYYY-MM-DD format',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        this.setData({ birthday: value });
      }
    });
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
   * 注册新账户
   */
  async handleSignUp() {
    const { name, email, password, confirmPassword, birthday } = this.data;

    // 基本验证
    if (!name.trim()) {
      wx.showToast({
        title: 'Please enter your name',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (!email.trim()) {
      wx.showToast({
        title: 'Please enter email address',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 简单的邮箱格式验证
    if (!this.isValidEmail(email)) {
      wx.showToast({
        title: 'Please enter a valid email',
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

    if (password.length < 6) {
      wx.showToast({
        title: 'Password must be at least 6 characters',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: 'Passwords do not match',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (!birthday) {
      wx.showToast({
        title: 'Please select your birthday',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    wx.showLoading({
      title: 'Creating account...'
    });

    try {
      await authService.registerWithEmail({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        birthday
      });

      wx.hideLoading();
      wx.showToast({
        title: 'Account created successfully',
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
      const msg = String(err && err.message ? err.message : '');
      const errorText = msg === 'email_already_exists'
        ? 'Email already exists'
        : msg === 'invalid_birthday'
          ? 'Please use YYYY-MM-DD birthday'
          : 'Register failed';
      wx.showToast({
        title: errorText,
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 邮箱格式验证
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * 日期格式验证 (YYYY-MM-DD)
   */
  isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    return date.toISOString().slice(0, 10) === value;
  },

  /**
   * 查看条款
   */
  handleViewTerms() {
    wx.showToast({
      title: 'Terms page coming soon',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 跳转到登录页面
   */
  handleSignIn() {
    wx.navigateTo({
      url: '/pages/login/signin/signin'
    });
  }
});
