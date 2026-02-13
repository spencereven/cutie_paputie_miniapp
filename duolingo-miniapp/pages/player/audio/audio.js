function toInt(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

function formatTime(sec) {
  const value = Math.max(0, Math.floor(Number(sec || 0)));
  const m = Math.floor(value / 60);
  const s = value % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

Page({
  data: {
    audioId: 1,
    audioName: 'Audio',
    audioTitle: 'Audio Lesson',
    audioUrl: '',
    isPlaying: false,
    progress: 0,
    currentTime: '0:00',
    duration: '0:00',
    fileSize: '-',
    speedLabel: '1.0x',
    speed: 1.0,
    speeds: [0.75, 1.0, 1.25, 1.5]
  },

  onLoad(options) {
    const app = getApp();
    if (!app.ensureAuthForPage('pages/player/audio/audio')) return;

    const audioId = toInt(options.id, 1);
    const audioName = decodeURIComponent(options.name || 'Audio');
    const audioUrl = decodeURIComponent(options.url || '');
    const duration = decodeURIComponent(options.duration || '0:00');
    const size = decodeURIComponent(options.size || '-');

    this.setData({
      audioId,
      audioName,
      audioTitle: audioName,
      audioUrl,
      duration: duration || '0:00',
      fileSize: size || '-'
    });
  },

  onReady() {
    if (!this.data.audioUrl) return;

    const audio = wx.createInnerAudioContext();
    audio.src = this.data.audioUrl;
    audio.obeyMuteSwitch = false;

    audio.onCanplay(() => {
      const sec = Number(audio.duration || 0);
      if (sec > 0 && this.data.duration === '0:00') {
        this.setData({
          duration: formatTime(sec)
        });
      }
    });
    audio.onTimeUpdate(() => {
      const current = Number(audio.currentTime || 0);
      const total = Number(audio.duration || 0);
      const progress = total > 0 ? (current / total) * 100 : 0;
      this.setData({
        currentTime: formatTime(current),
        progress: Math.max(0, Math.min(100, progress))
      });
    });
    audio.onPlay(() => {
      this.setData({ isPlaying: true });
    });
    audio.onPause(() => {
      this.setData({ isPlaying: false });
    });
    audio.onStop(() => {
      this.setData({
        isPlaying: false,
        progress: 0,
        currentTime: '0:00'
      });
    });
    audio.onEnded(() => {
      this.setData({
        isPlaying: false,
        progress: 100
      });
    });
    audio.onError(() => {
      wx.showToast({
        title: '音频播放失败',
        icon: 'none'
      });
    });

    this.audioCtx = audio;
  },

  onUnload() {
    if (this.audioCtx) {
      try {
        this.audioCtx.stop();
        this.audioCtx.destroy();
      } catch (err) {
        console.warn('Destroy audio context failed:', err);
      }
      this.audioCtx = null;
    }
  },

  handlePlayPause() {
    if (!this.audioCtx) {
      wx.showToast({
        title: '无可播放音频',
        icon: 'none'
      });
      return;
    }

    if (this.data.isPlaying) {
      this.audioCtx.pause();
    } else {
      this.audioCtx.play();
    }
  },

  handleChangeSpeed() {
    const speeds = this.data.speeds;
    const currentIndex = speeds.indexOf(this.data.speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];

    this.setData({
      speed: nextSpeed,
      speedLabel: `${nextSpeed}x`
    });

    if (this.audioCtx) {
      try {
        this.audioCtx.playbackRate = nextSpeed;
      } catch (err) {
        console.warn('Set playback rate failed:', err);
      }
    }
  },

  handleProgressTap(e) {
    if (!this.audioCtx) return;
    const touch = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
    if (!touch) return;

    const query = this.createSelectorQuery();
    query.select('.progress-bar').boundingClientRect();
    query.exec((res) => {
      const rect = res && res[0];
      if (!rect || !rect.width) return;

      const x = touch.clientX - rect.left;
      const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
      const total = Number(this.audioCtx.duration || 0);

      this.setData({ progress: percentage });
      if (total > 0) {
        this.audioCtx.seek((percentage / 100) * total);
      }
    });
  },

  handleDownload() {
    if (!this.data.audioUrl) {
      wx.showToast({
        title: '无下载地址',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: 'Downloading...'
    });
    wx.downloadFile({
      url: this.data.audioUrl,
      success: () => {
        wx.hideLoading();
        wx.showToast({
          title: 'Download complete',
          icon: 'success',
          duration: 1500
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: 'Download failed',
          icon: 'none'
        });
      }
    });
  },

  handleRelated() {
    wx.showToast({
      title: 'Related content coming soon',
      icon: 'none',
      duration: 1200
    });
  },

  handleBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});
