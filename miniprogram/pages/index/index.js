const app = getApp()

Page({
  data: {
    userInfo: {},
    currentWeight: 0,
    weightChange: 0,
    targetDate: '',
    targetWeight: 0,
    lostWeight: 0,
    progressPercentage: 0,
    todayCalories: 0,
    todayBurned: 0,
    remainingCalories: 0
  },

  onLoad() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  // 加载数据
  loadData() {
    this.loadWeightData()
    this.loadGoalData()
    this.loadTodayData()
  },

  // 加载体重数据
  loadWeightData() {
    const weightRecords = app.globalData.weightRecords
    if (weightRecords && weightRecords.length > 0) {
      const currentWeight = weightRecords[weightRecords.length - 1].weight
      const yesterdayWeight = weightRecords.length > 1 ? 
        weightRecords[weightRecords.length - 2].weight : currentWeight
      const weightChange = (currentWeight - yesterdayWeight).toFixed(1)

      this.setData({
        currentWeight,
        weightChange
      })
    }
  },

  // 加载目标数据
  loadGoalData() {
    const goals = app.globalData.goals
    if (goals && goals.length > 0) {
      const currentGoal = goals[goals.length - 1]
      const weightRecords = app.globalData.weightRecords
      const startWeight = weightRecords[0].weight
      const currentWeight = weightRecords[weightRecords.length - 1].weight
      const lostWeight = (startWeight - currentWeight).toFixed(1)
      const totalToLose = (startWeight - currentGoal.targetWeight).toFixed(1)
      const progressPercentage = (lostWeight / totalToLose * 100).toFixed(1)

      this.setData({
        targetDate: currentGoal.targetDate,
        targetWeight: currentGoal.targetWeight,
        lostWeight,
        progressPercentage
      })
    }
  },

  // 加载今日数据
  loadTodayData() {
    const today = new Date().toISOString().split('T')[0]
    const dietRecords = app.globalData.dietRecords.filter(record => 
      record.date.startsWith(today))
    const exerciseRecords = app.globalData.exerciseRecords.filter(record => 
      record.date.startsWith(today))

    const todayCalories = dietRecords.reduce((sum, record) => sum + record.calories, 0)
    const todayBurned = exerciseRecords.reduce((sum, record) => sum + record.calories, 0)
    const remainingCalories = 2000 - todayCalories + todayBurned // 假设基础代谢为2000卡路里

    this.setData({
      todayCalories,
      todayBurned,
      remainingCalories
    })
  },

  // 页面导航
  navigateToWeight() {
    wx.switchTab({
      url: '/pages/weight/weight'
    })
  },

  navigateToDiet() {
    wx.switchTab({
      url: '/pages/diet/diet'
    })
  },

  navigateToExercise() {
    wx.switchTab({
      url: '/pages/exercise/exercise'
    })
  }
}) 