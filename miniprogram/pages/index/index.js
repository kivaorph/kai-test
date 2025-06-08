const app = getApp()

Page({
  data: {
    userInfo: {},
    currentWeight: 0,
    weightChange: 0,
    targetDate: '',
    targetWeight: 0,
    weightToLose: 0,
    daysRemaining: 0,
    todayCalories: 0,
    todayBurned: 0,
    remainingCalories: 0,
    showGoalModal: false,
    newTargetWeight: '',
    newTargetDate: '',
    minDate: '',
    maxDate: ''
  },

  onLoad() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    // 设置日期选择器的范围
    const today = new Date()
    const minDate = today.toISOString().split('T')[0]
    const maxDate = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0]
    this.setData({
      minDate,
      maxDate
    })
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
      // 获取今天的日期
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      // 获取昨天的日期
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      // 按日期排序记录
      const sortedRecords = weightRecords.sort((a, b) => {
        const dateA = a.date.split('T')[0]
        const dateB = b.date.split('T')[0]
        return dateA.localeCompare(dateB)
      })

      // 找到今天的记录
      const todayRecord = sortedRecords.find(record => record.date.startsWith(todayStr))
      // 找到昨天的记录
      const yesterdayRecord = sortedRecords.find(record => record.date.startsWith(yesterdayStr))

      // 如果今天没有记录，使用最新记录
      const currentWeight = todayRecord ? todayRecord.weight : sortedRecords[sortedRecords.length - 1].weight
      // 如果昨天没有记录，使用今天或最新的记录
      const yesterdayWeight = yesterdayRecord ? yesterdayRecord.weight : currentWeight
      
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
      if (weightRecords && weightRecords.length > 0) {
        const currentWeight = weightRecords[weightRecords.length - 1].weight
        const weightToLose = (currentWeight - currentGoal.targetWeight).toFixed(1)
        
        // 计算剩余天数
        const today = new Date()
        const targetDate = new Date(currentGoal.targetDate)
        const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24))

        this.setData({
          targetDate: currentGoal.targetDate,
          targetWeight: currentGoal.targetWeight,
          weightToLose,
          daysRemaining
        })
      }
    }
  },

  // 加载今日数据
  loadTodayData() {
    const today = new Date().toISOString().split('T')[0]
    // 直接从本地存储读取饮食和运动数据
    const dietRecords = wx.getStorageSync('dietRecords') || []
    const exerciseRecords = wx.getStorageSync('exerciseRecords') || []

    const todayDietRecords = dietRecords.filter(record => record.date && record.date.startsWith(today))
    const todayExerciseRecords = exerciseRecords.filter(record => record.date && record.date.startsWith(today))

    const todayCalories = todayDietRecords.reduce((sum, record) => sum + (record.calories || 0), 0)
    const todayBurned = todayExerciseRecords.reduce((sum, record) => sum + (record.calories || 0), 0)
    const remainingCalories = 2000 - todayCalories + todayBurned // 假设基础代谢为2000卡路里

    this.setData({
      todayCalories,
      todayBurned,
      remainingCalories
    })
  },

  // 显示目标设置弹窗
  showGoalModal() {
    const { targetWeight, targetDate } = this.data
    this.setData({
      showGoalModal: true,
      newTargetWeight: targetWeight || '',
      newTargetDate: targetDate || ''
    })
  },

  // 隐藏目标设置弹窗
  hideGoalModal() {
    this.setData({
      showGoalModal: false
    })
  },

  // 目标体重输入处理
  onTargetWeightInput(e) {
    this.setData({
      newTargetWeight: e.detail.value
    })
  },

  // 目标日期选择处理
  onTargetDateChange(e) {
    this.setData({
      newTargetDate: e.detail.value
    })
  },

  // 保存目标
  saveGoal() {
    const { newTargetWeight, newTargetDate } = this.data
    if (!newTargetWeight || !newTargetDate) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    const targetWeight = parseFloat(newTargetWeight)
    if (isNaN(targetWeight) || targetWeight <= 0) {
      wx.showToast({
        title: '请输入有效的目标体重',
        icon: 'none'
      })
      return
    }

    // 保存目标到全局数据和本地存储
    const goals = app.globalData.goals || []
    goals.push({
      targetWeight,
      targetDate: newTargetDate
    })
    app.globalData.goals = goals
    wx.setStorageSync('goals', goals)

    // 更新页面数据
    this.setData({
      showGoalModal: false,
      targetWeight,
      targetDate: newTargetDate
    })

    // 重新加载目标数据
    this.loadGoalData()

    wx.showToast({
      title: '设置成功',
      icon: 'success'
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