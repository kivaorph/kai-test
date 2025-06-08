const storage = require('../../utils/storage.js');
const calculator = require('../../utils/calculator.js');

Page({
  data: {
    userInfo: {},
    userId: '',
    stats: {
      totalDays: 0,
      achievements: 0,
      rank: 0
    },
    goals: {
      weight: 0,
      weeklyExercise: 0,
      dailyCalories: 0
    },
    currentWeight: 0,
    weeklyExercise: 0,
    todayCalories: 0,
    weightProgress: 0,
    exerciseProgress: 0,
    caloriesProgress: 0,
    achievements: []
  },

  onLoad() {
    this.loadUserInfo();
    this.loadStats();
    this.loadGoals();
    this.loadAchievements();
  },

  onShow() {
    this.updateProgress();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = storage.getUserInfo() || {};
    const userId = storage.getUserId() || '';
    this.setData({ userInfo, userId });
  },

  // 加载统计数据
  loadStats() {
    const weightRecords = storage.getWeightRecords() || [];
    const exerciseRecords = storage.getExerciseRecords() || [];
    const dietRecords = storage.getDietRecords() || [];

    // 计算总天数
    const allDates = new Set([
      ...weightRecords.map(r => r.date),
      ...exerciseRecords.map(r => r.date),
      ...dietRecords.map(r => r.date)
    ]);
    const totalDays = allDates.size;

    // 计算成就数量
    const achievements = storage.getAchievements() || [];
    const unlockedAchievements = achievements.filter(a => a.unlocked).length;

    // 计算排名（示例：根据总运动时长）
    const totalExerciseTime = exerciseRecords.reduce((sum, r) => sum + r.duration, 0);
    const rank = this.calculateRank(totalExerciseTime);

    this.setData({
      stats: {
        totalDays,
        achievements: unlockedAchievements,
        rank
      }
    });
  },

  // 加载目标设置
  loadGoals() {
    const goals = storage.getGoals() || {
      weight: 0,
      weeklyExercise: 0,
      dailyCalories: 0
    };
    this.setData({ goals });
  },

  // 加载成就列表
  loadAchievements() {
    const achievements = storage.getAchievements() || [];
    this.setData({ achievements });
  },

  // 更新进度
  updateProgress() {
    // 获取当前体重
    const weightRecords = storage.getWeightRecords() || [];
    const currentWeight = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : 0;

    // 获取本周运动时长
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const exerciseRecords = storage.getExerciseRecords() || [];
    const weeklyExercise = exerciseRecords
      .filter(r => new Date(r.date) >= weekStart)
      .reduce((sum, r) => sum + r.duration, 0);

    // 获取今日卡路里
    const today = new Date().toISOString().split('T')[0];
    const dietRecords = storage.getDietRecords() || [];
    const todayCalories = dietRecords
      .filter(r => r.date === today)
      .reduce((sum, r) => sum + r.calories, 0);

    // 计算进度
    const weightProgress = this.calculateWeightProgress(currentWeight);
    const exerciseProgress = this.calculateExerciseProgress(weeklyExercise);
    const caloriesProgress = this.calculateCaloriesProgress(todayCalories);

    this.setData({
      currentWeight,
      weeklyExercise,
      todayCalories,
      weightProgress,
      exerciseProgress,
      caloriesProgress
    });
  },

  // 计算体重进度
  calculateWeightProgress(currentWeight) {
    if (!this.data.goals.weight || !currentWeight) return 0;
    const startWeight = storage.getStartWeight() || currentWeight;
    const targetWeight = this.data.goals.weight;
    const totalChange = Math.abs(startWeight - targetWeight);
    const currentChange = Math.abs(startWeight - currentWeight);
    return Math.min(Math.round((currentChange / totalChange) * 100), 100);
  },

  // 计算运动进度
  calculateExerciseProgress(weeklyExercise) {
    if (!this.data.goals.weeklyExercise) return 0;
    return Math.min(Math.round((weeklyExercise / this.data.goals.weeklyExercise) * 100), 100);
  },

  // 计算卡路里进度
  calculateCaloriesProgress(todayCalories) {
    if (!this.data.goals.dailyCalories) return 0;
    return Math.min(Math.round((todayCalories / this.data.goals.dailyCalories) * 100), 100);
  },

  // 计算排名（示例实现）
  calculateRank(totalExerciseTime) {
    // 这里应该从服务器获取真实排名
    // 目前返回一个随机排名作为示例
    return Math.floor(Math.random() * 100) + 1;
  },

  // 页面导航
  navigateToDataExport() {
    wx.navigateTo({
      url: '/pages/profile/data-export'
    });
  },

  navigateToSettings() {
    wx.navigateTo({
      url: '/pages/profile/settings'
    });
  },

  navigateToAbout() {
    wx.navigateTo({
      url: '/pages/profile/about'
    });
  }
}); 