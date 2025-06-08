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
  }
}) 