const learningService = require('../../../services/learning');
const authService = require('../../../services/auth');
const apiService = require('../../../services/api');

function toInt(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

function formatRelativeTime(input) {
  if (!input) return '更新于 未知';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '更新于 未知';

  const now = Date.now();
  const diff = now - date.getTime();
  const hour = 3600 * 1000;
  const day = 24 * hour;
  if (diff < day) return '更新于 今天';
  if (diff < 2 * day) return '更新于 昨天';
  return `更新于 ${Math.floor(diff / day)}天前`;
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

function mapLessonToCourse(lesson) {
  const assets = Array.isArray(lesson.assets) ? lesson.assets : [];
  const fileCount = assets.filter((item) => item.type === 'FILE').length;
  const audioCount = assets.filter((item) => item.type === 'AUDIO').length;
  const videoCount = assets.filter((item) => item.type === 'VIDEO').length;
  const firstVideo = assets.find((item) => item.type === 'VIDEO');
  const coverUrl = normalizeMediaUrl(lesson.coverImageUrl);
  const fallbackVideoUrl = normalizeMediaUrl(firstVideo && firstVideo.url);

  return {
    id: lesson.id,
    lessonId: lesson.id,
    rawLesson: lesson,
    title: lesson.title || `Lesson ${lesson.id}`,
    contentInfo: `课件 ${fileCount} · 音频 ${audioCount} · 视频 ${videoCount}`,
    updateTime: formatRelativeTime(lesson.updatedAt || lesson.createdAt),
    thumbnailUrl: coverUrl || fallbackVideoUrl,
    hasContent: assets.length > 0
  };
}

Page({
  data: {
    loading: false,
    courses: [],
    errorText: ''
  },

  onLoad() {
    const app = getApp();
    if (!app.ensureAuthForPage('pages/courses/list/list')) return;
  },

  onShow() {
    this.loadCourses();
  },

  async ensureCurrentUser() {
    const cached = wx.getStorageSync('user_info') || {};
    if (cached && cached.id && cached.classroomId) return cached;

    const me = await authService.getMe();
    wx.setStorageSync('user_info', me);
    return me;
  },

  async loadCourses() {
    this.setData({
      loading: true,
      errorText: ''
    });

    try {
      const me = await this.ensureCurrentUser();
      const classroomId = me && me.classroomId;
      if (!classroomId) {
        this.setData({
          courses: [],
          errorText: '当前账号还没有分配班级'
        });
        return;
      }

      const lessons = await learningService.getClassroomLessons(classroomId);
      const courses = (Array.isArray(lessons) ? lessons : []).map(mapLessonToCourse);

      this.setData({
        courses
      });
    } catch (err) {
      console.error('Load courses failed:', err);
      this.setData({
        courses: [],
        errorText: '课程加载失败，请稍后重试'
      });
    } finally {
      this.setData({
        loading: false
      });
    }
  },

  handleCourseClick(e) {
    const courseId = toInt(e.currentTarget.dataset.id, 0);
    const lesson = this.data.courses.find((item) => item.id === courseId);
    if (!lesson) return;

    wx.setStorageSync('selected_lesson', lesson.rawLesson || null);
    wx.navigateTo({
      url: `/pages/materials/detail/detail?id=${courseId}`
    });
  },

  handleBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});
