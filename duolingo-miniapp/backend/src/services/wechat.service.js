const { request } = require('undici');

async function getSessionByCode({ code, appId, appSecret, mockMode }) {
  if (!code) {
    throw new Error('wechat_code_required');
  }

  // 本地开发模式：未配置密钥时可用 mock 登录
  if (mockMode || !appId || !appSecret) {
    return {
      openid: `mock_openid_${String(code).slice(0, 16)}`,
      unionid: '',
      session_key: 'mock_session_key'
    };
  }

  const url =
    `https://api.weixin.qq.com/sns/jscode2session` +
    `?appid=${encodeURIComponent(appId)}` +
    `&secret=${encodeURIComponent(appSecret)}` +
    `&js_code=${encodeURIComponent(code)}` +
    `&grant_type=authorization_code`;

  const response = await request(url, {
    method: 'GET'
  });

  const body = await response.body.json();
  if (!body || body.errcode) {
    const reason = body && body.errmsg ? body.errmsg : 'wechat_jscode2session_failed';
    throw new Error(reason);
  }

  return body;
}

module.exports = {
  getSessionByCode
};
