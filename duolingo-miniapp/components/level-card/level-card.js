Component({
  properties: {
    id: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: 'Level'
    },
    subtitle: {
      type: String,
      value: 'Practice'
    },
    iconContent: {
      type: String,
      value: '⭐'
    },
    iconType: {
      type: String,
      value: 'blue', // 'blue', 'purple', 'orange'
      enum: ['blue', 'purple', 'orange']
    },
    showLock: {
      type: Boolean,
      value: false
    }
  },
  data: {},
  methods: {
    handleCardTap() {
      // 从 properties 中获取 id（而不是从 data）
      const levelId = this.properties.id || this.data.id;

      if (this.properties.showLock) {
        this.triggerEvent('locktap', { id: levelId });
      } else {
        this.triggerEvent('tap', { id: levelId });
      }
    }
  }
});
