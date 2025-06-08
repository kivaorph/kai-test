const storage = require('../../utils/storage')
const calculator = require('../../utils/calculator')

Page({
  data: {
    weight: '',
    date: '',
    note: '',
    currentMonth: '',
    weightRecords: [],
    chartData: {
      dates: [],
      weights: []
    }
  },

  onLoad() {
    // 设置当前日期
    const today = calculator.formatDate(new Date())
    this.setData({
      date: today,
      currentMonth: today.substring(0, 7)
    })
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  // 加载数据
  loadData() {
    this.loadWeightRecords()
    this.updateChart()
  },

  // 加载体重记录
  loadWeightRecords() {
    const records = storage.getData(storage.KEYS.WEIGHT_RECORDS) || []
    this.setData({
      weightRecords: records.sort((a, b) => new Date(b.date) - new Date(a.date))
    })
  },

  // 更新图表
  updateChart() {
    const { currentMonth } = this.data
    if (!currentMonth) return

    const startDate = `${currentMonth}-01`
    const endDate = calculator.formatDate(new Date(currentMonth + '-01').setMonth(new Date(currentMonth + '-01').getMonth() + 1) - 1)
    const records = storage.getRecordsByDateRange(storage.KEYS.WEIGHT_RECORDS, startDate, endDate)
    
    const dates = []
    const weights = []
    records.forEach(record => {
      dates.push(record.date.split('T')[0])
      weights.push(record.weight)
    })

    this.setData({
      'chartData.dates': dates,
      'chartData.weights': weights
    })

    this.drawChart()
  },

  // 绘制图表
  drawChart() {
    const ctx = wx.createCanvasContext('weightChart')
    const { dates, weights } = this.data.chartData
    if (dates.length === 0) return

    const width = 300
    const height = 200
    const padding = 20
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // 计算数据范围
    const maxWeight = Math.max(...weights)
    const minWeight = Math.min(...weights)
    const range = maxWeight - minWeight

    // 绘制坐标轴
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // 绘制数据点
    ctx.beginPath()
    dates.forEach((date, index) => {
      const x = padding + (index / (dates.length - 1)) * chartWidth
      const y = height - padding - ((weights[index] - minWeight) / range) * chartHeight
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.strokeStyle = '#1296db'
    ctx.stroke()

    // 绘制数据点
    dates.forEach((date, index) => {
      const x = padding + (index / (dates.length - 1)) * chartWidth
      const y = height - padding - ((weights[index] - minWeight) / range) * chartHeight
      
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#1296db'
      ctx.fill()
    })

    ctx.draw()
  },

  // 输入处理函数
  onWeightInput(e) {
    this.setData({
      weight: e.detail.value
    })
  },

  onDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },

  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    })
  },

  onMonthChange(e) {
    this.setData({
      currentMonth: e.detail.value
    })
    this.updateChart()
  },

  // 保存体重记录
  saveWeight() {
    const { weight, date, note } = this.data
    if (!weight) {
      wx.showToast({
        title: '请输入体重',
        icon: 'none'
      })
      return
    }

    const record = {
      weight: parseFloat(weight),
      date: date + 'T00:00:00.000Z',
      note
    }

    if (storage.saveWeightRecord(record)) {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      this.setData({
        weight: '',
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
          if (storage.deleteRecord(storage.KEYS.WEIGHT_RECORDS, id)) {
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