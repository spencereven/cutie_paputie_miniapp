function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
}

const uploadMaxMb = parsePositiveInt(process.env.UPLOAD_MAX_MB, 100);
const bodyLimitMb = parsePositiveInt(process.env.BODY_LIMIT_MB, Math.ceil(uploadMaxMb * 1.7));

module.exports = {
  PORT: Number(process.env.PORT || 3000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_me',
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '2h',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  WECHAT_APP_ID: process.env.WECHAT_APP_ID || '',
  WECHAT_APP_SECRET: process.env.WECHAT_APP_SECRET || '',
  WECHAT_MOCK_MODE: process.env.WECHAT_MOCK_MODE !== 'false',
  UPLOAD_MAX_MB: uploadMaxMb,
  UPLOAD_MAX_BYTES: uploadMaxMb * 1024 * 1024,
  BODY_LIMIT_MB: bodyLimitMb,
  BODY_LIMIT_BYTES: bodyLimitMb * 1024 * 1024
};
