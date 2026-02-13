// Interactive Lesson Player

Page({
  data: {
    levelId: 1,
    currentQuestion: 0,
    totalQuestions: 5,
    selectedAnswer: -1,
    answered: false,
    isCorrect: false,
    feedbackMessage: '',
    isLast: false,
    correctAnswers: 0,
    lessons: [
      {
        question: 'What does "Hola" mean?',
        hint: 'A common greeting',
        audioUrl: 'hola.mp3',
        options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
        correctAnswer: 0
      },
      {
        question: 'Select the correct translation: "Good morning"',
        hint: 'Start with "Buenos"',
        audioUrl: 'buenos_dias.mp3',
        options: ['Buenas noches', 'Buenos días', 'Buenas tardes', 'Buen día'],
        correctAnswer: 1
      },
      {
        question: 'What is the Spanish word for "water"?',
        hint: 'Starts with "A"',
        audioUrl: 'agua.mp3',
        options: ['Arena', 'Abrigo', 'Agua', 'Amigo'],
        correctAnswer: 2
      },
      {
        question: 'How do you say "My name is..."?',
        hint: 'Use "Me llamo"',
        audioUrl: 'me_llamo.mp3',
        options: ['Soy llama', 'Me llamo', 'Mi nombre', 'Yo soy'],
        correctAnswer: 1
      },
      {
        question: 'What does "Gracias" mean?',
        hint: 'An expression of gratitude',
        audioUrl: 'gracias.mp3',
        options: ['Please', 'Thank you', 'Excuse me', 'You\'re welcome'],
        correctAnswer: 1
      }
    ],
    currentLesson: {}
  },

  onLoad(options) {
    const app = getApp();
    if (!app.ensureAuthForPage('pages/lesson/interactive/interactive')) return;

    console.log('Interactive lesson loaded with options:', options);

    const levelId = options.levelId || 1;
    const totalQuestions = this.data.lessons.length;
    this.setData({ 
      levelId: parseInt(levelId),
      currentLesson: this.data.lessons[0],
      totalQuestions,
      isLast: totalQuestions <= 1
    });
  },

  /**
   * 播放音频
   */
  handlePlayAudio() {
    wx.showToast({
      title: 'Playing audio...',
      icon: 'none',
      duration: 1000
    });
    // 实际应该使用 wx.playVoice() 或 <audio> 标签
  },

  /**
   * 选择答案
   */
  handleSelectAnswer(e) {
    const index = e.currentTarget.dataset.index;
    const isCorrect = index === this.data.currentLesson.correctAnswer;

    this.setData({
      selectedAnswer: index,
      answered: true,
      isCorrect: isCorrect,
      feedbackMessage: isCorrect 
        ? '你答对了！' 
        : '不对，再试一次吧。',
      correctAnswers: isCorrect ? this.data.correctAnswers + 1 : this.data.correctAnswers
    });
  },

  /**
   * 跳过问题
   */
  handleSkip() {
    this.goToNext();
  },

  /**
   * 下一题
   */
  handleNext() {
    this.goToNext();
  },

  /**
   * 转到下一问题
   */
  goToNext() {
    const nextQuestion = this.data.currentQuestion + 1;

    // 已到最后一题后继续前进时，直接完成课程，避免数组越界
    if (nextQuestion >= this.data.totalQuestions) {
      this.handleFinish();
      return;
    }

    this.setData({
      currentQuestion: nextQuestion,
      currentLesson: this.data.lessons[nextQuestion],
      isLast: nextQuestion === this.data.totalQuestions - 1,
      selectedAnswer: -1,
      answered: false,
      isCorrect: false,
      feedbackMessage: ''
    });
  },

  /**
   * 完成课程
   */
  handleFinish() {
    const correctPercentage = Math.round((this.data.correctAnswers / this.data.totalQuestions) * 100);
    const stars = correctPercentage >= 80 ? 3 : correctPercentage >= 50 ? 2 : 1;

    wx.showModal({
      title: '课程完成！',
      content: `正确率: ${correctPercentage}%\n获得星数: ${stars}⭐`,
      confirmText: '继续',
      success: (res) => {
        if (res.confirm) {
          // 返回关卡详情页
          wx.navigateBack({
            delta: 1
          });
        }
      }
    });
  },

  /**
   * 退出课程
   */
  handleQuit() {
    wx.showModal({
      title: '退出课程?',
      content: '进度不会被保存',
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack({
            delta: 1
          });
        }
      }
    });
  }
});
