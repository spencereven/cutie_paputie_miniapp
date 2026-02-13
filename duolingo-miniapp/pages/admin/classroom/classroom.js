const adminService = require('../../../services/admin');
const authService = require('../../../services/auth');

function isTeacherOrAdmin(role) {
  return role === 'TEACHER' || role === 'ADMIN';
}

Page({
  data: {
    loading: false,
    role: '',
    campuses: [],
    campusIndex: 0,
    managedClasses: [],
    classIndex: 0,
    classStudents: [],
    unassignedStudents: [],
    unassignedKeyword: '',
    selectedCampusId: '',
    selectedClassroomId: '',
    newClassName: '',
    newClassCode: ''
  },

  onLoad() {
    const app = getApp();
    if (!app.ensureAuthForPage('pages/admin/classroom/classroom')) return;
    this.bootstrap();
  },

  async bootstrap() {
    this.setData({ loading: true });
    try {
      let user = wx.getStorageSync('user_info') || {};
      if (!user.role) {
        user = await authService.getMe();
        wx.setStorageSync('user_info', user);
      }

      if (!isTeacherOrAdmin(user.role)) {
        wx.showToast({
          title: 'No permission',
          icon: 'none'
        });
        wx.navigateBack({
          delta: 1,
          fail: () => {
            wx.reLaunch({
              url: '/pages/index/index'
            });
          }
        });
        return;
      }

      const campuses = await adminService.getCampuses();
      const selectedCampus = campuses[0] || null;
      const selectedCampusId = selectedCampus ? selectedCampus.id : '';
      const managedClasses = await adminService.getManagedClassrooms(selectedCampusId);
      const selectedClassroom = managedClasses[0] || null;
      const selectedClassroomId = selectedClassroom ? selectedClassroom.id : '';

      this.setData({
        role: user.role,
        campuses,
        campusIndex: 0,
        managedClasses,
        classIndex: 0,
        selectedCampusId,
        selectedClassroomId
      });

      await Promise.all([
        this.loadClassStudents(),
        this.loadUnassignedStudents()
      ]);
    } catch (err) {
      console.error('Load classroom admin failed:', err);
      wx.showToast({
        title: 'Load failed',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  getSelectedCampusId() {
    const campus = this.data.campuses[this.data.campusIndex];
    return campus ? campus.id : '';
  },

  getSelectedClassroom() {
    return this.data.managedClasses[this.data.classIndex] || null;
  },

  async loadManagedClassesByCampus(campusId) {
    const managedClasses = await adminService.getManagedClassrooms(campusId);
    const selectedClassroom = managedClasses[0] || null;
    this.setData({
      managedClasses,
      classIndex: 0,
      selectedClassroomId: selectedClassroom ? selectedClassroom.id : ''
    });
    await this.loadClassStudents();
  },

  async loadClassStudents() {
    const classroom = this.getSelectedClassroom();
    if (!classroom) {
      this.setData({
        classStudents: [],
        selectedClassroomId: ''
      });
      return;
    }

    try {
      const students = await adminService.getClassroomStudents(classroom.id);
      this.setData({
        classStudents: Array.isArray(students) ? students : [],
        selectedClassroomId: classroom.id
      });
    } catch (err) {
      console.warn('Load class students failed:', err);
      this.setData({ classStudents: [] });
    }
  },

  async loadUnassignedStudents() {
    try {
      const list = await adminService.getUnassignedStudents(this.data.unassignedKeyword, 100);
      this.setData({
        unassignedStudents: Array.isArray(list) ? list : []
      });
    } catch (err) {
      console.warn('Load unassigned students failed:', err);
      this.setData({ unassignedStudents: [] });
    }
  },

  async handleCampusChange(e) {
    const campusIndex = Number(e.detail.value) || 0;
    const campus = this.data.campuses[campusIndex] || null;
    const campusId = campus ? campus.id : '';
    this.setData({
      campusIndex,
      selectedCampusId: campusId
    });

    await this.loadManagedClassesByCampus(campusId);
  },

  async handleClassChange(e) {
    const classIndex = Number(e.detail.value) || 0;
    const classroom = this.data.managedClasses[classIndex] || null;
    this.setData({
      classIndex,
      selectedClassroomId: classroom ? classroom.id : ''
    });
    await this.loadClassStudents();
  },

  handleClassNameInput(e) {
    this.setData({
      newClassName: e.detail.value
    });
  },

  handleClassCodeInput(e) {
    this.setData({
      newClassCode: e.detail.value
    });
  },

  handleKeywordInput(e) {
    this.setData({
      unassignedKeyword: e.detail.value
    });
  },

  async handleSearchStudents() {
    await this.loadUnassignedStudents();
  },

  async handleCreateClassroom() {
    const campusId = this.getSelectedCampusId();
    const name = String(this.data.newClassName || '').trim();
    const code = String(this.data.newClassCode || '').trim();

    if (!campusId) {
      wx.showToast({
        title: 'Select campus first',
        icon: 'none'
      });
      return;
    }
    if (!name) {
      wx.showToast({
        title: 'Class name required',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: 'Creating...'
    });
    try {
      const created = await adminService.createClassroom(campusId, {
        name,
        code
      });
      wx.hideLoading();
      wx.showToast({
        title: 'Created',
        icon: 'success'
      });

      const managedClasses = await adminService.getManagedClassrooms(campusId);
      const nextIndex = managedClasses.findIndex((item) => item.id === created.id);
      this.setData({
        managedClasses,
        classIndex: nextIndex >= 0 ? nextIndex : 0,
        selectedClassroomId: created.id,
        newClassName: '',
        newClassCode: ''
      });
      await this.loadClassStudents();
    } catch (err) {
      wx.hideLoading();
      console.error('Create classroom failed:', err);
      wx.showToast({
        title: 'Create failed',
        icon: 'none'
      });
    }
  },

  async handleAssignStudent(e) {
    const classroom = this.getSelectedClassroom();
    const studentId = String(e.currentTarget.dataset.studentId || '').trim();

    if (!classroom) {
      wx.showToast({
        title: 'Select class first',
        icon: 'none'
      });
      return;
    }
    if (!studentId) return;

    wx.showLoading({
      title: 'Assigning...'
    });
    try {
      await adminService.assignStudentToClassroom(classroom.id, studentId);
      wx.hideLoading();
      wx.showToast({
        title: 'Assigned',
        icon: 'success'
      });

      await Promise.all([
        this.loadClassStudents(),
        this.loadUnassignedStudents()
      ]);
    } catch (err) {
      wx.hideLoading();
      console.error('Assign student failed:', err);
      wx.showToast({
        title: 'Assign failed',
        icon: 'none'
      });
    }
  },

  async handleRefreshAll() {
    wx.showLoading({
      title: 'Refreshing...'
    });
    try {
      const campusId = this.getSelectedCampusId();
      await this.loadManagedClassesByCampus(campusId);
      await this.loadUnassignedStudents();
    } finally {
      wx.hideLoading();
    }
  }
});
