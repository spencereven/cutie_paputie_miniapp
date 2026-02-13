Component({
  properties: {
    name: {
      type: String,
      value: 'User Name'
    },
    email: {
      type: String,
      value: 'user@example.com'
    },
    avatarBg: {
      type: String,
      value: '#58CC02'
    },
    isSelected: {
      type: Boolean,
      value: false
    }
  },
  data: {
    avatarInitial: 'U'
  },
  observers: {
    name(newVal) {
      this.setData({
        avatarInitial: newVal ? newVal.charAt(0).toUpperCase() : 'U'
      });
    }
  },
  methods: {
    handleCardTap() {
      this.triggerEvent('select', {
        name: this.data.name,
        email: this.data.email
      });
    }
  }
});
