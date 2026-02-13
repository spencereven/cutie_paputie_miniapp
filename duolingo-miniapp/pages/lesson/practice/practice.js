// Practice Mode

Page({
  data: {
    levelId: 1,
    currentRound: 1,
    totalRounds: 10,
    userAnswer: '',
    selectedOption: -1,
    isRecording: false,
    currentExercise: {},
    exercises: [
      {
        type: 'Translation',
        icon: '📝',
        instruction: 'Translate to Spanish:',
        original: 'Good morning',
        answer: 'buenos días',
        options: []
      },
      {
        type: 'Multiple Choice',
        icon: '✓',
        instruction: 'Select the correct translation:',
        original: 'I am happy',
        options: ['Soy triste', 'Soy feliz', 'Soy cansado', 'Soy enfermo'],
        answer: 1
      },
      {
        type: 'Listening',
        icon: '🎧',
        instruction: 'What did you hear?',
        original: 'hola',
        options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
        answer: 0
      },
      {
        type: 'Speaking',
        icon: '🎤',
        instruction: 'Speak this phrase:',
        original: 'Me llamo Juan',
        options: []
      },
      {
        type: 'Translation',
        icon: '📝',
        instruction: 'Translate to Spanish:',
        original: 'How are you?',
        answer: '¿Cómo estás?',
        options: []
      }
    ]
  },

  onLoad(options) {
    const app = getApp();
    if (!app.ensureAuthForPage('pages/lesson/practice/practice')) return;

    console.log('Practice mode loaded with options:', options);
    
    const levelId = options.levelId || 1;
    this.setData({ 
      levelId: parseInt(levelId),
      currentExercise: this.data.exercises[0]
    });
  },

  /**
   * 处理答案输入
   */
  handleAnswerInput(e) {
    this.setData({ userAnswer: e.detail.value });
  },

  /**
   * 选择选项
   */
  handleOptionSelect(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ selectedOption: index });
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
  },

  /**
   * 开始录音
   */
  handleRecord() {
    this.setData({ isRecording: !this.data.isRecording });

    if (this.data.isRecording) {
      wx.showToast({
        title: 'Recording started...',
        icon: 'none',
        duration: 1000
      });
    } else {
      wx.showToast({
        title: 'Recording complete!',
        icon: 'success',
        duration: 1000
      });
    }
  },

  /**
   * 提交答案
   */
  handleSubmit() {
    const exercise = this.data.currentExercise;
    let isCorrect = false;

    // 检查答案
    if (exercise.type === 'Translation') {
      isCorrect = this.data.userAnswer.toLowerCase().trim() === exercise.answer.toLowerCase();
    } else if (exercise.type === 'Multiple Choice' || exercise.type === 'Listening') {
      isCorrect = this.data.selectedOption === exercise.answer;
    } else if (exercise.type === 'Speaking') {
      // 发音练习假设正确
      isCorrect = true;
    }

    if (this.data.currentRound >= this.data.totalRounds) {
      // 最后一轮，显示完成信息
      wx.showModal({
        title: '练习完成！',
        content: '很好的练习！',
        confirmText: '继续',
        success: () => {
          wx.navigateBack({ delta: 1 });
        }
      });
    } else {
      // 下一轮
      this.nextRound();
    }
  },

  /**
   * 下一轮
   */
  nextRound() {
    const nextRound = this.data.currentRound + 1;
    const nextExerciseIndex = (nextRound - 1) % this.data.exercises.length;

    this.setData({
      currentRound: nextRound,
      currentExercise: this.data.exercises[nextExerciseIndex],
      userAnswer: '',
      selectedOption: -1,
      isRecording: false
    });

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  /**
   * 跳过
   */
  handleSkip() {
    this.nextRound();
  },

  /**
   * 退出
   */
  handleQuit() {
    wx.showModal({
      title: '退出练习?',
      content: '进度不会被保存',
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack({ delta: 1 });
        }
      }
    });
  }
});
