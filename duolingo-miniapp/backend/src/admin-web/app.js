const PAGE = String(document.body.dataset.page || 'dashboard').toLowerCase();
const LOGIN_PATH = '/admin/login';
const DASHBOARD_PATH = '/admin/dashboard';

const LS_KEY = {
  token: 'admin_web_token',
  refreshToken: 'admin_web_refresh_token',
  user: 'admin_web_user'
};

const state = {
  token: localStorage.getItem(LS_KEY.token) || '',
  refreshToken: localStorage.getItem(LS_KEY.refreshToken) || '',
  user: JSON.parse(localStorage.getItem(LS_KEY.user) || 'null'),
  campuses: [],
  managedClasses: [],
  classStudents: [],
  unassignedStudents: [],
  lessons: [],
  selectedCampusId: '',
  selectedClassroomId: '',
  uploadMaxBytes: 0,
  uploadMaxLabel: 'Unknown'
};

function byId(id) {
  return document.getElementById(id);
}

const els = {
  loginForm: byId('loginForm'),
  loginEmail: byId('loginEmail'),
  loginPassword: byId('loginPassword'),
  loginError: byId('loginError'),
  userName: byId('userName'),
  userRole: byId('userRole'),
  logoutBtn: byId('logoutBtn'),
  reloadBtn: byId('reloadBtn'),
  notice: byId('notice'),
  statusBar: byId('statusBar'),
  managerContent: byId('managerContent'),
  navLinks: Array.from(document.querySelectorAll('[data-nav]')),

  campusSelect: byId('campusSelect'),
  classSelect: byId('classSelect'),
  refreshClassesBtn: byId('refreshClassesBtn'),

  createClassName: byId('createClassName'),
  createClassCode: byId('createClassCode'),
  createClassBtn: byId('createClassBtn'),
  classStudentsList: byId('classStudentsList'),
  unassignedKeyword: byId('unassignedKeyword'),
  searchUnassignedBtn: byId('searchUnassignedBtn'),
  unassignedStudentsList: byId('unassignedStudentsList'),

  createLessonTitle: byId('createLessonTitle'),
  createLessonStatus: byId('createLessonStatus'),
  createLessonDesc: byId('createLessonDesc'),
  createLessonCoverUrl: byId('createLessonCoverUrl'),
  createLessonBtn: byId('createLessonBtn'),
  lessonsList: byId('lessonsList'),

  uploadLessonSelect: byId('uploadLessonSelect'),
  uploadLessonSelectMirror: byId('uploadLessonSelectMirror'),
  uploadAssetType: byId('uploadAssetType'),
  uploadAssetTitle: byId('uploadAssetTitle'),
  uploadFileInput: byId('uploadFileInput'),
  uploadLimitHint: byId('uploadLimitHint'),
  uploadAssetBtn: byId('uploadAssetBtn'),
  cancelAssetSelectBtn: byId('cancelAssetSelectBtn'),
  uploadCoverFileInput: byId('uploadCoverFileInput'),
  uploadCoverBtn: byId('uploadCoverBtn'),
  cancelCoverSelectBtn: byId('cancelCoverSelectBtn'),

  dashboardCampusCount: byId('dashboardCampusCount'),
  dashboardClassCount: byId('dashboardClassCount'),
  dashboardStudentCount: byId('dashboardStudentCount'),
  dashboardLessonCount: byId('dashboardLessonCount')
};

function isTeacherOrAdmin(role) {
  return role === 'TEACHER' || role === 'ADMIN';
}

function redirectTo(pathname) {
  if (window.location.pathname !== pathname) window.location.assign(pathname);
}

function formatBytesToMbLabel(bytes) {
  const mb = Math.max(1, Math.round((Number(bytes) || 0) / (1024 * 1024)));
  return `${mb}MB`;
}

function syncUploadLimitHint() {
  if (!els.uploadLimitHint) return;
  els.uploadLimitHint.textContent = `Upload limit: ${state.uploadMaxLabel} per file`;
}

