const AVATAR_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#F9CA24',
  '#A29BFE',
  '#6C5CE7',
  '#00B894',
  '#FDCB6E',
  '#E17055',
  '#0984E3',
  '#2D3436',
  '#D63031',
  '#00CEC9',
  '#74B9FF',
  '#E84393'
];

const NAME_POOL = [
  'Alex Chen',
  'Jessica Lee',
  'Marco Rossi',
  'Emma Wilson',
  'David Park',
  'Sophie Martin',
  'Luis Garcia',
  'Nina Singh',
  'Tom Brown',
  'Lisa Anderson',
  'Oscar Martinez',
  'Petra Mueller',
  'Ryan Murphy',
  'Yuki Tanaka',
  'Anna Kowalski',
  'Mia Johnson',
  'Noah Davis',
  'Lucas Miller',
  'Ava Thompson',
  'Ethan Clark'
];

function toInitial(name) {
  return String(name || '').trim().slice(0, 1).toUpperCase() || 'U';
}

function buildRanking({ size, startHours, stepHours }) {
  return Array.from({ length: size }, (_, idx) => {
    const name = NAME_POOL[idx % NAME_POOL.length];
    return {
      id: idx + 1,
      rank: idx + 1,
      name,
      initial: toInitial(name),
      level: Math.max(1, 45 - idx),
      studyHours: Math.max(1, startHours - idx * stepHours),
      avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length]
    };
  });
}

module.exports = {
  class: buildRanking({
    size: 12,
    startHours: 285,
    stepHours: 7
  }),
  campus: buildRanking({
    size: 15,
    startHours: 320,
    stepHours: 8
  }),
  national: buildRanking({
    size: 20,
    startHours: 360,
    stepHours: 9
  })
};
