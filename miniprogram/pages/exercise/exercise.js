const storage = require('../../utils/storage')
const calculator = require('../../utils/calculator')

// 常见运动类型及其每小时消耗的热量（以60kg体重为基准）
const commonExercises = [
  { type: '步行', caloriesPerHour: 255, intensity: '低强度' },
  { type: '慢跑', caloriesPerHour: 600, intensity: '中强度' },
  { type: '快跑', caloriesPerHour: 900, intensity: '高强度' },
  { type: '游泳', caloriesPerHour: 600, intensity: '中强度' },
  { type: '骑自行车', caloriesPerHour: 292, intensity: '低强度' },
  { type: '打篮球', caloriesPerHour: 584, intensity: '中强度' },
  { type: '打羽毛球', caloriesPerHour: 266, intensity: '中强度' },
  { type: '瑜伽', caloriesPerHour: 149, intensity: '低强度' }
]

Page({
  data: {
    exerciseTypes: ['步行', '慢跑', '快跑', '游泳', '骑自行车', '打篮球', '打羽毛球', '瑜伽', '其他'],
    exerciseTypeIndex: 0,
    duration: '',
    calories: '',
    time: '',
    note: '',
    totalDuration: 0,
    totalCalories: 0,
    exerciseGroups: [],
    commonExercises,
    intensity: '',
    recommendation: '',
    weeklyGoal: 150, // 每周运动目标（分钟）
    weeklyProgress: 0,
    weeklyCalories: 0,
    showQuickExerciseModal: false,
    quickExercise: {},
    quickExerciseDuration: '',
    quickExerciseCalories: 0
  },

  onLoad() {
    // 设置当前时间
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    this.setData({ time })
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  // 加载数据
  loadData() {
    this.loadTodayRecords()
    this.calculateTotals()
    this.calculateWeeklyProgress()
    this.updateIntensityAndRecommendation()
  },

  // 加载今日记录
  loadTodayRecords() {
    const today = calculator.formatDate(new Date())
    const records = storage.getRecordsByDate(storage.KEYS.EXERCISE_RECORDS, today)
    
    // 按时间分组
    const exerciseGroups = this.groupRecordsByTime(records)
    this.setData({ exerciseGroups })
  },

  // 按时间分组记录
  groupRecordsByTime(records) {
    const groups = {}
    records.forEach(record => {
      const time = record.time
      if (!groups[time]) {
        groups[time] = {
          time,
          items: []
        }
      }
      groups[time].items.push(record)
    })

    return Object.values(groups).sort((a, b) => a.time.localeCompare(b.time))
  },

  // 计算总时长和总热量
  calculateTotals() {
    const today = calculator.formatDate(new Date())
    const records = storage.getRecordsByDate(storage.KEYS.EXERCISE_RECORDS, today)
    const totalDuration = records.reduce((sum, record) => sum + record.duration, 0)
    const totalCalories = records.reduce((sum, record) => sum + record.calories, 0)

    this.setData({
      totalDuration,
      totalCalories
    })
  },

  // 计算每周进度
  calculateWeeklyProgress() {
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const endOfWeek = new Date(today.setDate(today.getDate() + 6))
    
    const records = storage.getRecordsByDateRange(
      storage.KEYS.EXERCISE_RECORDS,
      calculator.formatDate(startOfWeek),
      calculator.formatDate(endOfWeek)
    )

    const weeklyDuration = records.reduce((sum, record) => sum + record.duration, 0)
    const weeklyCalories = records.reduce((sum, record) => sum + record.calories, 0)
    const progress = Math.min(100, (weeklyDuration / this.data.weeklyGoal) * 100)

    this.setData({
      weeklyProgress: progress,
      weeklyCalories
    })
  },

  // 更新运动强度和建议
  updateIntensityAndRecommendation() {
    const { exerciseTypes, exerciseTypeIndex, duration } = this.data
    if (!duration) return

    const exerciseType = exerciseTypes[exerciseTypeIndex]
    const exercise = commonExercises.find(e => e.type === exerciseType)
    
    if (exercise) {
      const intensity = exercise.intensity
      const recommendation = this.getExerciseRecommendation(exerciseType, duration)
      
      this.setData({
        intensity,
        recommendation
      })
    }
  },

  // 获取运动建议
  getExerciseRecommendation(type, duration) {
    const recommendations = {
      '步行': '建议每天步行6000步以上，可以分多次完成。',
      '慢跑': '建议每周3-4次，每次30-45分钟，注意控制心率。',
      '快跑': '建议每周2-3次，每次20-30分钟，注意充分热身。',
      '游泳': '建议每周2-3次，每次30-60分钟，注意循序渐进。',
      '骑自行车': '建议每周3-4次，每次30-60分钟，注意调整座椅高度。',
      '打篮球': '建议每周2-3次，每次1-2小时，注意保护关节。',
      '打羽毛球': '建议每周2-3次，每次1-1.5小时，注意技术动作。',
      '瑜伽': '建议每周3-5次，每次30-60分钟，注意呼吸节奏。'
    }

    return recommendations[type] || '建议根据个人情况合理安排运动时间和强度。'
  },

  // 输入处理函数
  onExerciseTypeChange(e) {
    this.setData({
      exerciseTypeIndex: e.detail.value
    })
    this.updateIntensityAndRecommendation()
  },

  onDurationInput(e) {
    const duration = e.detail.value
    this.setData({ duration })
    
    // 如果选择了常见运动类型，自动计算消耗的热量
    if (duration && this.data.exerciseTypeIndex < commonExercises.length) {
      const exercise = commonExercises[this.data.exerciseTypeIndex]
      const calories = (exercise.caloriesPerHour * duration / 60).toFixed(1)
      this.setData({ calories })
    }
    
    this.updateIntensityAndRecommendation()
  },

  onCaloriesInput(e) {
    this.setData({
      calories: e.detail.value
    })
  },

  onTimeChange(e) {
    this.setData({
      time: e.detail.value
    })
  },

  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    })
  },

  // 选择常见运动类型
  selectCommonExercise(e) {
    const exercise = e.currentTarget.dataset.exercise
    this.setData({
      quickExercise: exercise,
      quickExerciseDuration: '',
      quickExerciseCalories: 0,
      showQuickExerciseModal: true
    })
  },

  // 关闭弹窗
  closeQuickExerciseModal() {
    this.setData({ showQuickExerciseModal: false })
  },

  // 输入时长
  onQuickExerciseDurationInput(e) {
    const duration = e.detail.value
    const caloriesPerHour = this.data.quickExercise.caloriesPerHour
    let quickExerciseCalories = 0
    if (duration && caloriesPerHour) {
      quickExerciseCalories = ((parseFloat(duration) * parseFloat(caloriesPerHour)) / 60).toFixed(1)
    }
    this.setData({
      quickExerciseDuration: duration,
      quickExerciseCalories
    })
  },

  // 确认快捷添加
  confirmQuickExercise() {
    const { quickExercise, quickExerciseDuration, quickExerciseCalories, exerciseTypes } = this.data
    if (!quickExercise.type || !quickExerciseDuration || !quickExerciseCalories) {
      wx.showToast({ title: '请填写时长', icon: 'none' })
      return
    }
    // 找到运动类型在下拉列表中的索引
    const exerciseTypeIndex = exerciseTypes.findIndex(type => type === quickExercise.type)
    this.setData({
      exerciseTypeIndex: exerciseTypeIndex >= 0 ? exerciseTypeIndex : 0,
      duration: quickExerciseDuration,
      calories: quickExerciseCalories,
      intensity: quickExercise.intensity || '',
      showQuickExerciseModal: false
    })
  },

  // 保存运动记录
  saveExercise() {
    const { exerciseTypes, exerciseTypeIndex, duration, calories, time, note } = this.data
    if (!duration || !calories || !time) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    const record = {
      type: exerciseTypes[exerciseTypeIndex],
      duration: parseFloat(duration),
      calories: parseFloat(calories),
      time,
      note,
      date: calculator.formatDate(new Date()),
      intensity: this.data.intensity
    }

    if (storage.saveExerciseRecord(record)) {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      this.setData({
        duration: '',
        calories: '',
        note: '',
        intensity: '',
        recommendation: ''
      })
      this.loadData()
    } else {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  // 删除记录
  deleteRecord(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          if (storage.deleteRecord(storage.KEYS.EXERCISE_RECORDS, id)) {
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            this.loadData()
          } else {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }
}) 