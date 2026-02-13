const api = require('./api');

function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (!res.code) {
          return reject(new Error('wx_login_code_missing'));
        }
        return resolve(res.code);
      },
      fail: reject
    });
  });
}

async function loginWithWechat(profile = {}) {
  const code = await wxLogin();
  const data = await api.request({
    url: '/auth/wechat-login',
    method: 'POST',
    data: {
      code,
      profile
    },
    auth: false
  });

  wx.setStorageSync('user_token', data.accessToken);
  wx.setStorageSync('refresh_token', data.refreshToken);
  wx.setStorageSync('user_info', data.user);

  return data.user;
}

async function loginWithEmail(payload) {
  const data = await api.request({
    url: '/auth/login',
    method: 'POST',
    data: payload,
    auth: false
  });

  wx.setStorageSync('user_token', data.accessToken);
  wx.setStorageSync('refresh_token', data.refreshToken);
  wx.setStorageSync('user_info', data.user);
  return data.user;
}

function logout() {
  const refreshToken = wx.getStorageSync('refresh_token');
  const req = api.request({
    url: '/auth/logout',
    method: 'POST',
    data: {
      refreshToken
    },
    auth: false
  }).catch(() => null);

  wx.removeStorageSync('user_token');
  wx.removeStorageSync('refresh_token');
  wx.removeStorageSync('user_info');
  return req;
}

function getMe() {
  return api.request({
    url: '/users/me',
    method: 'GET'
  });
}

async function registerWithEmail(payload) {
  const data = await api.request({
    url: '/auth/register',
    method: 'POST',
    data: payload,
    auth: false
  });

  wx.setStorageSync('user_token', data.accessToken);
  wx.setStorageSync('refresh_token', data.refreshToken);
  wx.setStorageSync('user_info', data.user);
  return data.user;
}

module.exports = {
  loginWithEmail,
  loginWithWechat,
  logout,
  getMe,
  registerWithEmail
};