function setLoading(button, loading, loadingText = 'Loading...') {
  if (!button) return;
  if (loading) {
    button.disabled = true;
    button.dataset.oldText = button.textContent;
    button.textContent = loadingText;
    return;
  }
  button.disabled = false;
  button.textContent = button.dataset.oldText || button.textContent;
}

function showStatus(text, isError = false) {
  if (!els.statusBar) return;
  els.statusBar.textContent = text;
  els.statusBar.classList.remove('hidden');
  els.statusBar.style.background = isError ? '#fee2e2' : '#dcfce7';
  els.statusBar.style.color = isError ? '#991b1b' : '#166534';
  window.setTimeout(() => {
    if (els.statusBar) els.statusBar.classList.add('hidden');
  }, 2800);
}

function setLoginError(text) {
  if (!els.loginError) return;
  if (!text) {
    els.loginError.classList.add('hidden');
    els.loginError.textContent = '';
    return;
  }
  els.loginError.classList.remove('hidden');
  els.loginError.textContent = text;
}

function setNotice(text) {
  if (!els.notice) return;
  if (!text) {
    els.notice.classList.add('hidden');
    els.notice.textContent = '';
    return;
  }
  els.notice.classList.remove('hidden');
  els.notice.textContent = text;
}

function persistSession() {
  localStorage.setItem(LS_KEY.token, state.token || '');
  localStorage.setItem(LS_KEY.refreshToken, state.refreshToken || '');
  localStorage.setItem(LS_KEY.user, JSON.stringify(state.user || null));
}

function clearSession() {
  state.token = '';
  state.refreshToken = '';
  state.user = null;
  state.uploadMaxBytes = 0;
  state.uploadMaxLabel = 'Unknown';
  localStorage.removeItem(LS_KEY.token);
  localStorage.removeItem(LS_KEY.refreshToken);
  localStorage.removeItem(LS_KEY.user);
  syncUploadLimitHint();
}

async function api(path, options = {}) {
  const method = options.method || 'GET';
  const body = options.body;
  const auth = options.auth !== false;
  const headers = {};

  if (body !== undefined) headers['content-type'] = 'application/json';
  if (auth && state.token) headers.authorization = `Bearer ${state.token}`;

  const requestOptions = {
    method,
    cache: 'no-store',
    headers
  };
  if (body !== undefined) requestOptions.body = JSON.stringify(body);

  const res = await fetch(`/api/v1${path}`, requestOptions);

  let payload = {};
  try {
    payload = await res.json();
  } catch (err) {
    payload = {};
  }

  if (res.status === 401) {
    clearSession();
    if (PAGE !== 'login') redirectTo(LOGIN_PATH);
    throw new Error('unauthorized');
  }

  if (!res.ok || payload.code !== 0) {
    if (payload && payload.message === 'file_too_large') {
      const limitMb = payload.data && payload.data.maxUploadMB;
      if (limitMb) {
        state.uploadMaxLabel = `${limitMb}MB`;
        state.uploadMaxBytes = Number(payload.data.maxUploadBytes) || state.uploadMaxBytes;
        syncUploadLimitHint();
      }
      throw new Error(`文件过大，当前上限 ${state.uploadMaxLabel}`);
    }
    if (res.status === 413) throw new Error(`文件过大，当前上限 ${state.uploadMaxLabel}`);
    throw new Error(payload.message || `http_${res.status}`);
  }
  return payload.data;
}

function renderHeader() {
  if (els.userName) els.userName.textContent = (state.user && state.user.name) || '-';
  if (els.userRole) els.userRole.textContent = (state.user && state.user.role) || '-';
  els.navLinks.forEach((link) => {
    const active = String(link.dataset.nav || '') === PAGE;
    link.classList.toggle('active', active);
  });
}

function renderPermissionState() {
  const manager = isTeacherOrAdmin(state.user && state.user.role);
  if (els.managerContent) els.managerContent.classList.toggle('hidden', !manager);
  setNotice(manager ? '' : 'Current role is STUDENT. Management actions are disabled.');
}

