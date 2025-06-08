const KEYS = {
  USER_INFO: 'userInfo',
  WEIGHT_RECORDS: 'weightRecords',
  DIET_RECORDS: 'dietRecords',
  EXERCISE_RECORDS: 'exerciseRecords',
  GOALS: 'goals',
  SETTINGS: 'settings',
  EXERCISE_TYPES: 'exerciseTypes'
}

// 运动提醒相关
const EXERCISE_REMINDERS_KEY = 'exercise_reminders';

// 运动计划相关
const EXERCISE_PLANS_KEY = 'exercise_plans';

// 用户信息相关
const USER_INFO_KEY = 'user_info';
const USER_ID_KEY = 'user_id';
const START_WEIGHT_KEY = 'start_weight';

// 导出历史相关
const EXPORT_HISTORY_KEY = 'export_history';

// 设置相关
const SETTINGS_KEY = 'settings';

// 社交功能相关常量
const FRIENDS_KEY = 'friends';
const RANKINGS_KEY = 'rankings';
const MOMENTS_KEY = 'moments';
const CHAT_MESSAGES_KEY = 'chat_messages';

// 保存数据
const saveData = (key, data) => {
  try {
    wx.setStorageSync(key, data)
    return true
  } catch (e) {
    console.error('保存数据失败：', e)
    return false
  }
}

// 获取数据
const getData = (key) => {
  try {
    return wx.getStorageSync(key)
  } catch (e) {
    console.error('获取数据失败：', e)
    return null
  }
}

// 删除数据
const removeData = (key) => {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('删除数据失败：', e)
    return false
  }
}

// 清空所有数据
const clearAllData = () => {
  try {
    wx.clearStorageSync()
    return true
  } catch (e) {
    console.error('清空数据失败：', e)
    return false
  }
}

// 保存体重记录
const saveWeightRecord = (record) => {
  const records = getData(KEYS.WEIGHT_RECORDS) || []
  records.push({
    ...record,
    id: Date.now().toString(),
    date: new Date().toISOString()
  })
  return saveData(KEYS.WEIGHT_RECORDS, records)
}

// 保存饮食记录
const saveDietRecord = (record) => {
  const records = getData(KEYS.DIET_RECORDS) || []
  records.push({
    ...record,
    id: Date.now().toString(),
    date: new Date().toISOString()
  })
  return saveData(KEYS.DIET_RECORDS, records)
}

// 保存运动记录
const saveExerciseRecord = (record) => {
  const records = getData(KEYS.EXERCISE_RECORDS) || []
  records.push({
    ...record,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  })
  return saveData(KEYS.EXERCISE_RECORDS, records)
}

// 保存目标
const saveGoal = (goal) => {
  const goals = getData(KEYS.GOALS) || []
  goals.push({
    ...goal,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  })
  return saveData(KEYS.GOALS, goals)
}

// 获取指定日期的记录
const getRecordsByDate = (key, date) => {
  const records = getData(key) || []
  return records.filter(record => record.date.startsWith(date))
}

// 获取日期范围内的记录
const getRecordsByDateRange = (key, startDate, endDate) => {
  const records = getData(key) || []
  return records.filter(record => {
    const recordDate = record.date.split('T')[0]
    return recordDate >= startDate && recordDate <= endDate
  })
}

// 删除记录
const deleteRecord = (key, recordId) => {
  const records = getData(key) || []
  const newRecords = records.filter(record => record.id !== recordId)
  return saveData(key, newRecords)
}

// 获取运动记录统计
const getExerciseStats = (date) => {
  const records = getRecordsByDate(KEYS.EXERCISE_RECORDS, date)
  const stats = {
    totalDuration: 0,
    totalCalories: 0,
    typeStats: {}
  }

  records.forEach(record => {
    stats.totalDuration += record.duration
    stats.totalCalories += record.calories
    
    if (!stats.typeStats[record.type]) {
      stats.typeStats[record.type] = {
        count: 0,
        totalDuration: 0,
        totalCalories: 0
      }
    }
    
    stats.typeStats[record.type].count++
    stats.typeStats[record.type].totalDuration += record.duration
    stats.typeStats[record.type].totalCalories += record.calories
  })

  return stats
}

// 获取运动类型列表
const getExerciseTypes = () => {
  return getData(KEYS.EXERCISE_TYPES) || []
}

// 保存自定义运动类型
const saveExerciseType = (type) => {
  const types = getExerciseTypes()
  if (!types.includes(type)) {
    types.push(type)
    return saveData(KEYS.EXERCISE_TYPES, types)
  }
  return true
}

