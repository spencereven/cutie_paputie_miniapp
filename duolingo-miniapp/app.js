App({
  onLaunch() {
    // 应用启动时初始化
    console.log('Duolingo Mini App launched');

    // 获取系统信息
    wx.getSystemInfo({
      success: res => {
        this.globalData.screenHeight = res.screenHeight;
        this.globalData.screenWidth = res.screenWidth;
        this.globalData.statusBarHeight = res.statusBarHeight;
      }
    });
  },

  onShow(options = {}) {
    console.log('Duolingo Mini App shown');
    const route = options.path || '';
    this.ensureAuthByRoute(route);
  },

  onHide() {
    console.log('Duolingo Mini App hidden');
  },

  /**
   * 是否已登录
   */
  hasToken() {
    return !!wx.getStorageSync('user_token');
  },

  /**
   * 登录流程页不需要鉴权
   */
  isAuthRoute(route = '') {
    return route.indexOf('pages/login/') === 0;
  },

  /**
   * 通过路由做统一鉴权（应用级入口）
   */
  ensureAuthByRoute(route = '') {
    if (!route || this.isAuthRoute(route)) return true;
    if (this.hasToken()) return true;

    wx.reLaunch({
      url: '/pages/login/welcome/welcome'
    });
    return false;
  },

  /**
   * 页面级鉴权（页面 onLoad 内调用）
   */
  ensureAuthForPage(route = '') {
    if (!route || this.isAuthRoute(route)) return true;
    if (this.hasToken()) return true;

    wx.reLaunch({
      url: '/pages/login/welcome/welcome'
    });
    return false;
  },

  globalData: {
    screenHeight: 0,
    screenWidth: 0,
    statusBarHeight: 0,
    userInfo: null,
    stats: {
      hearts: 10,
      streak: 846,
      gems: 8309,
      boosts: 25
    }
  }
});