function fillSelect(selectEl, options, selected, emptyLabel) {
  if (!selectEl) return;
  selectEl.innerHTML = '';
  if (!Array.isArray(options) || options.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = emptyLabel;
    selectEl.appendChild(option);
    selectEl.value = '';
    return;
  }
  options.forEach((item) => {
    const option = document.createElement('option');
    option.value = String(item.id);
    option.textContent = item.name;
    selectEl.appendChild(option);
  });
  selectEl.value = selected ? String(selected) : String(options[0].id);
}

function renderDashboard() {
  if (els.dashboardCampusCount) els.dashboardCampusCount.textContent = String(state.campuses.length);
  if (els.dashboardClassCount) els.dashboardClassCount.textContent = String(state.managedClasses.length);
  if (els.dashboardStudentCount) els.dashboardStudentCount.textContent = String(state.classStudents.length);
  if (els.dashboardLessonCount) els.dashboardLessonCount.textContent = String(state.lessons.length);
}

function renderStudentList() {
  if (!els.classStudentsList) return;
  const rows = state.classStudents || [];
  if (rows.length === 0) {
    els.classStudentsList.innerHTML = '<li><div class="sub">No students in this class</div></li>';
    return;
  }
  els.classStudentsList.innerHTML = rows.map((item) => `
    <li>
      <div class="main">
        <div class="name">${item.name || '-'}</div>
        <div class="sub">${item.email || item.id}</div>
      </div>
    </li>
  `).join('');
}

function renderUnassignedList() {
  if (!els.unassignedStudentsList) return;
  const rows = state.unassignedStudents || [];
  if (rows.length === 0) {
    els.unassignedStudentsList.innerHTML = '<li><div class="sub">No unassigned students</div></li>';
    return;
  }
  els.unassignedStudentsList.innerHTML = rows.map((item) => `
    <li>
      <div class="main">
        <div class="name">${item.name || '-'}</div>
        <div class="sub">${item.email || item.id}</div>
      </div>
      <button class="secondary assign-btn" data-student-id="${item.id}" type="button">Assign</button>
    </li>
  `).join('');

  els.unassignedStudentsList.querySelectorAll('.assign-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!state.selectedClassroomId) {
        showStatus('Select classroom first', true);
        return;
      }
      const studentId = btn.dataset.studentId;
      try {
        setLoading(btn, true, 'Assigning...');
        await api(`/classrooms/${encodeURIComponent(state.selectedClassroomId)}/students/${encodeURIComponent(studentId)}`, {
          method: 'POST'
        });
        showStatus('Student assigned');
        await Promise.all([loadClassStudents(), loadUnassignedStudents()]);
      } catch (err) {
        showStatus(err.message || 'Assign failed', true);
      } finally {
        setLoading(btn, false);
      }
    });
  });
}

function renderUploadLessonSelects() {
  const lessonOptions = state.lessons.map((lesson) => ({
    id: lesson.id,
    name: `${lesson.title} [${lesson.status}]`
  }));

  fillSelect(els.uploadLessonSelect, lessonOptions, state.lessons[0] ? state.lessons[0].id : '', 'No lessons');
  if (els.uploadLessonSelectMirror) {
    fillSelect(
      els.uploadLessonSelectMirror,
      lessonOptions,
      (els.uploadLessonSelect && els.uploadLessonSelect.value) || (state.lessons[0] ? state.lessons[0].id : ''),
      'No lessons'
    );
  }
}

