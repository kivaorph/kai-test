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

  // 格式化日期为 yyyy/mm/dd
  formatDate(dateStr) {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
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

  // 加载数据
  loadData() {
    this.loadWeightRecords()
    this.updateChart()
  },

  // 加载体重记录
  loadWeightRecords() {
    const records = storage.getWeightRecords() || []
    // 格式化每条记录的日期
    const formattedRecords = records.map(record => ({
      ...record,
      formattedDate: this.formatDate(record.date)
    }))
    this.setData({
      weightRecords: formattedRecords.sort((a, b) => {
        // 提取日期部分进行比较
        const dateA = a.date.split('T')[0]
        const dateB = b.date.split('T')[0]
        return dateA.localeCompare(dateB) // 从早到晚排序
      })
    })
  },

  // 更新图表
  updateChart() {
    const { currentMonth } = this.data
    if (!currentMonth) return

    const startDate = `${currentMonth}-01`
    const endDate = calculator.formatDate(new Date(currentMonth + '-01').setMonth(new Date(currentMonth + '-01').getMonth() + 1) - 1)
    const records = storage.getRecordsByDateRange(storage.KEYS.WEIGHT_RECORDS, startDate, endDate)
    
    // 按日期从早到晚排序
    const sortedRecords = records.sort((a, b) => {
      const dateA = a.date.split('T')[0]
      const dateB = b.date.split('T')[0]
      return dateA.localeCompare(dateB)
    })

    const dates = []
    const weights = []
    sortedRecords.forEach(record => {
      dates.push(record.date.split('T')[0])
      // 确保体重值为数字类型
      weights.push(parseFloat(record.weight))
    })

    this.setData({
      'chartData.dates': dates,
      'chartData.weights': weights
    })

    this.drawChart()
  },

  // 绘制图表
  drawChart() {
    const { dates, weights } = this.data.chartData
    if (dates.length === 0) return

    const ctx = wx.createCanvasContext('weightChart')
    const width = 300
    const height = 200
    const padding = 30
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 计算数据范围
    const maxWeight = Math.max(...weights)
    const minWeight = Math.min(...weights)
    const weightRange = maxWeight - minWeight
    const weightPadding = weightRange * 0.1 // 上下留10%的空间

    // 计算数据点坐标
    const points = weights.map((weight, index) => {
      const x = padding + index * (chartWidth / (dates.length - 1))
      const y = height - padding - ((weight - (minWeight - weightPadding)) / (weightRange + weightPadding * 2) * chartHeight)
      return { x, y, weight, date: dates[index] }
    })

    // 绘制平滑曲线
    if (points.length > 1) {
      ctx.beginPath()
      ctx.setLineWidth(3)
      ctx.setStrokeStyle('#1296db')
      ctx.setLineCap('round')
      ctx.setLineJoin('round')

      // 使用贝塞尔曲线创建平滑效果
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        const xc = (points[i].x + points[i - 1].x) / 2
        const yc = (points[i].y + points[i - 1].y) / 2
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc)
      }
      ctx.stroke()
    }

    // 绘制数据点和标签
    points.forEach(point => {
      // 绘制数据点
      ctx.beginPath()
      ctx.setFillStyle('#1296db')
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
      ctx.fill()

      // 绘制标签背景
      const date = point.date.split('-')
      const label = `${date[1]}-${date[2]} ${point.weight}kg`
      ctx.setFontSize(10)
      const textWidth = ctx.measureText(label).width
      const textHeight = 12
      const padding = 4
      
      ctx.beginPath()
      ctx.setFillStyle('rgba(255, 255, 255, 0.9)')
      ctx.fillRect(
        point.x - textWidth/2 - padding,
        point.y - textHeight - padding - 8, // 增加上移距离
        textWidth + padding * 2,
        textHeight + padding * 2
      )

      // 绘制标签文字
      ctx.setFillStyle('#333')
      ctx.setTextAlign('center')
      ctx.fillText(label, point.x, point.y - 10) // 增加上移距离
    })

    ctx.draw()
  },

  // 体重输入处理
  onWeightInput(e) {
    this.setData({
      weight: e.detail.value
    })
  },

  // 日期选择处理
  onDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },

  // 备注输入处理
  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    })
  },

  // 月份选择处理
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

    // 检查是否已存在当天的记录
    const records = storage.getWeightRecords() || []
    const existingRecord = records.find(r => r.date.split('T')[0] === date)
    
    if (existingRecord) {
      // 如果存在当天的记录，显示确认对话框
      wx.showModal({
        title: '提示',
        content: '今天已经记录过啦，当前修改会覆盖今天的记录，确定要继续吗？',
        success: (res) => {
          if (res.confirm) {
            // 用户点击确定，更新记录
            record.id = existingRecord.id
            if (storage.updateWeightRecord(record)) {
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
          }
        }
      })
      return
    }

    // 保存新记录
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
      content: '确定要删除这条记录吗？删除后无法恢复。',
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