Component({
  properties: {
    activeTab: {
      type: String,
      value: 'home',
      observer(newVal) {
        this.setData({ activeTab: newVal });
      }
    }
  },
  data: {
    activeTab: 'home'
  },
  methods: {
    handleNavTap(e) {
      const { tab } = e.currentTarget.dataset;

      // 向父组件发送事件
      this.triggerEvent('navchange', {
        tab,
        timestamp: new Date().getTime()
      });
    }
  }
});
