// PDF Viewer

Page({
  data: {
    pdfId: 1,
    pdfName: 'Spanish Grammar Guide',
    currentPage: 1,
    totalPages: 25,
    zoomLevel: 100,
    pageContent: 'Present Tense Conjugation\n\nThe present tense in Spanish is used to express actions happening now or habitual actions.\n\nExample verbs:\n- Hablar (to speak)\n- Comer (to eat)\n- Vivir (to live)\n\nConjugations:\nYo hablo - I speak\nTú hablas - You speak\nÉl/Ella habla - He/She speaks\n\nPractice conjugating these verbs with different pronouns.',
    pdfContent: {}
  },

  onLoad(options) {
    const app = getApp();
    if (!app.ensureAuthForPage('pages/player/pdf/pdf')) return;

    console.log('PDF viewer loaded with options:', options);
    
    const pdfId = options.id || 1;
    this.setData({ pdfId: parseInt(pdfId) });
  },

  /**
   * 上一页
   */
  handlePrevPage() {
    if (this.data.currentPage > 1) {
      this.setData({
        currentPage: this.data.currentPage - 1
      });
    }
  },

  /**
   * 下一页
   */
  handleNextPage() {
    if (this.data.currentPage < this.data.totalPages) {
      this.setData({
        currentPage: this.data.currentPage + 1
      });
    }
  },

  /**
   * 页码输入
   */
  handlePageInput(e) {
    const page = parseInt(e.detail.value) || this.data.currentPage;
    if (page >= 1 && page <= this.data.totalPages) {
      this.setData({ currentPage: page });
    }
  },

  /**
   * 放大
   */
  handleZoomIn() {
    if (this.data.zoomLevel < 200) {
      this.setData({
        zoomLevel: this.data.zoomLevel + 10
      });
    }
  },

  /**
   * 缩小
   */
  handleZoomOut() {
    if (this.data.zoomLevel > 50) {
      this.setData({
        zoomLevel: this.data.zoomLevel - 10
      });
    }
  },

  /**
   * 下载
   */
  handleDownload() {
    wx.showLoading({
      title: 'Downloading...'
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: 'PDF downloaded',
        icon: 'success',
        duration: 2000
      });
    }, 1500);
  },

  /**
   * 后退
   */
  handleBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});
