// 错误处理工具
const error = {
  // 错误类型
  types: {
    NETWORK: 'NETWORK_ERROR',
    API: 'API_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    STORAGE: 'STORAGE_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR'
  },
  
  // 错误日志
  logs: [],
  
  // 最大日志数量
  maxLogs: 100,
  
  // 处理错误
  handle(error, type = this.types.UNKNOWN) {
    // 记录错误
    this.log({
      type,
      message: error.message || '未知错误',
      stack: error.stack,
      time: new Date().toISOString()
    });
    
    // 根据错误类型显示不同的提示
    switch (type) {
      case this.types.NETWORK:
        wx.showToast({
          title: '网络连接失败，请检查网络设置',
          icon: 'none',
          duration: 2000
        });
        break;
        
      case this.types.API:
        wx.showToast({
          title: '服务器响应错误，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        break;
        
      case this.types.VALIDATION:
        wx.showToast({
          title: error.message || '输入数据有误',
          icon: 'none',
          duration: 2000
        });
        break;
        
      case this.types.STORAGE:
        wx.showToast({
          title: '数据存储失败，请重试',
          icon: 'none',
          duration: 2000
        });
        break;
        
      default:
        wx.showToast({
          title: '发生未知错误，请重试',
          icon: 'none',
          duration: 2000
        });
    }
    
    // 在开发环境下打印详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('错误详情:', {
        type,
        error
      });
    }
  },
  
  // 记录错误日志
  log(errorLog) {
    this.logs.unshift(errorLog);
    
    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    
    // 保存到本地存储
    this.saveLogs();
  },
  
  // 保存错误日志到本地存储
  saveLogs() {
    try {
      wx.setStorageSync('error_logs', this.logs);
    } catch (error) {
      console.error('保存错误日志失败:', error);
    }
  },
  
  // 加载错误日志
  loadLogs() {
    try {
      const logs = wx.getStorageSync('error_logs');
      if (logs) {
        this.logs = logs;
      }
    } catch (error) {
      console.error('加载错误日志失败:', error);
    }
  },
  
  // 清空错误日志
  clearLogs() {
    this.logs = [];
    try {
      wx.removeStorageSync('error_logs');
    } catch (error) {
      console.error('清空错误日志失败:', error);
    }
  },
  
  // 获取错误日志
  getLogs() {
    return this.logs;
  },
  
  // 获取错误统计信息
  getStats() {
    const stats = {
      total: this.logs.length,
      byType: {}
    };
    
    this.logs.forEach(log => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
    });
    
    return stats;
  }
};

// 初始化时加载错误日志
error.loadLogs();

module.exports = error; 