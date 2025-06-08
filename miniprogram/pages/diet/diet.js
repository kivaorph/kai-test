const storage = require('../../utils/storage')
const calculator = require('../../utils/calculator')

// 常见食物列表
const commonFoods = [
  { name: '米饭', calories: 116 },
  { name: '面条', calories: 138 },
  { name: '面包', calories: 313 },
  { name: '鸡蛋', calories: 144 },
  { name: '牛奶', calories: 66 },
  { name: '鸡胸肉', calories: 167 },
  { name: '牛肉', calories: 125 },
  { name: '猪肉', calories: 143 },
  { name: '鱼', calories: 100 },
  { name: '豆腐', calories: 76 },
  { name: '青菜', calories: 20 },
  { name: '苹果', calories: 54 }
]

Page({
  data: {
    foodName: '',
    amount: '',
    calories: '',
    time: '',
    note: '',
    todayCalories: 0,
    targetCalories: 2000, // 默认目标摄入量
    remainingCalories: 2000,
    mealGroups: [],
    commonFoods,
    showQuickFoodModal: false,
    quickFood: {},
    quickFoodAmount: '',
    quickFoodCalories: 0,
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
    this.calculateCalories()
  },

  // 加载今日记录
  loadTodayRecords() {
    const today = calculator.formatDate(new Date())
    const records = storage.getRecordsByDate(storage.KEYS.DIET_RECORDS, today)
    
    // 按时间分组
    const mealGroups = this.groupRecordsByTime(records)
    this.setData({ mealGroups })
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

  // 计算热量
  calculateCalories() {
    const today = calculator.formatDate(new Date())
    const records = storage.getRecordsByDate(storage.KEYS.DIET_RECORDS, today)
    const totalCalories = records.reduce((sum, record) => sum + record.calories, 0)
    const remainingCalories = this.data.targetCalories - totalCalories

    this.setData({
      todayCalories: totalCalories,
      remainingCalories
    })
  },

  // 输入处理函数
  onFoodNameInput(e) {
    this.setData({
      foodName: e.detail.value
    })
  },

  onAmountInput(e) {
    this.setData({
      amount: e.detail.value
    })
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

  // 选择常见食物
  selectCommonFood(e) {
    const food = e.currentTarget.dataset.food
    this.setData({
      quickFood: food,
      quickFoodAmount: '',
      quickFoodCalories: 0,
      showQuickFoodModal: true
    })
  },

  // 关闭弹窗
  closeQuickFoodModal() {
    this.setData({ showQuickFoodModal: false })
  },

  // 输入克数
  onQuickFoodAmountInput(e) {
    const amount = e.detail.value
    const calories = this.data.quickFood.calories
    let quickFoodCalories = 0
    if (amount && calories) {
      quickFoodCalories = ((parseFloat(amount) * parseFloat(calories)) / 100).toFixed(1)
    }
    this.setData({
      quickFoodAmount: amount,
      quickFoodCalories
    })
  },

  // 确认快捷添加
  confirmQuickFood() {
    const { quickFood, quickFoodAmount, quickFoodCalories } = this.data
    if (!quickFood.name || !quickFoodAmount || !quickFoodCalories) {
      wx.showToast({ title: '请填写份量', icon: 'none' })
      return
    }
    this.setData({
      foodName: quickFood.name,
      amount: quickFoodAmount,
      calories: quickFoodCalories,
      showQuickFoodModal: false
    })
  },

  // 保存饮食记录
  saveDiet() {
    const { foodName, amount, calories, time, note } = this.data
    if (!foodName || !amount || !calories || !time) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    const record = {
      name: foodName,
      amount: parseFloat(amount),
      calories: parseFloat(calories),
      time,
      note,
      date: calculator.formatDate(new Date())
    }

    if (storage.saveDietRecord(record)) {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      this.setData({
        foodName: '',
        amount: '',
        calories: '',
        note: ''
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
          if (storage.deleteRecord(storage.KEYS.DIET_RECORDS, id)) {
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