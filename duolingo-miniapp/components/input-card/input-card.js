Component({
  properties: {
    // 第一个输入框
    type: {
      type: String,
      value: 'text' // text|password|number|email
    },
    placeholder: {
      type: String,
      value: 'Enter value'
    },
    value: {
      type: String,
      value: ''
    },
    // 第二个输入框（可选）
    type2: {
      type: String,
      value: ''
    },
    placeholder2: {
      type: String,
      value: ''
    },
    value2: {
      type: String,
      value: ''
    },
    // 是否显示分割线（表示有两行）
    hasDivider: {
      type: Boolean,
      value: false
    }
  },
  data: {
    showPassword: false,
    showPassword2: false
  },
  methods: {
    // 第一个输入框事件
    handleInput(e) {
      const value = e.detail.value;
      this.setData({ value });
      this.triggerEvent('change', { value, field: 1 });
    },
    handleFocus(e) {
      this.triggerEvent('focus', { field: 1 });
    },
    handleBlur(e) {
      this.triggerEvent('blur', { field: 1 });
    },
    handleTogglePassword() {
      this.setData({
        showPassword: !this.data.showPassword,
        type: this.data.showPassword ? 'password' : 'text'
      });
    },

    // 第二个输入框事件
    handleInput2(e) {
      const value = e.detail.value;
      this.setData({ value2: value });
      this.triggerEvent('change', { value, field: 2 });
    },
    handleFocus2(e) {
      this.triggerEvent('focus', { field: 2 });
    },
    handleBlur2(e) {
      this.triggerEvent('blur', { field: 2 });
    },
    handleTogglePassword2() {
      this.setData({
        showPassword2: !this.data.showPassword2,
        type2: this.data.showPassword2 ? 'password' : 'text'
      });
    }
  }
});
