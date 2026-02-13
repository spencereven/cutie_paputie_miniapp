const learningService = require('../../services/learning');
const authService = require('../../services/auth');

Page({
  data: {
    currentSection: 1,
    sectionLabel: 'SECTION 1, UNIT 1',
    bannerTitle: 'Basics: Start learning',
    bannerTheme: 'blue',
    levels: [],
    activeNav: 'home',
    userName: 'Sam Lee',
    userRole: ''
  },

  onLoad() {
    const app = getApp();
    if (!app.ensureAuthForPage('pages/index/index')) return;

    console.log('Index page loaded');

    // 获取系统信息
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight
    });

    // 检查登录状态
    const userInfo = wx.getStorageSync('user_info');
    if (userInfo && userInfo.name) {
      this.setData({
        userName: userInfo.name,
        userRole: userInfo.role || ''
      });
    }

    this.syncCurrentUserProfile();
  },

  onShow() {
    console.log('Index page shown');
    this.setData({ activeNav: 'home' });
    this.updateHomeSectionFromApi();
  },

  /**
   * 处理关卡点击 - 导航到关卡详情页
   */
  handleLevelClick(e) {
    // 从 level-card 组件事件中获取 id
    let levelId = e.detail.id;

    // 如果从组件没获取到，从 currentTarget dataset 获取
    if (!levelId && e.currentTarget.dataset) {
      levelId = e.currentTarget.dataset.id;
    }

    // 如果还是没有，从数组索引获取
    if (!levelId && e.currentTarget.dataset.index !== undefined) {
      const index = parseInt(e.currentTarget.dataset.index);
      levelId = this.data.levels[index]?.id;
    }

    // 验证 levelId
    if (!levelId) {
      console.error('❌ Could not extract levelId from event', e);
      wx.showToast({
        title: 'Error loading level',
        icon: 'none',
        duration: 1000
      });
      return;
    }

    levelId = String(levelId).trim();
    console.log('✅ Navigating to level:', levelId);

    // 导航到关卡详情页
    wx.navigateTo({
      url: `/pages/level/detail/detail?id=${levelId}`,
      fail: (err) => {
        console.error('Navigation failed:', err);
        wx.showToast({
          title: 'Failed to load level',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 处理横幅操作 - 跳转到Sections列表
   */
  handleBannerAction() {
    console.log('Banner action clicked - navigate to sections list');
    wx.navigateTo({
      url: '/pages/sections/list/list'
    });
  },

  /**
   * 处理底部导航切换
   */
  handleNavChange(e) {
    const { tab } = e.detail;
    this.setData({ activeNav: tab });

    switch (tab) {
      case 'home':
        // 已经在首页
        break;
      case 'league':
        wx.navigateTo({
          url: '/pages/league/sapphire/sapphire'
        });
        break;
      case 'courses':
        wx.navigateTo({
          url: '/pages/courses/list/list'
        });
        break;
      case 'more':
      {
        const cached = wx.getStorageSync('user_info') || {};
        const role = this.data.userRole || cached.role || '';
        const canManageClassroom = role === 'TEACHER' || role === 'ADMIN';
        const itemList = canManageClassroom
          ? ['Classroom Admin', 'Settings', 'About', 'Logout']
          : ['Settings', 'About', 'Logout'];

        wx.showActionSheet({
          itemList,
          success: res => {
            if (canManageClassroom && res.tapIndex === 0) {
              wx.navigateTo({
                url: '/pages/admin/classroom/classroom'
              });
              return;
            }

            const logoutIndex = canManageClassroom ? 3 : 2;
            if (res.tapIndex === logoutIndex) {
              // 退出登录
              authService.logout().finally(() => {
                wx.reLaunch({
                  url: '/pages/login/welcome/welcome'
                });
              });
            }
          }
        });
        break;
      }
    }
  },

  async updateHomeSectionFromApi() {
    try {
      const sections = await learningService.getSections();
      if (!Array.isArray(sections) || sections.length === 0) {
        this.updateHomeSectionLocal();
        return;
      }

      const stored = Number(wx.getStorageSync('last_section'));
      const selected = sections.find((s) => s.id === stored) || sections[0];
      const theme = selected.topBgColor || (selected.id === 2 ? 'purple' : selected.id === 3 ? 'orange' : 'blue');
      const levels = Array.isArray(selected.levels) ? selected.levels : [];

      this.setData({
        currentSection: selected.id,
        sectionLabel: `SECTION ${selected.id}, UNIT 1`,
        bannerTitle: selected.subtitle || selected.title,
        bannerTheme: theme,
        levels
      });
    } catch (err) {
      console.warn('Load home sections from API failed, using fallback:', err);
      this.updateHomeSectionLocal();
    }
  },

  async syncCurrentUserProfile() {
    try {
      const me = await authService.getMe();
      if (me && me.name) {
        this.setData({
          userName: me.name,
          userRole: me.role || ''
        });
        wx.setStorageSync('user_info', me);
      }
    } catch (err) {
      console.warn('Load profile failed, keep cached user info:', err);
    }
  },

  /**
   * 根据最近一次学习路径更新首页展示
   */
  updateHomeSectionLocal() {
    const stored = wx.getStorageSync('last_section');
    const sectionId = [1, 2, 3].includes(Number(stored)) ? Number(stored) : 1;

    const sectionMeta = {
      1: {
        sectionLabel: 'SECTION 1, UNIT 1',
        bannerTitle: 'Basics: Start learning',
        bannerTheme: 'blue',
        levels: [
          { id: 1, title: 'Level 1', subtitle: 'Intro', iconType: 'blue', iconContent: '⭐' },
          { id: 2, title: 'Level 2', subtitle: 'Greetings', iconType: 'blue', iconContent: '🎤' },
          { id: 3, title: 'Level 3', subtitle: 'Numbers', iconType: 'blue', iconContent: '⭐' }
        ]
      },
      2: {
        sectionLabel: 'SECTION 2, UNIT 99',
        bannerTitle: 'Morning: Talk about\ngetting ready',
        bannerTheme: 'purple',
        levels: [
          { id: 1, title: 'Level 1', subtitle: 'Intro', iconType: 'purple', iconContent: '⭐' },
          { id: 2, title: 'Level 2', subtitle: 'Speaking', iconType: 'purple', iconContent: '🎤' },
          { id: 3, title: 'Level 3', subtitle: 'Practice', iconType: 'purple', iconContent: '⭐' }
        ]
      },
      3: {
        sectionLabel: 'SECTION 3, UNIT 10',
        bannerTitle: 'Food: Order and enjoy',
        bannerTheme: 'orange',
        levels: [
          { id: 1, title: 'Level 1', subtitle: 'Food basics', iconType: 'orange', iconContent: '⭐' },
          { id: 2, title: 'Level 2', subtitle: 'Ordering', iconType: 'orange', iconContent: '🎤' },
          { id: 3, title: 'Level 3', subtitle: 'Phrases', iconType: 'orange', iconContent: '⭐' }
        ]
      }
    };

    const meta = sectionMeta[sectionId] || sectionMeta[1];
    this.setData({
      currentSection: sectionId,
      sectionLabel: meta.sectionLabel,
      bannerTitle: meta.bannerTitle,
      bannerTheme: meta.bannerTheme,
      levels: meta.levels
    });
  }
});