// 删除自定义运动类型
const deleteExerciseType = (type) => {
  const types = getExerciseTypes()
  const newTypes = types.filter(t => t !== type)
  return saveData(KEYS.EXERCISE_TYPES, newTypes)
}

// 获取运动记录趋势
const getExerciseTrend = (days = 7) => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)
  
  const records = getRecordsByDateRange(KEYS.EXERCISE_RECORDS, 
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  )

  const trend = {}
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    trend[dateStr] = {
      totalDuration: 0,
      totalCalories: 0
    }
  }

  records.forEach(record => {
    const date = record.date.split('T')[0]
    if (trend[date]) {
      trend[date].totalDuration += record.duration
      trend[date].totalCalories += record.calories
    }
  })

  return trend
}

const getExerciseReminders = () => {
  return wx.getStorageSync(EXERCISE_REMINDERS_KEY) || [];
};

const setExerciseReminders = (reminders) => {
  wx.setStorageSync(EXERCISE_REMINDERS_KEY, reminders);
};

const getExercisePlans = () => {
  return wx.getStorageSync(EXERCISE_PLANS_KEY) || [];
};

const setExercisePlans = (plans) => {
  wx.setStorageSync(EXERCISE_PLANS_KEY, plans);
};

const getUserInfo = () => {
  return wx.getStorageSync(USER_INFO_KEY) || {};
};

const setUserInfo = (userInfo) => {
  wx.setStorageSync(USER_INFO_KEY, userInfo);
};

const getUserId = () => {
  return wx.getStorageSync(USER_ID_KEY) || '';
};

const setUserId = (userId) => {
  wx.setStorageSync(USER_ID_KEY, userId);
};

const getStartWeight = () => {
  return wx.getStorageSync(START_WEIGHT_KEY) || 0;
};

const setStartWeight = (weight) => {
  wx.setStorageSync(START_WEIGHT_KEY, weight);
};

const getGoals = () => {
  return wx.getStorageSync(KEYS.GOALS) || {
    weight: 0,
    weeklyExercise: 0,
    dailyCalories: 0
  };
};

const setGoals = (goals) => {
  wx.setStorageSync(KEYS.GOALS, goals);
};

const getAchievements = () => {
  return wx.getStorageSync(KEYS.GOALS) || [];
};

const setAchievements = (achievements) => {
  wx.setStorageSync(KEYS.GOALS, achievements);
};

function getExportHistory() {
  return wx.getStorageSync(EXPORT_HISTORY_KEY) || [];
}

function setExportHistory(history) {
  wx.setStorageSync(EXPORT_HISTORY_KEY, history);
}

function getSettings() {
  return wx.getStorageSync(SETTINGS_KEY);
}

function setSettings(settings) {
  wx.setStorageSync(SETTINGS_KEY, settings);
}

// 好友相关方法
const getFriends = () => {
  return wx.getStorageSync(FRIENDS_KEY) || [];
};

const setFriends = (friends) => {
  wx.setStorageSync(FRIENDS_KEY, friends);
};

const addFriend = (friend) => {
  const friends = getFriends();
  friends.push(friend);
  setFriends(friends);
};

const removeFriend = (friendId) => {
  const friends = getFriends();
  const index = friends.findIndex(f => f.id === friendId);
  if (index !== -1) {
    friends.splice(index, 1);
    setFriends(friends);
  }
};

// 排行榜相关方法
const getRankings = (type) => {
  const rankings = wx.getStorageSync(RANKINGS_KEY) || {};
  return rankings[type] || [];
};

const setRankings = (type, rankings) => {
  const allRankings = wx.getStorageSync(RANKINGS_KEY) || {};
  allRankings[type] = rankings;
  wx.setStorageSync(RANKINGS_KEY, allRankings);
};

const updateRanking = (type, userId, score) => {
  const rankings = getRankings(type);
  const index = rankings.findIndex(r => r.id === userId);
  
  if (index !== -1) {
    rankings[index].score = score;
  } else {
    rankings.push({
      id: userId,
      score: score,
      trend: 0
    });
  }
  
  setRankings(type, rankings);
};

// 动态相关方法
const getMoments = () => {
  return wx.getStorageSync(MOMENTS_KEY) || [];
};

const setMoments = (moments) => {
  wx.setStorageSync(MOMENTS_KEY, moments);
};

