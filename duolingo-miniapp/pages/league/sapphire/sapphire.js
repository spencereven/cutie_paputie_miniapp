const learningService = require('../../../services/learning');

function placeholders() {
  return [
    { id: 'placeholder-1', rank: 1, name: '-', initial: '-', level: 0, studyHours: 0, avatarColor: '#CBD5E1' },
    { id: 'placeholder-2', rank: 2, name: '-', initial: '-', level: 0, studyHours: 0, avatarColor: '#CBD5E1' },
    { id: 'placeholder-3', rank: 3, name: '-', initial: '-', level: 0, studyHours: 0, avatarColor: '#CBD5E1' }
  ];
}

Page({
  data: {
    rankType: 'class',
    userRank: 0,
    userStudyHours: 0,
    userName: 'User',
    userInitial: 'U',
    topThree: placeholders(),
    otherUsers: []
  },

  onLoad() {
    const app = getApp();
    if (!app.ensureAuthForPage('pages/league/sapphire/sapphire')) return;

    const userInfo = wx.getStorageSync('user_info') || {};
    const userName = String(userInfo.name || 'User');
    this.setData({
      userName,
      userInitial: userName.slice(0, 1).toUpperCase() || 'U'
    });

    this.loadLeaderboard('class');
  },

  ensureTopThree(rows) {
    const defaultRows = placeholders();
    return [0, 1, 2].map((idx) => rows[idx] || defaultRows[idx]);
  },

  applyLeaderboard(scope, payload) {
    const rankings = Array.isArray(payload.rankings) ? payload.rankings : [];
    const topSource = Array.isArray(payload.topThree) && payload.topThree.length > 0
      ? payload.topThree
      : rankings;
    const topThree = this.ensureTopThree(topSource);
    const currentUser = payload.currentUser || {};

    this.setData({
      rankType: scope,
      topThree,
      otherUsers: rankings,
      userRank: Number(currentUser.rank) || 0,
      userStudyHours: Number(currentUser.studyHours) || 0,
      userName: currentUser.name || this.data.userName,
      userInitial: currentUser.initial || this.data.userInitial
    });
  },

  async loadLeaderboard(scope) {
    try {
      const data = await learningService.getLeaderboard(scope, 20);
      this.applyLeaderboard(scope, data || {});
    } catch (err) {
      console.warn('Load leaderboard failed, use fallback:', err);
      this.applyLeaderboard(scope, {
        rankings: [],
        topThree: placeholders(),
        currentUser: {
          rank: 0,
          studyHours: 0,
          name: this.data.userName,
          initial: this.data.userInitial
        }
      });
    }
  },

  handleRankTypeChange(e) {
    const scope = e.currentTarget.dataset.type;
    this.loadLeaderboard(scope);
  },

  handleClose() {
    wx.navigateBack({
      delta: 1
    });
  }
});
