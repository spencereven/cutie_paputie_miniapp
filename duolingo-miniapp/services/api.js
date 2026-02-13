const API_BASE = 'http://127.0.0.1:3000/api/v1';

function getBaseUrl() {
  const custom = wx.getStorageSync('api_base_url');
  return custom || API_BASE;
}

function handleUnauthorized() {
  wx.removeStorageSync('user_token');
  wx.removeStorageSync('refresh_token');
  wx.removeStorageSync('user_info');
  wx.reLaunch({
    url: '/pages/login/welcome/welcome'
  });
}

function request(options = {}) {
  const {
    url,
    method = 'GET',
    data = {},
    auth = true
  } = options;

  const token = wx.getStorageSync('user_token');
  const headers = {
    'content-type': 'application/json'
  };
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${getBaseUrl()}${url}`,
      method,
      data,
      header: headers,
      success: (res) => {
        const body = res.data || {};
        if (res.statusCode === 401) {
          handleUnauthorized();
          return reject(new Error('unauthorized'));
        }
        if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 0) {
          return resolve(body.data);
        }
        return reject(new Error(body.message || `http_${res.statusCode}`));
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

module.exports = {
  request,
  getBaseUrl
};
