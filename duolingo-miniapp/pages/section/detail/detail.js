// Section Detail Page - Section详情页

Page({
  data: {
    currentSection: 1, // 默认显示 Section 1
    section1Progress: 100,
    section2Progress: 75,
    section3Progress: 45,
    lessons: []
  },

  onLoad(options) {
    const app = getApp();
    if (!app.ensureAuthForPage('pages/section/detail/detail')) return;

    console.log('Section detail page loaded with options:', options);

    // 如果通过参数指定了 section，使用参数值
    if (options.section) {
      const section = parseInt(options.section);
      if ([1, 2, 3].includes(section)) {
        this.setData({ currentSection: section });
      }
    }

    // 记录最近一次进入的学习路径（Learning Path）
    wx.setStorageSync('last_section', this.data.currentSection);

    // 初始化课程列表
    this.initializeLessons();
  },

  /**
   * 初始化课程列表
   */
  initializeLessons() {
    const section = this.data.currentSection;
    const lessonsData = {
      1: [
        { id: 1, title: 'Lesson 1.1', subtitle: 'Intro to French', icon: '⭐', completed: true },
        { id: 2, title: 'Lesson 1.2', subtitle: 'Basic Greetings', icon: '🎤', completed: true },
        { id: 3, title: 'Lesson 1.3', subtitle: 'Simple Phrases', icon: '💬', completed: false },
        { id: 4, title: 'Lesson 1.4', subtitle: 'Numbers 1-10', icon: '🔢', completed: false },
        { id: 5, title: 'Lesson 1.5', subtitle: 'Common Objects', icon: '📚', completed: false }
      ],
      2: [
        { id: 1, title: 'Lesson 2.1', subtitle: 'Verbs & Tenses', icon: '⭐', completed: true },
        { id: 2, title: 'Lesson 2.2', subtitle: 'Sentence Structure', icon: '🎤', completed: true },
        { id: 3, title: 'Lesson 2.3', subtitle: 'Advanced Grammar', icon: '💬', completed: false },
        { id: 4, title: 'Lesson 2.4', subtitle: 'Expressions', icon: '🔢', completed: false },
        { id: 5, title: 'Lesson 2.5', subtitle: 'Conversations', icon: '📚', completed: false }
      ],
      3: [
        { id: 1, title: 'Lesson 3.1', subtitle: 'Complex Sentences', icon: '⭐', completed: true },
        { id: 2, title: 'Lesson 3.2', subtitle: 'Subjunctive Mood', icon: '🎤', completed: false },
        { id: 3, title: 'Lesson 3.3', subtitle: 'Idioms & Slang', icon: '💬', completed: false },
        { id: 4, title: 'Lesson 3.4', subtitle: 'Cultural Notes', icon: '🔢', completed: false },
        { id: 5, title: 'Lesson 3.5', subtitle: 'Final Review', icon: '📚', completed: false }
      ]
    };

    this.setData({
      lessons: lessonsData[section] || lessonsData[1]
    });
  },

  /**
   * 处理返回 - 返回到首页
   */
  handleBack() {
    // 检查导航栈中是否有首页，如果有就返回，否则导航到首页
    const pages = getCurrentPages();
    if (pages.length > 1) {
      // 有上一页，直接返回
      wx.navigateBack({
        delta: 1
      });
    } else {
      // 没有上一页，导航到首页
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }
  },

  /**
   * 处理课程点击
   */
  handleLessonClick(e) {
    const lessonId = e.currentTarget.dataset.id;
    console.log('Lesson clicked:', lessonId);

    // 导航到课程详情页或练习页
    wx.navigateTo({
      url: `/pages/level/detail/detail?id=${lessonId}&section=${this.data.currentSection}`,
      fail: (err) => {
        console.error('Navigation failed:', err);
        wx.showToast({
          title: 'Failed to load lesson',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});