function renderLessons() {
  renderUploadLessonSelects();
  if (!els.lessonsList) return;

  if (!Array.isArray(state.lessons) || state.lessons.length === 0) {
    els.lessonsList.innerHTML = '<li><div class="sub">No lessons in this class</div></li>';
    return;
  }

  els.lessonsList.innerHTML = state.lessons.map((lesson) => {
    const assets = Array.isArray(lesson.assets) ? lesson.assets : [];
    const assetRows = assets.length
      ? assets.map((asset) => `
        <div class="asset-row">
          <div class="sub">${asset.type}: ${asset.title}</div>
          <button
            class="secondary delete-asset-btn"
            data-lesson-id="${lesson.id}"
            data-asset-id="${asset.id}"
            type="button"
          >
            Delete
          </button>
        </div>
      `).join('')
      : '<div class="sub">No assets</div>';
    const coverText = lesson.coverImageUrl ? 'Cover: configured' : 'Cover: missing';
    return `
      <li>
        <div class="main">
          <div class="name">${lesson.title} <span class="sub">[${lesson.status}]</span></div>
          <div class="sub">${coverText}</div>
          <div class="asset-list">${assetRows}</div>
        </div>
        <div class="lesson-actions">
          <button
            class="secondary clear-cover-btn"
            data-lesson-id="${lesson.id}"
            type="button"
            ${lesson.coverImageUrl ? '' : 'disabled'}
          >
            Clear Cover
          </button>
        </div>
      </li>
    `;
  }).join('');

  els.lessonsList.querySelectorAll('.delete-asset-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const lessonId = String(btn.dataset.lessonId || '').trim();
      const assetId = String(btn.dataset.assetId || '').trim();
      if (!lessonId || !assetId) return;
      if (!window.confirm('Delete this asset?')) return;

      try {
        setLoading(btn, true, 'Deleting...');
        await api(`/lessons/${encodeURIComponent(lessonId)}/assets/${encodeURIComponent(assetId)}`, {
          method: 'DELETE'
        });
        await loadLessons();
        showStatus('Asset deleted');
      } catch (err) {
        showStatus(err.message || 'Delete asset failed', true);
      } finally {
        setLoading(btn, false);
      }
    });
  });

  els.lessonsList.querySelectorAll('.clear-cover-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const lessonId = String(btn.dataset.lessonId || '').trim();
      if (!lessonId) return;
      if (!window.confirm('Clear lesson cover image?')) return;

      try {
        setLoading(btn, true, 'Clearing...');
        await api(`/lessons/${encodeURIComponent(lessonId)}`, {
          method: 'PATCH',
          body: { coverImageUrl: '' }
        });
        await loadLessons();
        showStatus('Lesson cover cleared');
      } catch (err) {
        showStatus(err.message || 'Clear cover failed', true);
      } finally {
        setLoading(btn, false);
      }
    });
  });
}

async function loadCampuses() {
  if (!els.campusSelect) return;
  const previous = state.selectedCampusId;
  state.campuses = await api('/campuses');
  const stillValid = state.campuses.some((item) => String(item.id) === String(previous));
  state.selectedCampusId = stillValid
    ? previous
    : (state.campuses[0] ? String(state.campuses[0].id) : '');
  fillSelect(els.campusSelect, state.campuses, state.selectedCampusId, 'No campus');
}

async function loadManagedClassrooms() {
  if (!els.classSelect) return;
  const previous = state.selectedClassroomId;
  const query = state.selectedCampusId ? `?campusId=${encodeURIComponent(state.selectedCampusId)}` : '';
  state.managedClasses = await api(`/classrooms/managed${query}`);
  const stillValid = state.managedClasses.some((item) => String(item.id) === String(previous));
  state.selectedClassroomId = stillValid
    ? previous
    : (state.managedClasses[0] ? String(state.managedClasses[0].id) : '');
  fillSelect(els.classSelect, state.managedClasses, state.selectedClassroomId, 'No classroom');
}

async function loadClassStudents() {
  if (!state.selectedClassroomId) {
    state.classStudents = [];
    renderStudentList();
    renderDashboard();
    return;
  }
  state.classStudents = await api(`/classrooms/${encodeURIComponent(state.selectedClassroomId)}/students`);
  renderStudentList();
  renderDashboard();
}

async function loadUnassignedStudents() {
  const keyword = String((els.unassignedKeyword && els.unassignedKeyword.value) || '').trim();
  const query = `?keyword=${encodeURIComponent(keyword)}&limit=100`;
  state.unassignedStudents = await api(`/students/unassigned${query}`);
  renderUnassignedList();
}

async function loadLessons() {
  if (!state.selectedClassroomId) {
    state.lessons = [];
    renderLessons();
    renderDashboard();
    return;
  }
  state.lessons = await api(`/classrooms/${encodeURIComponent(state.selectedClassroomId)}/lessons?_t=${Date.now()}`);
  renderLessons();
  renderDashboard();
}

