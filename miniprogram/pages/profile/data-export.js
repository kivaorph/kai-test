const storage = require('../../utils/storage.js');

Page({
  data: {
    exportWeight: true,
    exportDiet: true,
    exportExercise: true,
    exportGoals: true,
    exportAchievements: true,
    startDate: '',
    endDate: '',
    exportFormat: 'excel',
    canExport: true,
    exportHistory: []
  },

  onLoad() {
    // 设置默认日期范围（最近30天）
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    this.setData({
      startDate: this.formatDate(start),
      endDate: this.formatDate(end)
    });

    this.loadExportHistory();
  },

  // 加载导出历史
  loadExportHistory() {
    const history = storage.getExportHistory() || [];
    this.setData({ exportHistory: history });
  },

  // 切换导出选项
  toggleWeight() {
    this.setData({ exportWeight: !this.data.exportWeight });
    this.checkCanExport();
  },

  toggleDiet() {
    this.setData({ exportDiet: !this.data.exportDiet });
    this.checkCanExport();
  },

  toggleExercise() {
    this.setData({ exportExercise: !this.data.exportExercise });
    this.checkCanExport();
  },

  toggleGoals() {
    this.setData({ exportGoals: !this.data.exportGoals });
    this.checkCanExport();
  },

  toggleAchievements() {
    this.setData({ exportAchievements: !this.data.exportAchievements });
    this.checkCanExport();
  },

  // 检查是否可以导出
  checkCanExport() {
    const canExport = this.data.exportWeight || 
                     this.data.exportDiet || 
                     this.data.exportExercise || 
                     this.data.exportGoals || 
                     this.data.exportAchievements;
    this.setData({ canExport });
  },

  // 日期选择
  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value });
  },

  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value });
  },

  // 选择导出格式
  selectFormat(e) {
    const format = e.currentTarget.dataset.format;
    this.setData({ exportFormat: format });
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 导出数据
  exportData() {
    if (!this.data.canExport) return;

    wx.showLoading({
      title: '正在导出...'
    });

    // 收集要导出的数据
    const exportData = {};

    if (this.data.exportWeight) {
      const weightRecords = storage.getWeightRecords() || [];
      exportData.weight = this.filterByDateRange(weightRecords);
    }

    if (this.data.exportDiet) {
      const dietRecords = storage.getDietRecords() || [];
      exportData.diet = this.filterByDateRange(dietRecords);
    }

    if (this.data.exportExercise) {
      const exerciseRecords = storage.getExerciseRecords() || [];
      exportData.exercise = this.filterByDateRange(exerciseRecords);
    }

    if (this.data.exportGoals) {
      exportData.goals = storage.getGoals();
    }

    if (this.data.exportAchievements) {
      exportData.achievements = storage.getAchievements();
    }

    // 根据选择的格式处理数据
    let fileContent = '';
    let fileType = '';
    let fileName = '';

    switch (this.data.exportFormat) {
      case 'excel':
        fileContent = this.convertToExcel(exportData);
        fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileName = `健康数据_${this.formatDate(new Date())}.xlsx`;
        break;
      case 'csv':
        fileContent = this.convertToCSV(exportData);
        fileType = 'text/csv';
        fileName = `健康数据_${this.formatDate(new Date())}.csv`;
        break;
      case 'json':
        fileContent = JSON.stringify(exportData, null, 2);
        fileType = 'application/json';
        fileName = `健康数据_${this.formatDate(new Date())}.json`;
        break;
    }

    // 保存文件
    this.saveFile(fileContent, fileName, fileType);

    // 更新导出历史
    const history = {
      id: Date.now().toString(),
      date: this.formatDate(new Date()),
      format: this.data.exportFormat,
      fileName: fileName
    };

    const exportHistory = [history, ...this.data.exportHistory];
    storage.setExportHistory(exportHistory);
    this.setData({ exportHistory });

    wx.hideLoading();
  },

  // 按日期范围过滤数据
  filterByDateRange(records) {
    return records.filter(record => {
      const recordDate = new Date(record.date);
      const startDate = new Date(this.data.startDate);
      const endDate = new Date(this.data.endDate);
      return recordDate >= startDate && recordDate <= endDate;
    });
  },

  // 转换为Excel格式
  convertToExcel(data) {
    // 创建工作表数据
    const sheets = [];
    
    // 体重数据
    if (data.weight && data.weight.length > 0) {
      sheets.push({
        name: '体重记录',
        data: [
          ['日期', '体重(kg)', 'BMI', '备注'],
          ...data.weight.map(record => [
            record.date,
            record.weight,
            record.bmi,
            record.note || ''
          ])
        ]
      });
    }

    // 饮食数据
    if (data.diet && data.diet.length > 0) {
      sheets.push({
        name: '饮食记录',
        data: [
          ['日期', '时间', '食物', '卡路里', '备注'],
          ...data.diet.map(record => [
            record.date,
            record.time,
            record.food,
            record.calories,
            record.note || ''
          ])
        ]
      });
    }

    // 运动数据
    if (data.exercise && data.exercise.length > 0) {
      sheets.push({
        name: '运动记录',
        data: [
          ['日期', '时间', '运动类型', '时长(分钟)', '强度', '消耗卡路里', '备注'],
          ...data.exercise.map(record => [
            record.date,
            record.time,
            record.type,
            record.duration,
            record.intensity,
            record.calories,
            record.note || ''
          ])
        ]
      });
    }

    // 目标数据
    if (data.goals) {
      sheets.push({
        name: '目标设置',
        data: [
          ['目标类型', '目标值', '开始日期', '目标日期', '状态'],
          ['体重目标', data.goals.weight, data.goals.startDate, data.goals.targetDate, data.goals.status],
          ['运动目标', data.goals.exercise, data.goals.startDate, data.goals.targetDate, data.goals.status],
          ['饮食目标', data.goals.diet, data.goals.startDate, data.goals.targetDate, data.goals.status]
        ]
      });
    }

    // 成就数据
    if (data.achievements) {
      sheets.push({
        name: '成就记录',
        data: [
          ['成就名称', '描述', '获得日期', '状态'],
          ...data.achievements.map(achievement => [
            achievement.name,
            achievement.description,
            achievement.date || '',
            achievement.unlocked ? '已获得' : '未获得'
          ])
        ]
      });
    }

    // 将数据转换为Excel格式
    // 注意：这里需要引入第三方库来处理Excel文件
    // 例如：xlsx.js
    return JSON.stringify(sheets);
  },

  // 转换为CSV格式
  convertToCSV(data) {
    const csvData = [];

    // 体重数据
    if (data.weight && data.weight.length > 0) {
      csvData.push('=== 体重记录 ===');
      csvData.push('日期,体重(kg),BMI,备注');
      data.weight.forEach(record => {
        csvData.push(`${record.date},${record.weight},${record.bmi},${record.note || ''}`);
      });
      csvData.push('');
    }

    // 饮食数据
    if (data.diet && data.diet.length > 0) {
      csvData.push('=== 饮食记录 ===');
      csvData.push('日期,时间,食物,卡路里,备注');
      data.diet.forEach(record => {
        csvData.push(`${record.date},${record.time},${record.food},${record.calories},${record.note || ''}`);
      });
      csvData.push('');
    }

    // 运动数据
    if (data.exercise && data.exercise.length > 0) {
      csvData.push('=== 运动记录 ===');
      csvData.push('日期,时间,运动类型,时长(分钟),强度,消耗卡路里,备注');
      data.exercise.forEach(record => {
        csvData.push(`${record.date},${record.time},${record.type},${record.duration},${record.intensity},${record.calories},${record.note || ''}`);
      });
      csvData.push('');
    }

    // 目标数据
    if (data.goals) {
      csvData.push('=== 目标设置 ===');
      csvData.push('目标类型,目标值,开始日期,目标日期,状态');
      csvData.push(`体重目标,${data.goals.weight},${data.goals.startDate},${data.goals.targetDate},${data.goals.status}`);
      csvData.push(`运动目标,${data.goals.exercise},${data.goals.startDate},${data.goals.targetDate},${data.goals.status}`);
      csvData.push(`饮食目标,${data.goals.diet},${data.goals.startDate},${data.goals.targetDate},${data.goals.status}`);
      csvData.push('');
    }

    // 成就数据
    if (data.achievements) {
      csvData.push('=== 成就记录 ===');
      csvData.push('成就名称,描述,获得日期,状态');
      data.achievements.forEach(achievement => {
        csvData.push(`${achievement.name},${achievement.description},${achievement.date || ''},${achievement.unlocked ? '已获得' : '未获得'}`);
      });
    }

    return csvData.join('\n');
  },

  // 保存文件
  saveFile(content, fileName, fileType) {
    // 将内容转换为ArrayBuffer
    const encoder = new TextEncoder();
    const buffer = encoder.encode(content);

    // 保存文件
    wx.saveFile({
      tempFilePath: buffer,
      success: (res) => {
        const savedFilePath = res.savedFilePath;
        
        // 打开文件
        wx.openDocument({
          filePath: savedFilePath,
          fileType: fileType,
          success: () => {
            wx.showToast({
              title: '导出成功',
              icon: 'success'
            });
          },
          fail: () => {
            wx.showToast({
              title: '打开文件失败',
              icon: 'error'
            });
          }
        });
      },
      fail: () => {
        wx.showToast({
          title: '保存文件失败',
          icon: 'error'
        });
      }
    });
  },

  // 下载文件
  downloadFile(e) {
    const id = e.currentTarget.dataset.id;
    const file = this.data.exportHistory.find(h => h.id === id);
    if (file) {
      wx.downloadFile({
        url: file.url,
        success: (res) => {
          if (res.statusCode === 200) {
            wx.openDocument({
              filePath: res.tempFilePath,
              success: () => {
                wx.showToast({
                  title: '下载成功',
                  icon: 'success'
                });
              }
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '下载失败',
            icon: 'error'
          });
        }
      });
    }
  },

  // 删除历史记录
  deleteHistory(e) {
    const id = e.currentTarget.dataset.id;
    const exportHistory = this.data.exportHistory.filter(h => h.id !== id);
    storage.setExportHistory(exportHistory);
    this.setData({ exportHistory });
  }
}); 