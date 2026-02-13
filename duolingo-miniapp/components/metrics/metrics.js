Component({
  properties: {
    hearts: {
      type: Number,
      value: 5,
      observer(newVal) {
        this.setData({ hearts: newVal });
      }
    },
    streak: {
      type: Number,
      value: 0,
      observer(newVal) {
        this.setData({ streak: newVal });
      }
    },
    gems: {
      type: Number,
      value: 0,
      observer(newVal) {
        this.setData({ gems: newVal });
      }
    },
    power: {
      type: Number,
      value: 0,
      observer(newVal) {
        this.setData({ power: newVal });
      }
    }
  },
  data: {
    hearts: 5,
    streak: 0,
    gems: 0,
    power: 0
  },
  methods: {
    // 触发父组件事件，用于点击指标项
    handleMetricTap(e) {
      const { type } = e.currentTarget.dataset;
      this.triggerEvent('metrictap', { type });
    }
  }
});
