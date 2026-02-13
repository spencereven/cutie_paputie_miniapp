// Sections List - Section列表页

const learningService = require('../../../services/learning');

Page({
  data: {
    sections: [],
    unlockedSections: [],
    lockedSections: []
  },

  onLoad() {
    const app = getApp();
    if (!app.ensureAuthForPage('pages/sections/list/list')) return;

    console.log('Sections list page loaded');
    this.initializeSections();
  },

  /**
   * 初始化Sections数据
   */
  async initializeSections() {
    const fallbackSections = [
      {
        id: 1,
        title: 'Section 1',
        subtitle: 'Basics',
        progress: 100,
        badgeIcon: '🚩',
        badgeText: '5 to 9',
        hasTopContent: false,
        bubbleText: '',
        showCharacter: false,
        jumpText: ''
      },
      {
        id: 2,
        title: 'Section 2',
        subtitle: 'Greetings',
        progress: 75,
        badgeIcon: '🚩',
        badgeText: '5 to 9',
        hasTopContent: true,
        topBgColor: 'blue',
        bubbleText: 'Section 2',
        showCharacter: false,
        jumpText: ''
      },
      {
        id: 3,
        title: 'Section 3',
        subtitle: 'Food & Drink',
        progress: 45,
        badgeIcon: '🚩',
        badgeText: '5 to 9',
        hasTopContent: true,
        topBgColor: 'blue',
        bubbleText: 'Section 3',
        showCharacter: true,
        characterIcon: '🦉',
        jumpText: 'JUMP HERE'
      },
      { id: 4, title: 'Section 4', subtitle: 'Numbers', progress: 0, badgeText: 'Locked', hasTopContent: false },
      { id: 5, title: 'Section 5', subtitle: 'Colors', progress: 0, badgeText: 'Locked', hasTopContent: false },
      { id: 6, title: 'Section 6', subtitle: 'Animals', progress: 0, badgeText: 'Locked', hasTopContent: false }
    ];

    try {
      const sections = await learningService.getSections();
      this.applySectionData(sections);
    } catch (err) {
      console.warn('Load sections from API failed, using fallback:', err);
      this.applySectionData(fallbackSections);
    }
  },

  applySectionData(sectionList) {
    const list = Array.isArray(sectionList) ? sectionList : [];
    const unlockedSections = list.filter(s => s.progress > 0 || s.id <= 3);
    const lockedSections = list.filter(s => s.progress === 0 && s.id > 3);

    this.setData({
      sections: list,
      unlockedSections,
      lockedSections
    });
  },

  /**
   * 处理Section点击 - 进入Section详情页
   */
  handleSectionClick(e) {
    const sectionId = e.currentTarget.dataset.id || e.detail.id;
    console.log('Section clicked:', sectionId);

    if (!sectionId) {
      console.error('❌ Could not extract sectionId from event');
      return;
    }

    // 记录最近一次进入的学习路径（Learning Path）
    wx.setStorageSync('last_section', Number(sectionId));

    // 返回首页（首页即单元/作业承载页）
    const pages = getCurrentPages();
    const prevPage = pages.length > 1 ? pages[pages.length - 2] : null;
    const prevRoute = prevPage ? prevPage.route : '';

    if (prevRoute === 'pages/index/index') {
      wx.navigateBack({ delta: 1 });
      return;
    }

    wx.reLaunch({
      url: '/pages/index/index',
      fail: (err) => {
        console.error('Navigation failed:', err);
        wx.showToast({
          title: 'Failed to load home',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 处理锁定Section点击
   */
  handleLockedClick(e) {
    const sectionId = e.currentTarget.dataset.id;
    console.log('Locked section clicked:', sectionId);

    wx.showToast({
      title: 'Complete previous section to unlock',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 关闭页面 - 返回到首页
   */
  handleClose() {
    // 检查导航栈，返回到上一页或首页
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({
        delta: 1
      });
    } else {
      // 如果没有上一页，导航到首页
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }
  },

  /**
   * 加载更多（虚拟滚动）
   */
  handleLoadMore() {
    console.log('Load more sections');
  }
});
