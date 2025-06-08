App({
  globalData: {
    userInfo: null,           // 用户信息
    weightRecords: [],        // 体重记录
    goals: [],                // 目标
    dietRecords: [],          // 饮食记录
    exerciseRecords: []       // 运动记录
  },
  onLaunch() {
    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-8g123abc', // 请替换为您的云开发环境ID
        traceUser: true
      })
    }

    // 初始化数据
    this.initData()
  },

  // 初始化数据
  initData() {
    // 从本地存储加载数据
    const weightRecords = wx.getStorageSync('weightRecords') || []
    const dietRecords = wx.getStorageSync('dietRecords') || []
    const exerciseRecords = wx.getStorageSync('exerciseRecords') || []
    const goals = wx.getStorageSync('goals') || []

    this.globalData.weightRecords = weightRecords
    this.globalData.dietRecords = dietRecords
    this.globalData.exerciseRecords = exerciseRecords
    this.globalData.goals = goals
  }
}) 