const apiService = require('../../../services/api');

function toInt(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

function getMediaBaseUrl() {
  return apiService.getBaseUrl().replace(/\/api\/v1\/?$/, '');
}

function normalizeMediaUrl(url) {
  const normalized = String(url || '').trim();
  if (!normalized) return '';
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith('//')) return `https:${normalized}`;
  if (normalized.startsWith('/')) return `${getMediaBaseUrl()}${normalized}`;
  return normalized;
}

function withNoCache(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}

Page({
  data: {
    videoId: 0,
    videoName: 'Video',
    videoUrl: '',
    duration: '-',
    fileSize: '-',
    progress: 0,
    progressText: '0.0%',
    playbackRate: 1,
    playbackRateLabel: '1.0x',
    loading: true,
    errorText: ''
  },

  onLoad(options) {
    const app = getApp();
    if (!app.ensureAuthForPage('pages/player/video/video')) return;

    const videoId = toInt(options.id, 0);
    const videoName = decodeURIComponent(options.name || 'Video');
    const rawUrl = decodeURIComponent(options.url || '');
    const videoUrl = normalizeMediaUrl(rawUrl);
    const fileSize = decodeURIComponent(options.size || '-');
    const duration = decodeURIComponent(options.duration || '-');
    let errorText = videoUrl ? '' : '视频地址为空';
    let loading = !!videoUrl;

    try {
      const { platform } = wx.getSystemInfoSync();
      if (
        platform !== 'devtools' &&
        /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//i.test(videoUrl)
      ) {
        errorText = '真机无法访问 127.0.0.1，请把 API 地址改成电脑局域网 IP';
        loading = false;
      }
    } catch (err) {
      console.warn('Get system info failed:', err);
    }

    this.setData({
      videoId,
      videoName,
      videoUrl,
      fileSize: fileSize || '-',
      duration: duration || '-',
      loading,
      errorText
    });
  },

  onReady() {
    this.videoCtx = wx.createVideoContext('videoPlayer', this);
  },

  onUnload() {
    if (this.videoCtx) {
      try {
        this.videoCtx.stop();
      } catch (err) {
        console.warn('Stop video failed:', err);
      }
      this.videoCtx = null;
    }
  },

  handleTimeUpdate(e) {
    const currentTime = Number((e && e.detail && e.detail.currentTime) || 0);
    const total = Number((e && e.detail && e.detail.duration) || 0);
    const progress = total > 0 ? (currentTime / total) * 100 : 0;
    this.setData({
      progress: Math.max(0, Math.min(100, progress)),
      progressText: `${Math.max(0, Math.min(100, progress)).toFixed(1)}%`
    });
  },

  handleWaiting() {
    this.setData({
      loading: true
    });
  },

  handleLoadedMetadata() {
    this.setData({
      loading: false,
      errorText: ''
    });
  },

  handleCanPlay() {
    this.setData({
      loading: false,
      errorText: ''
    });
  },

  handleVideoError(e) {
    const detail = (e && e.detail) || {};
    const errMsg = detail.errMsg || detail.msg || '';
    const fallback = '视频播放失败，请检查格式或链接';
    this.setData({
      loading: false,
      errorText: errMsg || fallback
    });
  },

  handleVideoEnded() {
    wx.showToast({
      title: '播放完成',
      icon: 'success',
      duration: 1200
    });
  },

  handleChangeSpeed() {
    const rates = [1, 1.25, 1.5];
    const current = Number(this.data.playbackRate || 1);
    const idx = rates.indexOf(current);
    const next = rates[(idx + 1) % rates.length];

    this.setData({
      playbackRate: next,
      playbackRateLabel: `${next.toFixed(2).replace(/\.00$/, '.0')}x`
    });
    if (this.videoCtx && typeof this.videoCtx.playbackRate === 'function') {
      this.videoCtx.playbackRate(next);
    }
  },

  handleRetry() {
    const url = String(this.data.videoUrl || '').trim();
    if (!url) {
      wx.showToast({
        title: '无视频地址',
        icon: 'none'
      });
      return;
    }

    this.setData({
      loading: true,
      errorText: '',
      progress: 0,
      progressText: '0.0%',
      videoUrl: withNoCache(url)
    });
  },

  handleCopyLink() {
    const url = String(this.data.videoUrl || '').trim();
    if (!url) return;
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({
          title: '已复制视频链接',
          icon: 'none'
        });
      }
    });
  },

  handleBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});
