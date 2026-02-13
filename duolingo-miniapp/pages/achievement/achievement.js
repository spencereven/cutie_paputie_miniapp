Page({
  data: {
    badges: [
      { id: 1, name: '首次登陆', icon: '🎉', unlocked: true },
      { id: 2, name: '三连胜', icon: '🔥', unlocked: true },
      { id: 3, name: '完成课程', icon: '✅', unlocked: true },
      { id: 4, name: '一周坚持', icon: '📅', unlocked: true },
      { id: 5, name: '获得宝石', icon: '💎', unlocked: false },
      { id: 6, name: '完美成绩', icon: '⭐', unlocked: false }
    ],
    leaderboard: [
      { rank: 1, name: '学习小能手', points: 8530 },
      { rank: 2, name: '坚持达人', points: 7890 },
      { rank: 3, name: '你', points: 8309 },
      { rank: 4, name: '进步之星', points: 6543 },
      { rank: 5, name: '新手上路', points: 5432 }
    ]
  },

  onLoad() {
    const app = getApp();
    if (!app.ensureAuthForPage('pages/achievement/achievement')) return;

    console.log('Achievement page loaded');
  },

  onShow() {
    console.log('Achievement page shown');
  }
});
