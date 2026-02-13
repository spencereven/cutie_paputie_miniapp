const apiService = require('./api');

const DEFAULT_PASS_SCORE = 70;
const DEFAULT_MAX_ATTEMPTS = 2;

const DEFAULT_LEVEL1_QUESTIONS = [
  {
    id: 'l1-demo-1',
    title: 'Question 1',
    promptText: 'Listen and answer in English.',
    imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80',
    promptAudioUrl: 'https://www.w3schools.com/html/horse.mp3',
    answerAudioUrl: 'https://www.w3schools.com/html/horse.mp3',
    passScore: DEFAULT_PASS_SCORE,
    maxAttempts: DEFAULT_MAX_ATTEMPTS
  },
  {
    id: 'l1-demo-2',
    title: 'Question 2',
    promptText: 'Listen carefully and repeat.',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    promptAudioUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
    answerAudioUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
    passScore: DEFAULT_PASS_SCORE,
    maxAttempts: DEFAULT_MAX_ATTEMPTS
  },
  {
    id: 'l1-demo-3',
    title: 'Question 3',
    promptText: 'Speak clearly and finish the challenge.',
    imageUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
    promptAudioUrl: 'https://www.w3schools.com/html/horse.mp3',
    answerAudioUrl: 'https://www.w3schools.com/html/horse.mp3',
    passScore: DEFAULT_PASS_SCORE,
    maxAttempts: DEFAULT_MAX_ATTEMPTS
  }
];

function toInt(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function normalizeMediaUrl(url) {
  const input = String(url || '').trim();
  if (!input) return '';
  if (/^https?:\/\//i.test(input)) return input;
  if (input.startsWith('//')) return `https:${input}`;
  if (input.startsWith('/')) {
    const mediaBase = apiService.getBaseUrl().replace(/\/api\/v1\/?$/, '');
    return `${mediaBase}${input}`;
  }
  return input;
}

function buildLessonLevel1Questions(selectedLesson) {
  if (!selectedLesson || !Array.isArray(selectedLesson.assets)) return [];

  const audios = selectedLesson.assets.filter((item) => String(item.type || '').toUpperCase() === 'AUDIO');
  if (!audios.length) return [];

  const cover = normalizeMediaUrl(selectedLesson.coverImageUrl);
  return audios.map((item, idx) => {
    const audioUrl = normalizeMediaUrl(item.url);
    return {
      id: item.id ? `l1-lesson-${item.id}` : `l1-lesson-${idx + 1}`,
      title: item.title || `Question ${idx + 1}`,
      promptText: `Question ${idx + 1}`,
      imageUrl: cover || DEFAULT_LEVEL1_QUESTIONS[idx % DEFAULT_LEVEL1_QUESTIONS.length].imageUrl,
      promptAudioUrl: audioUrl,
      answerAudioUrl: audioUrl,
      passScore: DEFAULT_PASS_SCORE,
      maxAttempts: DEFAULT_MAX_ATTEMPTS
    };
  });
}

function normalizeQuestionList(inputList) {
  if (!Array.isArray(inputList)) return [];
  return inputList.map((item, idx) => ({
    id: item.id || `l1-q-${idx + 1}`,
    title: item.title || `Question ${idx + 1}`,
    promptText: item.promptText || item.title || `Question ${idx + 1}`,
    imageUrl: normalizeMediaUrl(item.imageUrl) || DEFAULT_LEVEL1_QUESTIONS[idx % DEFAULT_LEVEL1_QUESTIONS.length].imageUrl,
    promptAudioUrl: normalizeMediaUrl(item.promptAudioUrl),
    answerAudioUrl: normalizeMediaUrl(item.answerAudioUrl || item.promptAudioUrl),
    passScore: toInt(item.passScore, DEFAULT_PASS_SCORE),
    maxAttempts: toInt(item.maxAttempts, DEFAULT_MAX_ATTEMPTS)
  }));
}

function getLevel1Questions(options = {}) {
  const selectedLesson = options.selectedLesson || wx.getStorageSync('selected_lesson') || null;
  const fromLesson = buildLessonLevel1Questions(selectedLesson);
  if (fromLesson.length) return fromLesson;

  const stored = wx.getStorageSync('level1_questions');
  const fromStorage = normalizeQuestionList(stored);
  if (fromStorage.length) return fromStorage;

  return normalizeQuestionList(DEFAULT_LEVEL1_QUESTIONS);
}

function gradeFromScore(score) {
  if (score >= 85) return { gradeKey: 'a', gradeLabel: 'A级 · 优秀' };
  if (score >= 70) return { gradeKey: 'b', gradeLabel: 'B级 · 通过' };
  return { gradeKey: 'c', gradeLabel: 'C级 · 待加强' };
}

function mockEvaluateByDuration(durationSec = 0) {
  const d = clamp(Number(durationSec || 0), 1, 12);
  const rhythmScore = 100 - Math.abs(d - 4.5) * 8;
  const base = 48 + rhythmScore * 0.45;
  const randomDelta = Math.floor(Math.random() * 10) - 4;
  const score = clamp(Math.round(base + randomDelta), 0, 100);
  const grade = gradeFromScore(score);
  return {
    score,
    gradeKey: grade.gradeKey,
    gradeLabel: grade.gradeLabel,
    source: 'mock'
  };
}

function resolveEvaluationUrl(rawUrl) {
  const input = String(rawUrl || '').trim();
  if (!input) return '';
  if (/^https?:\/\//i.test(input)) return input;
  if (input.startsWith('/')) {
    const base = apiService.getBaseUrl().replace(/\/api\/v1\/?$/, '');
    return `${base}${input}`;
  }
  return '';
}

function evaluateWithUploadApi(payload) {
  const url = resolveEvaluationUrl(wx.getStorageSync('level1_eval_upload_url'));
  if (!url) return Promise.resolve(null);
  if (!payload || !payload.filePath) return Promise.resolve(null);

  const token = wx.getStorageSync('user_token');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url,
      filePath: payload.filePath,
      name: 'audioFile',
      formData: {
        questionId: String(payload.questionId || ''),
        durationSec: String(payload.durationSec || 0)
      },
      header: headers,
      success: (res) => {
        try {
          const body = JSON.parse(res.data || '{}');
          if (res.statusCode >= 200 && res.statusCode < 300 && (body.code === 0 || body.score !== undefined)) {
            const score = clamp(
              Number((body.data && body.data.score) || body.score || 0),
              0,
              100
            );
            const grade = gradeFromScore(score);
            resolve({
              score,
              gradeKey: grade.gradeKey,
              gradeLabel: grade.gradeLabel,
              source: 'cloud',
              raw: body
            });
            return;
          }
          reject(new Error((body && body.message) || `http_${res.statusCode}`));
        } catch (err) {
          reject(err);
        }
      },
      fail: reject
    });
  });
}

async function evaluateLevel1Recording(payload = {}) {
  try {
    const cloud = await evaluateWithUploadApi(payload);
    if (cloud) return cloud;
  } catch (err) {
    console.warn('Cloud evaluation failed, fallback to mock:', err);
  }
  return mockEvaluateByDuration(payload.durationSec || 0);
}

module.exports = {
  DEFAULT_PASS_SCORE,
  DEFAULT_MAX_ATTEMPTS,
  getLevel1Questions,
  evaluateLevel1Recording,
  gradeFromScore
};
