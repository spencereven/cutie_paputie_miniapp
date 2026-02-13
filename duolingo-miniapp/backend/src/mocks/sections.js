const sections = [
  {
    id: 1,
    title: 'Section 1',
    subtitle: 'Basics',
    progress: 100,
    badgeIcon: '🚩',
    badgeText: '5 to 9',
    hasTopContent: false,
    topBgColor: 'blue',
    bubbleText: '',
    showCharacter: false,
    characterIcon: '🦉',
    jumpText: '',
    levels: [
      { id: 1, title: 'Level 1', subtitle: 'Intro', iconType: 'blue', iconContent: '⭐' },
      { id: 2, title: 'Level 2', subtitle: 'Greetings', iconType: 'blue', iconContent: '🎤' },
      { id: 3, title: 'Level 3', subtitle: 'Numbers', iconType: 'blue', iconContent: '⭐' }
    ]
  },
  {
    id: 2,
    title: 'Section 2',
    subtitle: 'Greetings',
    progress: 75,
    badgeIcon: '🚩',
    badgeText: '5 to 9',
    hasTopContent: true,
    topBgColor: 'purple',
    bubbleText: 'Section 2',
    showCharacter: false,
    characterIcon: '🦉',
    jumpText: '',
    levels: [
      { id: 1, title: 'Level 1', subtitle: 'Intro', iconType: 'purple', iconContent: '⭐' },
      { id: 2, title: 'Level 2', subtitle: 'Speaking', iconType: 'purple', iconContent: '🎤' },
      { id: 3, title: 'Level 3', subtitle: 'Practice', iconType: 'purple', iconContent: '⭐' }
    ]
  },
  {
    id: 3,
    title: 'Section 3',
    subtitle: 'Food & Drink',
    progress: 45,
    badgeIcon: '🚩',
    badgeText: '5 to 9',
    hasTopContent: true,
    topBgColor: 'orange',
    bubbleText: 'Section 3',
    showCharacter: true,
    characterIcon: '🦉',
    jumpText: 'JUMP HERE',
    levels: [
      { id: 1, title: 'Level 1', subtitle: 'Food basics', iconType: 'orange', iconContent: '⭐' },
      { id: 2, title: 'Level 2', subtitle: 'Ordering', iconType: 'orange', iconContent: '🎤' },
      { id: 3, title: 'Level 3', subtitle: 'Phrases', iconType: 'orange', iconContent: '⭐' }
    ]
  },
  {
    id: 4,
    title: 'Section 4',
    subtitle: 'Numbers',
    progress: 0,
    badgeIcon: '',
    badgeText: 'Locked',
    hasTopContent: false,
    topBgColor: 'blue',
    bubbleText: '',
    showCharacter: false,
    characterIcon: '🦉',
    jumpText: '',
    levels: []
  },
  {
    id: 5,
    title: 'Section 5',
    subtitle: 'Colors',
    progress: 0,
    badgeIcon: '',
    badgeText: 'Locked',
    hasTopContent: false,
    topBgColor: 'blue',
    bubbleText: '',
    showCharacter: false,
    characterIcon: '🦉',
    jumpText: '',
    levels: []
  },
  {
    id: 6,
    title: 'Section 6',
    subtitle: 'Animals',
    progress: 0,
    badgeIcon: '',
    badgeText: 'Locked',
    hasTopContent: false,
    topBgColor: 'blue',
    bubbleText: '',
    showCharacter: false,
    characterIcon: '🦉',
    jumpText: '',
    levels: []
  }
];

module.exports = sections;
