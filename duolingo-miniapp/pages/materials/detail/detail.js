const learningService = require('../../../services/learning');
const authService = require('../../../services/auth');
const apiService = require('../../../services/api');

function toInt(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

function formatSize(bytes) {
  const size = Number(bytes || 0);
  if (!size || size <= 0) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(sec) {
  const value = toInt(sec, 0);
  if (!value) return '-';
  const m = Math.floor(value / 60);
  const s = value % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
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

function decorateAsset(asset) {
  const type = String(asset.type || '').toUpperCase();
  const icon = type === 'AUDIO' ? '🎵' : type === 'VIDEO' ? '🎬' : '📄';
  return {
    id: asset.id,
    type,
    name: asset.title || 'Untitled',
    url: normalizeMediaUrl(asset.url),
    mimeType: asset.mimeType || '',
    durationText: formatDuration(asset.durationSec),
    sizeText: formatSize(asset.fileSizeBytes),
    icon
  };
}

Page({
  data: {
    lessonId: 0,
    lessonTitle: '课堂资料',
    loading: false,
    errorText: '',
    files: [],
    audios: [],
    videos: []
  },

  onLoad(options) {
    const app = getApp();
    if (!app.ensureAuthForPage('pages/materials/detail/detail')) return;

    const lessonId = toInt(options.id, 0);
    this.setData({
      lessonId
    });
  },

  onShow() {
    this.loadLessonAssets();
  },

  async ensureCurrentUser() {
    const cached = wx.getStorageSync('user_info') || {};
    if (cached && cached.id && cached.classroomId) return cached;

    const me = await authService.getMe();
    wx.setStorageSync('user_info', me);
    return me;
  },

  splitAssets(lesson) {
    const assets = (Array.isArray(lesson.assets) ? lesson.assets : []).map(decorateAsset);
    return {
      files: assets.filter((item) => item.type === 'FILE'),
      audios: assets.filter((item) => item.type === 'AUDIO'),
      videos: assets.filter((item) => item.type === 'VIDEO')
    };
  },

  async loadLessonAssets() {
    this.setData({
      loading: true,
      errorText: '',
      files: [],
      audios: [],
      videos: []
    });

    try {
      const me = await this.ensureCurrentUser();
      if (!me.classroomId) {
        this.setData({
          errorText: '当前账号还没有分配班级',
          lessonTitle: '课堂资料'
        });
        return;
      }

      const lessons = await learningService.getClassroomLessons(me.classroomId, { noCache: true });
      const lesson = (Array.isArray(lessons) ? lessons : []).find((item) => toInt(item.id, 0) === this.data.lessonId) || null;

      if (!lesson) {
        this.setData({
          errorText: '课程不存在或暂无权限',
          lessonTitle: '课堂资料'
        });
        wx.removeStorageSync('selected_lesson');
        return;
      }

      wx.setStorageSync('selected_lesson', lesson);

      const grouped = this.splitAssets(lesson);
      this.setData({
        lessonTitle: lesson.title || '课堂资料',
        files: grouped.files,
        audios: grouped.audios,
        videos: grouped.videos
      });
    } catch (err) {
      console.error('Load lesson assets failed:', err);
      this.setData({
        errorText: '加载失败，请稍后重试',
        lessonTitle: '课堂资料',
        files: [],
        audios: [],
        videos: []
      });
    } finally {
      this.setData({
        loading: false
      });
    }
  },

  openFile(asset) {
    if (!asset.url) {
      wx.showToast({
        title: '文件地址为空',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '打开中...'
    });
    wx.downloadFile({
      url: asset.url,
      success: (res) => {
        const tempPath = res.tempFilePath;
        wx.openDocument({
          filePath: tempPath,
          showMenu: true,
          complete: () => {
            wx.hideLoading();
          }
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '打开文件失败',
          icon: 'none'
        });
      }
    });
  },

  openAudio(asset) {
    const name = encodeURIComponent(asset.name || 'Audio');
    const url = encodeURIComponent(asset.url || '');
    const size = encodeURIComponent(asset.sizeText || '');
    const duration = encodeURIComponent(asset.durationText || '');
    wx.navigateTo({
      url: `/pages/player/audio/audio?id=${asset.id}&name=${name}&url=${url}&size=${size}&duration=${duration}`
    });
  },

  openVideo(asset) {
    const name = encodeURIComponent(asset.name || 'Video');
    const url = encodeURIComponent(asset.url || '');
    const size = encodeURIComponent(asset.sizeText || '');
    const duration = encodeURIComponent(asset.durationText || '');
    wx.navigateTo({
      url: `/pages/player/video/video?id=${asset.id}&name=${name}&url=${url}&size=${size}&duration=${duration}`
    });
  },

  handleAssetTap(e) {
    const type = String(e.currentTarget.dataset.type || '').toUpperCase();
    const assetId = toInt(e.currentTarget.dataset.id, 0);
    const all = [...this.data.files, ...this.data.audios, ...this.data.videos];
    const asset = all.find((item) => item.id === assetId);
    if (!asset) return;

    if (type === 'FILE') return this.openFile(asset);
    if (type === 'AUDIO') return this.openAudio(asset);
    if (type === 'VIDEO') return this.openVideo(asset);
  },

  handleBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});
