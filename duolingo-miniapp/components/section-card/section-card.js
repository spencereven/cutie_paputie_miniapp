Component({
  properties: {
    id: {
      type: String,
      value: ''
    },
    sectionId: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: 'Section 1'
    },
    badgeText: {
      type: String,
      value: '5 to 9'
    },
    badgeIcon: {
      type: String,
      value: '🚩'
    },
    progress: {
      type: Number,
      value: 100,
      observer(newVal) {
        this.setData({ progress: Math.min(100, Math.max(0, newVal)) });
      }
    },
    // 顶部内容配置
    hasTopContent: {
      type: Boolean,
      value: false
    },
    topBgColor: {
      type: String,
      value: 'blue'
    },
    bubbleText: {
      type: String,
      value: ''
    },
    showCharacter: {
      type: Boolean,
      value: false
    },
    characterIcon: {
      type: String,
      value: '🦉'
    },
    // 跳转文本
    jumpText: {
      type: String,
      value: ''
    },
    // 锁定状态
    isLocked: {
      type: Boolean,
      value: false
    }
  },
  data: {},
  methods: {
    handleCardTap() {
      const id = this.properties.sectionId || this.properties.id;
      this.triggerEvent('tap', { id });
    }
  }
});
