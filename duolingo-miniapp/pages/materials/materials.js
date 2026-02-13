// Materials - 学习资源页

Page({
  data: {
    activeTab: 'all',
    materials: [],
    visibleMaterials: []
  },

  onLoad() {
    console.log('Materials page loaded');
    this.initializeMaterials();
  },

  /**
   * Initialize materials data
   */
  initializeMaterials() {
    const mockMaterials = [
      { id: 1, type: 'pdf', name: 'Spanish Grammar Guide', icon: '📄', size: '2.4 MB', duration: '—', progress: 100 },
      { id: 2, type: 'audio', name: 'Pronunciation Practice 1', icon: '🎵', size: '3.2 MB', duration: '12 min', progress: 75 },
      { id: 3, type: 'pdf', name: 'Common Phrases Handbook', icon: '📄', size: '1.8 MB', duration: '—', progress: 45 },
      { id: 4, type: 'video', name: 'Conversation Tips', icon: '🎬', size: '48 MB', duration: '8 min', progress: 0 },
      { id: 5, type: 'audio', name: 'Listening Exercise 2', icon: '🎵', size: '2.9 MB', duration: '15 min', progress: 0 },
      { id: 6, type: 'pdf', name: 'Verb Conjugation Chart', icon: '📄', size: '0.8 MB', duration: '—', progress: 100 },
      { id: 7, type: 'video', name: 'Cultural Deep Dive', icon: '🎬', size: '156 MB', duration: '25 min', progress: 20 },
      { id: 8, type: 'audio', name: 'Native Speaker Dialog', icon: '🎵', size: '4.1 MB', duration: '18 min', progress: 0 }
    ];

    this.setData({
      materials: mockMaterials,
      visibleMaterials: mockMaterials
    });
  },

  /**
   * Handle tab change
   */
  handleTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });

    if (tab === 'all') {
      this.setData({ visibleMaterials: this.data.materials });
    } else {
      const filtered = this.data.materials.filter(m => m.type === tab);
      this.setData({ visibleMaterials: filtered });
    }
  },

  /**
   * Handle material click - open or play
   */
  handleMaterialClick(e) {
    const { id, type } = e.currentTarget.dataset;
    const material = this.data.materials.find(m => m.id === parseInt(id));

    console.log('Material clicked:', material);

    switch (type) {
      case 'pdf':
        this.openPdfViewer(material);
        break;
      case 'audio':
        this.openAudioPlayer(material);
        break;
      case 'video':
        this.openVideoPlayer(material);
        break;
      default:
        wx.showToast({ title: 'Unknown type', icon: 'none' });
    }
  },

  /**
   * Open PDF viewer
   */
  openPdfViewer(material) {
    wx.navigateTo({
      url: `/pages/player/pdf/pdf?id=${material.id}&name=${material.name}`
    });
  },

  /**
   * Open audio player
   */
  openAudioPlayer(material) {
    wx.navigateTo({
      url: `/pages/player/audio/audio?id=${material.id}&name=${material.name}`
    });
  },

  /**
   * Open video player
   */
  openVideoPlayer(material) {
    // 微信小程序内置视频播放
    wx.navigateTo({
      url: `/pages/player/video/video?id=${material.id}&name=${material.name}`
    });
  },

  /**
   * Close page
   */
  handleClose() {
    wx.navigateBack({
      delta: 1
    });
  }
});
