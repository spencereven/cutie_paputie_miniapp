Component({
  properties: {
    sectionLabel: {
      type: String,
      value: 'SECTION 1, UNIT 1'
    },
    title: {
      type: String,
      value: 'Getting started'
    },
    colorTheme: {
      type: String,
      value: 'blue'
    }
  },
  data: {},
  methods: {
    handleBannerAction() {
      this.triggerEvent('action', {
        timestamp: new Date().getTime()
      });
    }
  }
});
