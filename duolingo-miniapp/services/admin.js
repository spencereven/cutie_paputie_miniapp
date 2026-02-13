const api = require('./api');

function getCampuses() {
  return api.request({
    url: '/campuses',
    method: 'GET'
  });
}

function getManagedClassrooms(campusId = '') {
  const query = campusId ? `?campusId=${encodeURIComponent(campusId)}` : '';
  return api.request({
    url: `/classrooms/managed${query}`,
    method: 'GET'
  });
}

function createClassroom(campusId, payload) {
  return api.request({
    url: `/campuses/${encodeURIComponent(campusId)}/classrooms`,
    method: 'POST',
    data: payload
  });
}

function getClassroomStudents(classroomId) {
  return api.request({
    url: `/classrooms/${encodeURIComponent(classroomId)}/students`,
    method: 'GET'
  });
}

function getUnassignedStudents(keyword = '', limit = 50) {
  const query = `?keyword=${encodeURIComponent(keyword)}&limit=${encodeURIComponent(limit)}`;
  return api.request({
    url: `/students/unassigned${query}`,
    method: 'GET'
  });
}

function assignStudentToClassroom(classroomId, studentId) {
  return api.request({
    url: `/classrooms/${encodeURIComponent(classroomId)}/students/${encodeURIComponent(studentId)}`,
    method: 'POST'
  });
}

function assignStudentsToClassroom(classroomId, studentIds) {
  return api.request({
    url: `/classrooms/${encodeURIComponent(classroomId)}/students`,
    method: 'POST',
    data: {
      studentIds
    }
  });
}

module.exports = {
  getCampuses,
  getManagedClassrooms,
  createClassroom,
  getClassroomStudents,
  getUnassignedStudents,
  assignStudentToClassroom,
  assignStudentsToClassroom
};
