App({
  globalData: {
    userInfo: null,
    weightRecords: [],
    dietRecords: [],
    exerciseRecords: [],
    goals: []
  },
  onLaunch() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    // 从本地存储加载数据
    this.loadLocalData()
  },

  // 加载本地存储的数据
  loadLocalData() {
    const weightRecords = wx.getStorageSync('weightRecords')
    const dietRecords = wx.getStorageSync('dietRecords')
    const exerciseRecords = wx.getStorageSync('exerciseRecords')
    const goals = wx.getStorageSync('goals')

    if (weightRecords) this.globalData.weightRecords = weightRecords
    if (dietRecords) this.globalData.dietRecords = dietRecords
    if (exerciseRecords) this.globalData.exerciseRecords = exerciseRecords
    if (goals) this.globalData.goals = goals
  },

  // 保存数据到本地存储
  saveLocalData() {
    wx.setStorageSync('weightRecords', this.globalData.weightRecords)
    wx.setStorageSync('dietRecords', this.globalData.dietRecords)
    wx.setStorageSync('exerciseRecords', this.globalData.exerciseRecords)
    wx.setStorageSync('goals', this.globalData.goals)
  }
}) 