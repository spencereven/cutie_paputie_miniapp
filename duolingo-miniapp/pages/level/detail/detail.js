const level1Service = require('../../../services/level1');

function toInt(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

function formatTime(seconds) {
  const sec = Math.max(0, Math.floor(Number(seconds || 0)));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

Page({
  data: {
    levelId: 1,

    // Level 1
    level1Questions: [],
    level1QuestionIndex: 0,
    level1QuestionTotal: 0,
    level1QuestionTotalDisplay: 1,
    level1QuestionTitle: '',
    level1PromptText: '',
    level1ImageUrl: '',
    level1PromptAudioUrl: '',
    level1AnswerAudioUrl: '',
    level1MaxAttempts: 2,
    level1PassScore: 70,
    level1AttemptsUsed: 0,
    level1IsPlayingPrompt: false,
    level1PromptProgress: 0,
    level1PromptCurrentText: '0:00',
    level1PromptDurationText: '0:00',
    level1IsPlayingAnswer: false,
    level1AnswerPlayed: false,
    level1IsRecording: false,
    level1RecordSeconds: 0,
    level1RecordingFilePath: '',
    level1HasRecording: false,
    level1Submitting: false,
    level1PassAchieved: false,
    level1BestScore: 0,
    level1Result: null,
    level1CanGoNext: false,

    // Level 3
    level3PromptText: 'Listen to the audio and repeat it clearly.',
    level3RecordLabel: '按住录音进行复述',
    level3NoteText: '注意语速和重音，尽量贴近原音。',
    isRecording: false,
    recordButtonLabel: 'Record',

    // Level 2
    videoImageUrl: 'https://via.placeholder.com/390x220/FFB6C1/FFFFFF?text=Video+Frame',
    videoProgress: 33,
    videoCurrentTime: '00:04',
    videoDuration: '01:05',
    currentSentenceIndex: 1,
    totalSentences: 13,
    sentenceCards: [
      { id: 1, enText: 'With every year, machines surpass', zhText: '每年 机器逐渐在一些我们以前认为的', speed: '慢', progress: 52, duration: '4.85s', isActive: true, isAnswered: false },
      { id: 2, enText: 'humans in more and more activities', zhText: '只有人类可以做的事情中超越人类', speed: '慢', progress: 0, duration: '2.35s', isActive: false, isAnswered: false },
      { id: 3, enText: 'we once thought only we were capable of.', zhText: '我们曾经认为只有人类才能做的事', speed: '慢', progress: 0, duration: '3.12s', isActive: false, isAnswered: false },
      { id: 4, enText: 'This is a remarkable achievement', zhText: '这是一个了不起的成就', speed: '慢', progress: 0, duration: '2.95s', isActive: false, isAnswered: false },
      { id: 5, enText: 'in the field of artificial intelligence', zhText: '在人工智能领域', speed: '慢', progress: 0, duration: '3.45s', isActive: false, isAnswered: false },
      { id: 6, enText: 'Technology continues to evolve', zhText: '技术不断进化', speed: '慢', progress: 0, duration: '2.78s', isActive: false, isAnswered: false },
      { id: 7, enText: 'and reshape our understanding', zhText: '并改变我们的理解', speed: '慢', progress: 0, duration: '2.88s', isActive: false, isAnswered: false },
      { id: 8, enText: 'of what is possible', zhText: '关于什么是可能的', speed: '慢', progress: 0, duration: '2.15s', isActive: false, isAnswered: false },
      { id: 9, enText: 'The future holds many opportunities', zhText: '未来有很多机会', speed: '慢', progress: 0, duration: '3.22s', isActive: false, isAnswered: false },
      { id: 10, enText: 'for innovation and growth', zhText: '用于创新和增长', speed: '慢', progress: 0, duration: '2.95s', isActive: false, isAnswered: false },
      { id: 11, enText: 'We must adapt and learn', zhText: '我们必须适应和学习', speed: '慢', progress: 0, duration: '2.65s', isActive: false, isAnswered: false },
      { id: 12, enText: 'to leverage these new technologies', zhText: '以利用这些新技术', speed: '慢', progress: 0, duration: '3.05s', isActive: false, isAnswered: false },
      { id: 13, enText: 'for the benefit of humanity.', zhText: '造福人类', speed: '慢', progress: 0, duration: '2.55s', isActive: false, isAnswered: false }
    ]
  },

  onLoad(options) {
    const app = getApp();
    if (!app.ensureAuthForPage('pages/level/detail/detail')) return;

    const levelId = toInt(options.id, 1);
    this.setData({ levelId });

    if (levelId === 1) {
      this.initializeLevel1();
      return;
    }
    if (levelId === 2) {
      this.initializeVideo();
      return;
    }
    this.initializeAudio();
  },

  onHide() {
    this.stopLevel1PromptAudio();
    this.stopLevel1AnswerAudio();
  },

  onUnload() {
    this.cleanupLevel1Runtime();
  },

  initializeAudio() {
    console.log('Audio initialized for level', this.data.levelId);
  },

  initializeVideo() {
    console.log('Video initialized for level 2');
  },

  initializeLevel1() {
    this.setupLevel1Recorder();
    const questions = level1Service.getLevel1Questions();
    this.setData({
      level1Questions: Array.isArray(questions) ? questions : [],
      level1QuestionTotal: Array.isArray(questions) ? questions.length : 0,
      level1QuestionTotalDisplay: Math.max(1, Array.isArray(questions) ? questions.length : 0)
    });

    if (!questions || questions.length === 0) {
      this.setData({
        level1QuestionTitle: 'No question',
        level1PromptText: '暂无可用题目，请先配置题库',
        level1CanGoNext: false
      });
      return;
    }
    this.applyLevel1Question(0);
  },

  setupLevel1Recorder() {
    if (this.level1RecorderReady) return;
    const recorder = wx.getRecorderManager();
    this.level1Recorder = recorder;

    recorder.onStart(() => {
      this.setData({
        level1IsRecording: true,
        level1RecordSeconds: 0,
        level1HasRecording: false,
        level1RecordingFilePath: '',
        level1Result: null,
        level1CanGoNext: false
      });
      this.startLevel1RecordTimer();
    });

    recorder.onStop((res) => {
      this.clearLevel1RecordTimer();
      const sec = Math.max(1, Math.round(Number((res && res.duration) || 0) / 1000));
      this.setData({
        level1IsRecording: false,
        level1HasRecording: !!(res && res.tempFilePath),
        level1RecordingFilePath: (res && res.tempFilePath) || '',
        level1RecordSeconds: sec
      });
    });

    recorder.onError((err) => {
      this.clearLevel1RecordTimer();
      this.setData({
        level1IsRecording: false
      });
      console.error('Level1 recorder error:', err);
      wx.showToast({
        title: '录音失败，请重试',
        icon: 'none'
      });
    });

    this.level1RecorderReady = true;
  },

  startLevel1RecordTimer() {
    this.clearLevel1RecordTimer();
    this.level1RecordTimer = setInterval(() => {
      if (!this.data.level1IsRecording) {
        this.clearLevel1RecordTimer();
        return;
      }
      this.setData({
        level1RecordSeconds: this.data.level1RecordSeconds + 1
      });
    }, 1000);
  },

  clearLevel1RecordTimer() {
    if (this.level1RecordTimer) {
      clearInterval(this.level1RecordTimer);
      this.level1RecordTimer = null;
    }
  },

  ensureLevel1PromptAudio() {
    if (this.level1PromptAudio) return this.level1PromptAudio;
    const audio = wx.createInnerAudioContext();
    audio.obeyMuteSwitch = false;

    audio.onCanplay(() => {
      const total = Number(audio.duration || 0);
      if (total > 0) {
        this.setData({
          level1PromptDurationText: formatTime(total)
        });
      }
    });
    audio.onTimeUpdate(() => {
      const current = Number(audio.currentTime || 0);
      const total = Number(audio.duration || 0);
      const progress = total > 0 ? (current / total) * 100 : 0;
      this.setData({
        level1PromptCurrentText: formatTime(current),
        level1PromptDurationText: formatTime(total),
        level1PromptProgress: Math.max(0, Math.min(100, progress))
      });
    });
    audio.onPlay(() => {
      this.setData({ level1IsPlayingPrompt: true });
    });
    audio.onPause(() => {
      this.setData({ level1IsPlayingPrompt: false });
    });
    audio.onEnded(() => {
      this.setData({
        level1IsPlayingPrompt: false,
        level1PromptProgress: 100
      });
    });
    audio.onError((err) => {
      console.error('Level1 prompt audio error:', err);
      this.setData({ level1IsPlayingPrompt: false });
      wx.showToast({
        title: '题目音频播放失败',
        icon: 'none'
      });
    });

    this.level1PromptAudio = audio;
    return audio;
  },

  ensureLevel1AnswerAudio() {
    if (this.level1AnswerAudio) return this.level1AnswerAudio;
    const audio = wx.createInnerAudioContext();
    audio.obeyMuteSwitch = false;

    audio.onPlay(() => {
      this.setData({
        level1IsPlayingAnswer: true,
        level1AnswerPlayed: true
      });
    });
    audio.onPause(() => {
      this.setData({ level1IsPlayingAnswer: false });
    });
    audio.onEnded(() => {
      this.setData({ level1IsPlayingAnswer: false });
    });
    audio.onError((err) => {
      console.error('Level1 answer audio error:', err);
      this.setData({ level1IsPlayingAnswer: false });
      wx.showToast({
        title: '答案音频播放失败',
        icon: 'none'
      });
    });

    this.level1AnswerAudio = audio;
    return audio;
  },

  stopLevel1PromptAudio() {
    if (!this.level1PromptAudio) return;
    try {
      this.level1PromptAudio.pause();
      this.level1PromptAudio.stop();
    } catch (err) {
      console.warn('Stop prompt audio failed:', err);
    }
    this.setData({
      level1IsPlayingPrompt: false
    });
  },

  stopLevel1AnswerAudio() {
    if (!this.level1AnswerAudio) return;
    try {
      this.level1AnswerAudio.pause();
      this.level1AnswerAudio.stop();
    } catch (err) {
      console.warn('Stop answer audio failed:', err);
    }
    this.setData({
      level1IsPlayingAnswer: false
    });
  },

  cleanupLevel1Runtime() {
    this.clearLevel1RecordTimer();
    this.stopLevel1PromptAudio();
    this.stopLevel1AnswerAudio();

    if (this.level1PromptAudio) {
      try {
        this.level1PromptAudio.destroy();
      } catch (err) {
        console.warn('Destroy prompt audio failed:', err);
      }
      this.level1PromptAudio = null;
    }
    if (this.level1AnswerAudio) {
      try {
        this.level1AnswerAudio.destroy();
      } catch (err) {
        console.warn('Destroy answer audio failed:', err);
      }
      this.level1AnswerAudio = null;
    }
    if (this.level1Recorder && this.data.level1IsRecording) {
      try {
        this.level1Recorder.stop();
      } catch (err) {
        console.warn('Stop recorder failed:', err);
      }
    }
  },

  applyLevel1Question(index) {
    const list = this.data.level1Questions || [];
    const question = list[index];
    if (!question) return;

    this.stopLevel1PromptAudio();
    this.stopLevel1AnswerAudio();

    this.setData({
      level1QuestionIndex: index,
      level1QuestionTitle: question.title || `Question ${index + 1}`,
      level1PromptText: question.promptText || '',
      level1ImageUrl: question.imageUrl || '',
      level1PromptAudioUrl: question.promptAudioUrl || '',
      level1AnswerAudioUrl: question.answerAudioUrl || '',
      level1MaxAttempts: Math.max(1, toInt(question.maxAttempts, 2)),
      level1PassScore: toInt(question.passScore, 70),
      level1AttemptsUsed: 0,
      level1IsPlayingPrompt: false,
      level1PromptProgress: 0,
      level1PromptCurrentText: '0:00',
      level1PromptDurationText: '0:00',
      level1IsPlayingAnswer: false,
      level1AnswerPlayed: false,
      level1IsRecording: false,
      level1RecordSeconds: 0,
      level1RecordingFilePath: '',
      level1HasRecording: false,
      level1Submitting: false,
      level1PassAchieved: false,
      level1BestScore: 0,
      level1Result: null,
      level1CanGoNext: false
    });
  },

  toggleLevel1PromptAudio() {
    const url = String(this.data.level1PromptAudioUrl || '').trim();
    if (!url) {
      wx.showToast({
        title: '当前题目未配置音频',
        icon: 'none'
      });
      return;
    }

    this.stopLevel1AnswerAudio();
    const audio = this.ensureLevel1PromptAudio();
    if (this.data.level1IsPlayingPrompt) {
      audio.pause();
      return;
    }
    if (audio.src !== url) {
      audio.src = url;
      this.setData({
        level1PromptProgress: 0,
        level1PromptCurrentText: '0:00',
        level1PromptDurationText: '0:00'
      });
    }
    audio.play();
  },

  toggleLevel1AnswerAudio() {
    const url = String(this.data.level1AnswerAudioUrl || '').trim();
    if (!url) {
      wx.showToast({
        title: '当前题目未配置答案音频',
        icon: 'none'
      });
      return;
    }

    this.stopLevel1PromptAudio();
    const audio = this.ensureLevel1AnswerAudio();
    if (this.data.level1IsPlayingAnswer) {
      audio.pause();
      return;
    }
    if (audio.src !== url) {
      audio.src = url;
    }
    audio.play();
  },

  toggleLevel1Recording() {
    if (this.data.level1Submitting) return;

    if (this.data.level1IsRecording) {
      if (this.level1Recorder) this.level1Recorder.stop();
      return;
    }

    const attemptsExhausted = !this.data.level1PassAchieved && this.data.level1AttemptsUsed >= this.data.level1MaxAttempts;
    if (attemptsExhausted) {
      wx.showToast({
        title: '已达到最大尝试次数',
        icon: 'none'
      });
      return;
    }

    this.stopLevel1PromptAudio();
    this.stopLevel1AnswerAudio();
    this.setData({
      level1Result: null,
      level1CanGoNext: this.data.level1PassAchieved
    });

    try {
      if (this.level1Recorder) {
        this.level1Recorder.start({
          duration: 60000,
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 96000,
          format: 'mp3'
        });
      }
    } catch (err) {
      console.error('Start recorder failed:', err);
      wx.showToast({
        title: '无法开始录音',
        icon: 'none'
      });
    }
  },

  handleLevel1Rerecord() {
    if (this.data.level1Submitting || this.data.level1IsRecording) return;

    const attemptsExhausted = !this.data.level1PassAchieved && this.data.level1AttemptsUsed >= this.data.level1MaxAttempts;
    if (attemptsExhausted) {
      wx.showToast({
        title: '已达到最大尝试次数',
        icon: 'none'
      });
      return;
    }

    this.setData({
      level1HasRecording: false,
      level1RecordingFilePath: '',
      level1RecordSeconds: 0,
      level1Result: null,
      level1CanGoNext: this.data.level1PassAchieved
    });
    wx.showToast({
      title: '已清除，重新录制',
      icon: 'none'
    });
  },

  async handleLevel1Submit() {
    if (this.data.level1Submitting || this.data.level1IsRecording) return;
    if (!this.data.level1HasRecording || !this.data.level1RecordingFilePath) {
      wx.showToast({
        title: '请先录音',
        icon: 'none'
      });
      return;
    }
    if (!this.data.level1PassAchieved && this.data.level1AttemptsUsed >= this.data.level1MaxAttempts) {
      wx.showToast({
        title: '已达到最大尝试次数',
        icon: 'none'
      });
      return;
    }

    const question = this.data.level1Questions[this.data.level1QuestionIndex];
    if (!question) return;

    const nextAttempt = this.data.level1AttemptsUsed + 1;
    const passScore = this.data.level1PassScore;

    this.setData({
      level1Submitting: true,
      level1AttemptsUsed: nextAttempt
    });

    try {
      const result = await level1Service.evaluateLevel1Recording({
        questionId: question.id,
        filePath: this.data.level1RecordingFilePath,
        durationSec: this.data.level1RecordSeconds,
        attempt: nextAttempt
      });

      const score = toInt(result && result.score, 0);
      const currentGrade = level1Service.gradeFromScore(score);
      const passThisTime = score >= passScore;
      const passAchieved = this.data.level1PassAchieved || passThisTime;
      const bestScore = Math.max(this.data.level1BestScore || 0, score);
      const outOfAttempts = !passAchieved && nextAttempt >= this.data.level1MaxAttempts;

      let message = '';
      if (passAchieved) {
        message = `达到通关分 ${passScore}，可进入下一题`;
      } else if (outOfAttempts) {
        message = '分数未达标，先听老师答案并跟读后进入下一题';
      } else {
        message = `未达通关分 ${passScore}，你还可以再录 ${this.data.level1MaxAttempts - nextAttempt} 次`;
      }

      this.setData({
        level1PassAchieved: passAchieved,
        level1BestScore: bestScore,
        level1Result: {
          score,
          gradeKey: currentGrade.gradeKey,
          gradeLabel: currentGrade.gradeLabel,
          pass: passThisTime,
          source: result && result.source ? result.source : 'mock',
          message
        },
        level1CanGoNext: passAchieved || outOfAttempts
      });
    } catch (err) {
      console.error('Submit Level1 recording failed:', err);
      wx.showToast({
        title: '评分失败，请重试',
        icon: 'none'
      });
      this.setData({
        level1AttemptsUsed: this.data.level1AttemptsUsed - 1
      });
    } finally {
      this.setData({
        level1Submitting: false
      });
    }
  },

  goLevel1Next() {
    if (!this.data.level1CanGoNext) return;

    if (!this.data.level1PassAchieved && !this.data.level1AnswerPlayed) {
      wx.showToast({
        title: '请先播放答案音频并跟读',
        icon: 'none'
      });
      return;
    }

    const nextIndex = this.data.level1QuestionIndex + 1;
    if (nextIndex >= this.data.level1QuestionTotal) {
      wx.showModal({
        title: 'Level 1 完成',
        content: '已完成当前关卡，是否返回上一页？',
        confirmText: '返回',
        cancelText: '继续查看',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack({ delta: 1 });
          }
        }
      });
      return;
    }

    this.applyLevel1Question(nextIndex);
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 200
    });
  },

  // ===== Level 2 =====
  selectSentence(e) {
    const index = toInt(e.currentTarget.dataset.index, 0);
    const updatedCards = this.data.sentenceCards.map((item, i) => ({
      ...item,
      isActive: i === index
    }));

    this.setData({
      sentenceCards: updatedCards,
      currentSentenceIndex: index + 1
    });

    setTimeout(() => {
      const progressCards = updatedCards.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          progress: Math.min(item.progress + 30, 100)
        };
      });
      this.setData({
        sentenceCards: progressCards
      });
    }, 300);
  },

  recordSentence(e) {
    const index = toInt(e.currentTarget.dataset.index, 0);
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

    const updatedCards = this.data.sentenceCards.map((item, i) => {
      if (i !== index) return item;
      return {
        ...item,
        isAnswered: !item.isAnswered
      };
    });

    this.setData({
      sentenceCards: updatedCards
    });

    const isAnswering = !this.data.sentenceCards[index].isAnswered;
    wx.showToast({
      title: isAnswering ? 'Recording...' : 'Recording saved',
      icon: 'none',
      duration: 1000
    });

    if (isAnswering) {
      setTimeout(() => {
        const completedCards = updatedCards.map((item, i) => {
          if (i !== index) return item;
          return {
            ...item,
            isAnswered: true
          };
        });
        this.setData({
          sentenceCards: completedCards
        });
      }, 2000);
    }
  },

  // ===== Level 3 =====
  toggleRecording() {
    const isRecording = !this.data.isRecording;
    this.setData({
      isRecording,
      recordButtonLabel: isRecording ? 'Recording...' : 'Record'
    });
  },

  handleBack() {
    this.cleanupLevel1Runtime();
    if (this.data.isRecording) {
      this.setData({
        isRecording: false,
        recordButtonLabel: 'Record'
      });
    }
    wx.navigateBack({
      delta: 1
    });
  }
});
