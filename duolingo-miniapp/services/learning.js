const api = require('./api');

function getSections() {
  return api.request({
    url: '/sections',
    method: 'GET'
  });
}

function getSectionDetail(sectionId) {
  return api.request({
    url: `/sections/${sectionId}`,
    method: 'GET'
  });
}

function getLeaderboard(scope = 'class', limit = 20) {
  return api.request({
    url: `/leaderboard?scope=${encodeURIComponent(scope)}&limit=${encodeURIComponent(limit)}`,
    method: 'GET'
  });
}

function getClassroomLessons(classroomId, options = {}) {
  const noCache = !!(options && options.noCache);
  const query = noCache ? `?_t=${Date.now()}` : '';
  return api.request({
    url: `/classrooms/${encodeURIComponent(classroomId)}/lessons${query}`,
    method: 'GET'
  });
}

module.exports = {
  getSections,
  getSectionDetail,
  getLeaderboard,
  getClassroomLessons
};
