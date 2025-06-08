const storage = require('../../utils/storage')
const calculator = require('../../utils/calculator')
const wxCharts = require('../../utils/wxcharts')

// 运动成就定义
const achievements = [
  {
    id: 'first_exercise',
    name: '初次运动',
    description: '完成第一次运动记录',
    check: (records) => records.length > 0
  },
  {
    id: 'weekly_goal',
    name: '周目标达成',
    description: '完成每周运动目标（150分钟）',
    check: (records) => {
      const weeklyDuration = records.reduce((sum, record) => sum + record.duration, 0)
      return weeklyDuration >= 150
    }
  },
  {
    id: 'monthly_goal',
    name: '月目标达成',
    description: '完成每月运动目标（600分钟）',
    check: (records) => {
      const monthlyDuration = records.reduce((sum, record) => sum + record.duration, 0)
      return monthlyDuration >= 600
    }
  },
  {
    id: 'streak_3',
    name: '连续运动3天',
    description: '连续3天进行运动',
    check: (records) => {
      const dates = new Set(records.map(r => r.date))
      const sortedDates = Array.from(dates).sort()
      let maxStreak = 0
      let currentStreak = 1
      
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1])
        const curr = new Date(sortedDates[i])
        const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          currentStreak++
          maxStreak = Math.max(maxStreak, currentStreak)
        } else {
          currentStreak = 1
        }
      }
      
      return maxStreak >= 3
    }
  },
  {
    id: 'streak_7',
    name: '连续运动7天',
    description: '连续7天进行运动',
    check: (records) => {
      const dates = new Set(records.map(r => r.date))
      const sortedDates = Array.from(dates).sort()
      let maxStreak = 0
      let currentStreak = 1
      
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1])
        const curr = new Date(sortedDates[i])
        const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          currentStreak++
          maxStreak = Math.max(maxStreak, currentStreak)
        } else {
          currentStreak = 1
        }
      }
      
      return maxStreak >= 7
    }
  }
]

Page({
  data: {
    currentMonth: '',
    totalDuration: 0,
    totalCalories: 0,
    achievedDays: 0,
    achievements: []
  },

  onLoad() {
    // 设置当前月份
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    this.setData({ currentMonth })
    
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  // 加载数据
  loadData() {
    const { currentMonth } = this.data
    const [year, month] = currentMonth.split('-')
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    
    const records = storage.getRecordsByDateRange(
      storage.KEYS.EXERCISE_RECORDS,
      calculator.formatDate(startDate),
      calculator.formatDate(endDate)
    )

    this.calculateStatistics(records)
    this.drawCharts(records)
    this.checkAchievements(records)
  },

  // 计算统计数据
  calculateStatistics(records) {
    const totalDuration = records.reduce((sum, record) => sum + record.duration, 0)
    const totalCalories = records.reduce((sum, record) => sum + record.calories, 0)
    
    // 计算达标天数（每天运动30分钟以上）
    const dailyDuration = {}
    records.forEach(record => {
      if (!dailyDuration[record.date]) {
        dailyDuration[record.date] = 0
      }
      dailyDuration[record.date] += record.duration
    })
    
    const achievedDays = Object.values(dailyDuration).filter(duration => duration >= 30).length

    this.setData({
      totalDuration,
      totalCalories,
      achievedDays
    })
  },

  // 绘制图表
  drawCharts(records) {
    this.drawDurationChart(records)
    this.drawTypeChart(records)
    this.drawIntensityChart(records)
  },

  // 绘制运动时长趋势图
  drawDurationChart(records) {
    const dailyDuration = {}
    records.forEach(record => {
      if (!dailyDuration[record.date]) {
        dailyDuration[record.date] = 0
      }
      dailyDuration[record.date] += record.duration
    })

    const dates = Object.keys(dailyDuration).sort()
    const durations = dates.map(date => dailyDuration[date])

    new wxCharts({
      canvasId: 'durationChart',
      type: 'line',
      categories: dates,
      series: [{
        name: '运动时长',
        data: durations,
        format: val => val.toFixed(0) + '分钟'
      }],
      yAxis: {
        title: '时长（分钟）',
        format: val => val.toFixed(0)
      },
      width: 320,
      height: 200
    })
  },

  // 绘制运动类型分布图
  drawTypeChart(records) {
    const typeStats = {}
    records.forEach(record => {
      if (!typeStats[record.type]) {
        typeStats[record.type] = 0
      }
      typeStats[record.type] += record.duration
    })

    const types = Object.keys(typeStats)
    const durations = types.map(type => typeStats[type])

    new wxCharts({
      canvasId: 'typeChart',
      type: 'pie',
      series: [{
        name: '运动类型',
        data: durations,
        format: val => val.toFixed(0) + '分钟'
      }],
      categories: types,
      width: 320,
      height: 200
    })
  },

  // 绘制运动强度分布图
  drawIntensityChart(records) {
    const intensityStats = {
      '低强度': 0,
      '中强度': 0,
      '高强度': 0
    }

    records.forEach(record => {
      if (record.intensity) {
        intensityStats[record.intensity] += record.duration
      }
    })

    const intensities = Object.keys(intensityStats)
    const durations = intensities.map(intensity => intensityStats[intensity])

    new wxCharts({
      canvasId: 'intensityChart',
      type: 'pie',
      series: [{
        name: '运动强度',
        data: durations,
        format: val => val.toFixed(0) + '分钟'
      }],
      categories: intensities,
      width: 320,
      height: 200
    })
  },

  // 检查成就
  checkAchievements(records) {
    const checkedAchievements = achievements.map(achievement => {
      const achieved = achievement.check(records)
      let progress = 0

      if (!achieved) {
        // 计算进度
        if (achievement.id === 'weekly_goal') {
          const weeklyDuration = records.reduce((sum, record) => sum + record.duration, 0)
          progress = Math.min(100, (weeklyDuration / 150) * 100)
        } else if (achievement.id === 'monthly_goal') {
          const monthlyDuration = records.reduce((sum, record) => sum + record.duration, 0)
          progress = Math.min(100, (monthlyDuration / 600) * 100)
        }
      }

      return {
        ...achievement,
        achieved,
        progress: Math.round(progress)
      }
    })

    this.setData({
      achievements: checkedAchievements
    })
  },

  // 月份选择
  onMonthChange(e) {
    this.setData({
      currentMonth: e.detail.value
    })
    this.loadData()
  }
}) 