const addMoment = (moment) => {
  const moments = getMoments();
  moment.id = Date.now().toString();
  moments.unshift(moment);
  setMoments(moments);
};

const toggleMomentLike = (momentId) => {
  const moments = getMoments();
  const moment = moments.find(m => m.id === momentId);
  if (moment) {
    moment.isLiked = !moment.isLiked;
    moment.likes += moment.isLiked ? 1 : -1;
    setMoments(moments);
  }
};

const addMomentComment = (momentId, comment) => {
  const moments = getMoments();
  const moment = moments.find(m => m.id === momentId);
  if (moment) {
    comment.id = Date.now().toString();
    comment.time = new Date().toISOString();
    moment.comments.push(comment);
    setMoments(moments);
  }
};

// 聊天消息相关方法
const getChatMessages = (friendId) => {
  const allMessages = wx.getStorageSync(CHAT_MESSAGES_KEY) || {};
  return allMessages[friendId] || [];
};

const setChatMessages = (friendId, messages) => {
  const allMessages = wx.getStorageSync(CHAT_MESSAGES_KEY) || {};
  allMessages[friendId] = messages;
  wx.setStorageSync(CHAT_MESSAGES_KEY, allMessages);
};

const addChatMessage = (friendId, message) => {
  const messages = getChatMessages(friendId);
  message.id = Date.now().toString();
  message.time = new Date().toISOString();
  messages.push(message);
  setChatMessages(friendId, messages);
};

// 好友详情相关方法
const getFriendById = (friendId) => {
  const friends = getFriends();
  return friends.find(f => f.id === friendId);
};

const checkIsFriend = (friendId) => {
  const friends = getFriends();
  return friends.some(f => f.id === friendId);
};

const getFriendExercises = async (friendId) => {
  // 这里应该从服务器获取好友的运动记录
  // 目前使用模拟数据
  return [
    {
      id: '1',
      type: '跑步',
      date: '2024-03-20',
      duration: 30,
      calories: 300,
      intensity: '中等'
    },
    {
      id: '2',
      type: '游泳',
      date: '2024-03-19',
      duration: 45,
      calories: 400,
      intensity: '高强度'
    }
  ];
};

const getFriendAchievements = async (friendId) => {
  // 这里应该从服务器获取好友的成就
  // 目前使用模拟数据
  return [
    {
      id: '1',
      name: '运动达人',
      description: '完成100次运动记录',
      icon: '/images/achievements/exercise-master.png',
      achievedTime: '2024-03-15'
    },
    {
      id: '2',
      name: '坚持不懈',
      description: '连续运动7天',
      icon: '/images/achievements/streak-7.png',
      achievedTime: '2024-03-10'
    }
  ];
};

const getFriendRankings = async (friendId) => {
  // 这里应该从服务器获取好友的排行榜排名
  // 目前使用模拟数据
  return {
    exercise: 5,
    weight: 3,
    streak: 8
  };
};

// 获取体重记录
function getWeightRecords() {
  return getData(KEYS.WEIGHT_RECORDS) || [];
}

// 设置体重记录
function setWeightRecords(records) {
  return saveData(KEYS.WEIGHT_RECORDS, records);
}

// 导出所有方法
module.exports = {
  KEYS,
  saveData,
  getData,
  removeData,
  clearAllData,
  saveWeightRecord,
  saveDietRecord,
  saveExerciseRecord,
  saveGoal,
  getRecordsByDate,
  getRecordsByDateRange,
  deleteRecord,
  getExerciseStats,
  getExerciseTypes,
  saveExerciseType,
  deleteExerciseType,
  getExerciseTrend,
  getExerciseReminders,
  setExerciseReminders,
  getExercisePlans,
  setExercisePlans,
  getUserInfo,
  setUserInfo,
  getUserId,
  setUserId,
  getStartWeight,
  setStartWeight,
  getGoals,
  setGoals,
  getAchievements,
  setAchievements,
  getExportHistory,
  setExportHistory,
  getSettings,
  setSettings,
  // 社交功能相关方法
  getFriends,
  setFriends,
  addFriend,
  removeFriend,
  getRankings,
  setRankings,
  updateRanking,
  getMoments,
  setMoments,
  addMoment,
  toggleMomentLike,
  addMomentComment,
  getChatMessages,
  setChatMessages,
  addChatMessage,
  // 好友详情相关方法
  getFriendById,
  checkIsFriend,
  getFriendExercises,
  getFriendAchievements,
  getFriendRankings,
  getWeightRecords,
  setWeightRecords
} 