async function loadUploadLimit() {
  try {
    const data = await api('/uploads/limits');
    const maxBytes = Number(data && data.maxUploadBytes) || 0;
    const maxLabel = data && data.maxUploadMB ? `${data.maxUploadMB}MB` : formatBytesToMbLabel(maxBytes);
    if (maxBytes > 0) {
      state.uploadMaxBytes = maxBytes;
      state.uploadMaxLabel = maxLabel;
      syncUploadLimitHint();
    }
  } catch (err) {
    syncUploadLimitHint();
  }
}

async function refreshDataByPage() {
  if (!isTeacherOrAdmin(state.user && state.user.role)) return;
  await loadCampuses();
  await loadManagedClassrooms();

  if (PAGE === 'classrooms') {
    await Promise.all([loadClassStudents(), loadUnassignedStudents()]);
    return;
  }
  if (PAGE === 'lessons') {
    await loadLessons();
    return;
  }
  if (PAGE === 'uploads') {
    await Promise.all([loadLessons(), loadUploadLimit()]);
    return;
  }

  await Promise.all([loadClassStudents(), loadLessons()]);
}

function validateUploadFile(file) {
  if (!file) return 'Choose file first';
  if (state.uploadMaxBytes > 0 && file.size > state.uploadMaxBytes) {
    return `文件过大，当前上限 ${state.uploadMaxLabel}`;
  }
  return '';
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadFileToServer(file) {
  const dataUrl = await readFileAsDataURL(file);
  return api('/uploads/base64', {
    method: 'POST',
    body: {
      filename: file.name,
      contentBase64: dataUrl,
      mimeType: file.type || 'application/octet-stream'
    }
  });
}

function guessAssetType(fileType) {
  const t = String(fileType || '').toLowerCase();
  if (t.startsWith('audio/')) return 'AUDIO';
  if (t.startsWith('video/')) return 'VIDEO';
  return 'FILE';
}

async function hydrateUserIfNeeded() {
  if (!state.token) return;
  try {
    const me = await api('/users/me');
    state.user = me;
    persistSession();
  } catch (err) {
    clearSession();
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  setLoginError('');
  const email = (els.loginEmail && els.loginEmail.value.trim()) || '';
  const password = (els.loginPassword && els.loginPassword.value) || '';
  if (!email || !password) {
    setLoginError('Email and password are required');
    return;
  }

  try {
    const submitButton = els.loginForm && els.loginForm.querySelector('button[type="submit"]');
    setLoading(submitButton, true, 'Signing in...');
    const data = await api('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password }
    });
    state.token = data.accessToken;
    state.refreshToken = data.refreshToken;
    state.user = data.user;
    persistSession();
    if (!isTeacherOrAdmin(state.user && state.user.role)) {
      clearSession();
      setLoginError('Only TEACHER/ADMIN can use web admin');
      return;
    }
    redirectTo(DASHBOARD_PATH);
  } catch (err) {
    setLoginError(err.message || 'Login failed');
  } finally {
    const submitButton = els.loginForm && els.loginForm.querySelector('button[type="submit"]');
    setLoading(submitButton, false);
  }
}

async function handleCreateClassroom() {
  if (!state.selectedCampusId) {
    showStatus('Select campus first', true);
    return;
  }
  const name = String((els.createClassName && els.createClassName.value) || '').trim();
  const code = String((els.createClassCode && els.createClassCode.value) || '').trim();
  if (!name) {
    showStatus('Class name required', true);
    return;
  }

  try {
    setLoading(els.createClassBtn, true, 'Creating...');
    await api(`/campuses/${encodeURIComponent(state.selectedCampusId)}/classrooms`, {
      method: 'POST',
      body: { name, code }
    });
    if (els.createClassName) els.createClassName.value = '';
    if (els.createClassCode) els.createClassCode.value = '';
    await loadManagedClassrooms();
    await Promise.all([loadClassStudents(), loadUnassignedStudents()]);
    showStatus('Classroom created');
  } catch (err) {
    showStatus(err.message || 'Create failed', true);
  } finally {
    setLoading(els.createClassBtn, false);
  }
}

async function handleCreateLesson() {
  if (!state.selectedClassroomId) {
    showStatus('Select classroom first', true);
    return;
  }
  const title = String((els.createLessonTitle && els.createLessonTitle.value) || '').trim();
  const status = (els.createLessonStatus && els.createLessonStatus.value) || 'PUBLISHED';
  const description = String((els.createLessonDesc && els.createLessonDesc.value) || '').trim();
  const coverImageUrl = String((els.createLessonCoverUrl && els.createLessonCoverUrl.value) || '').trim();
  if (!title) {
    showStatus('Lesson title required', true);
    return;
  }

  try {
    setLoading(els.createLessonBtn, true, 'Creating...');
    await api(`/classrooms/${encodeURIComponent(state.selectedClassroomId)}/lessons`, {
      method: 'POST',
      body: { title, status, description, coverImageUrl }
    });
    if (els.createLessonTitle) els.createLessonTitle.value = '';
    if (els.createLessonDesc) els.createLessonDesc.value = '';
    if (els.createLessonCoverUrl) els.createLessonCoverUrl.value = '';
    await loadLessons();
    showStatus('Lesson created');
  } catch (err) {
    showStatus(err.message || 'Create lesson failed', true);
  } finally {
    setLoading(els.createLessonBtn, false);
  }
}

async function handleUploadAsset() {
  const lessonId = String((els.uploadLessonSelect && els.uploadLessonSelect.value) || '').trim();
  const file = els.uploadFileInput && els.uploadFileInput.files && els.uploadFileInput.files[0];
  const title = String((els.uploadAssetTitle && els.uploadAssetTitle.value) || '').trim() || (file ? file.name : '');
  const type = (els.uploadAssetType && els.uploadAssetType.value) || (file ? guessAssetType(file.type) : 'FILE');

  if (!lessonId) {
    showStatus('Select lesson first', true);
    return;
  }
  const fileError = validateUploadFile(file);
  if (fileError) {
    showStatus(fileError, true);
    return;
  }
  if (!title) {
    showStatus('Asset title required', true);
    return;
  }

  try {
    setLoading(els.uploadAssetBtn, true, 'Uploading...');
    const uploaded = await uploadFileToServer(file);
    await api(`/lessons/${encodeURIComponent(lessonId)}/assets`, {
      method: 'POST',
      body: {
        type,
        title,
        url: `${window.location.origin}${uploaded.url}`,
        fileSizeBytes: uploaded.size,
        mimeType: uploaded.mimeType
      }
    });
    if (els.uploadAssetTitle) els.uploadAssetTitle.value = '';
    if (els.uploadFileInput) els.uploadFileInput.value = '';
    await loadLessons();
    showStatus('Asset uploaded');
  } catch (err) {
    showStatus(err.message || 'Upload failed', true);
  } finally {
    setLoading(els.uploadAssetBtn, false);
  }
}

async function handleUploadCover() {
  const lessonId = String((els.uploadLessonSelect && els.uploadLessonSelect.value) || '').trim();
  const file = els.uploadCoverFileInput && els.uploadCoverFileInput.files && els.uploadCoverFileInput.files[0];
  if (!lessonId) {
    showStatus('Select lesson first', true);
    return;
  }
  const fileError = validateUploadFile(file);
  if (fileError) {
    showStatus(fileError, true);
    return;
  }

  try {
    setLoading(els.uploadCoverBtn, true, 'Uploading...');
    const uploaded = await uploadFileToServer(file);
    await api(`/lessons/${encodeURIComponent(lessonId)}`, {
      method: 'PATCH',
      body: {
        coverImageUrl: `${window.location.origin}${uploaded.url}`
      }
    });
    if (els.uploadCoverFileInput) els.uploadCoverFileInput.value = '';
    await loadLessons();
    showStatus('Lesson cover updated');
  } catch (err) {
    showStatus(err.message || 'Upload cover failed', true);
  } finally {
    setLoading(els.uploadCoverBtn, false);
  }
}

function handleCancelAssetSelection() {
  if (els.uploadAssetTitle) els.uploadAssetTitle.value = '';
  if (els.uploadFileInput) els.uploadFileInput.value = '';
  showStatus('Asset upload selection canceled');
}

function handleCancelCoverSelection() {
  if (els.uploadCoverFileInput) els.uploadCoverFileInput.value = '';
  showStatus('Cover upload selection canceled');
}

function bindCommonEvents() {
  if (els.logoutBtn) {
    els.logoutBtn.addEventListener('click', () => {
      clearSession();
      redirectTo(LOGIN_PATH);
    });
  }

  if (els.reloadBtn) {
    els.reloadBtn.addEventListener('click', async () => {
      try {
        setLoading(els.reloadBtn, true, 'Reloading...');
        await refreshDataByPage();
        showStatus('Data reloaded');
      } catch (err) {
        showStatus(err.message || 'Reload failed', true);
      } finally {
        setLoading(els.reloadBtn, false);
      }
    });
  }

  if (els.refreshClassesBtn) {
    els.refreshClassesBtn.addEventListener('click', async () => {
      try {
        await loadManagedClassrooms();
        await refreshDataByPage();
        showStatus('Class list refreshed');
      } catch (err) {
        showStatus(err.message || 'Refresh failed', true);
      }
    });
  }

  if (els.campusSelect) {
    els.campusSelect.addEventListener('change', async () => {
      state.selectedCampusId = String(els.campusSelect.value || '');
      try {
        await loadManagedClassrooms();
        await refreshDataByPage();
      } catch (err) {
        showStatus(err.message || 'Load class failed', true);
      }
    });
  }

  if (els.classSelect) {
    els.classSelect.addEventListener('change', async () => {
      state.selectedClassroomId = String(els.classSelect.value || '');
      try {
        await refreshDataByPage();
      } catch (err) {
        showStatus(err.message || 'Load data failed', true);
      }
    });
  }

  if (els.uploadLessonSelect && els.uploadLessonSelectMirror) {
    els.uploadLessonSelect.addEventListener('change', () => {
      els.uploadLessonSelectMirror.value = String(els.uploadLessonSelect.value || '');
    });
  }
}

function bindPageEvents() {
  if (PAGE === 'login' && els.loginForm) {
    els.loginForm.addEventListener('submit', handleLoginSubmit);
  }

  if (els.createClassBtn) els.createClassBtn.addEventListener('click', handleCreateClassroom);
  if (els.searchUnassignedBtn) {
    els.searchUnassignedBtn.addEventListener('click', async () => {
      try {
        await loadUnassignedStudents();
      } catch (err) {
        showStatus(err.message || 'Search failed', true);
      }
    });
  }
  if (els.createLessonBtn) els.createLessonBtn.addEventListener('click', handleCreateLesson);
  if (els.uploadAssetBtn) els.uploadAssetBtn.addEventListener('click', handleUploadAsset);
  if (els.cancelAssetSelectBtn) els.cancelAssetSelectBtn.addEventListener('click', handleCancelAssetSelection);
  if (els.uploadCoverBtn) els.uploadCoverBtn.addEventListener('click', handleUploadCover);
  if (els.cancelCoverSelectBtn) els.cancelCoverSelectBtn.addEventListener('click', handleCancelCoverSelection);
}

async function bootstrapLoginPage() {
  if (!state.token) return;
  await hydrateUserIfNeeded();
  if (state.user && isTeacherOrAdmin(state.user.role)) {
    redirectTo(DASHBOARD_PATH);
    return;
  }
  clearSession();
}

async function bootstrapManagerPage() {
  if (!state.token) {
    redirectTo(LOGIN_PATH);
    return;
  }
  await hydrateUserIfNeeded();
  if (!state.user) {
    redirectTo(LOGIN_PATH);
    return;
  }

  renderHeader();
  renderPermissionState();
  syncUploadLimitHint();

  if (!isTeacherOrAdmin(state.user.role)) return;

  try {
    await refreshDataByPage();
  } catch (err) {
    showStatus(err.message || 'Failed to load data', true);
  }
}

async function bootstrap() {
  bindCommonEvents();
  bindPageEvents();

  if (PAGE === 'login') {
    await bootstrapLoginPage();
    return;
  }

  await bootstrapManagerPage();
}

bootstrap();
