// 性能监控工具
const performance = {
  // 页面加载时间统计
  pageLoadTimes: {},
  
  // 开始记录页面加载时间
  startPageLoad(pagePath) {
    this.pageLoadTimes[pagePath] = {
      startTime: Date.now(),
      endTime: null,
      duration: null
    };
  },
  
  // 结束记录页面加载时间
  endPageLoad(pagePath) {
    if (this.pageLoadTimes[pagePath]) {
      this.pageLoadTimes[pagePath].endTime = Date.now();
      this.pageLoadTimes[pagePath].duration = 
        this.pageLoadTimes[pagePath].endTime - this.pageLoadTimes[pagePath].startTime;
      
      // 如果加载时间超过3秒，记录到日志
      if (this.pageLoadTimes[pagePath].duration > 3000) {
        console.warn(`页面 ${pagePath} 加载时间过长: ${this.pageLoadTimes[pagePath].duration}ms`);
      }
    }
  },
  
  // 记录API调用时间
  async measureApiCall(apiName, apiCall) {
    const startTime = Date.now();
    try {
      const result = await apiCall();
      const duration = Date.now() - startTime;
      
      // 如果API调用时间超过1秒，记录到日志
      if (duration > 1000) {
        console.warn(`API ${apiName} 调用时间过长: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`API ${apiName} 调用失败，耗时: ${duration}ms`, error);
      throw error;
    }
  },
  
  // 记录内存使用情况
  checkMemoryUsage() {
    if (wx.getPerformance) {
      const performance = wx.getPerformance();
      const memory = performance.memory;
      if (memory) {
        const usedJSHeapSize = memory.usedJSHeapSize;
        const totalJSHeapSize = memory.totalJSHeapSize;
        const jsHeapSizeLimit = memory.jsHeapSizeLimit;
        
        // 如果内存使用超过80%，记录警告
        if (usedJSHeapSize / totalJSHeapSize > 0.8) {
          console.warn('内存使用率过高:', {
            used: usedJSHeapSize,
            total: totalJSHeapSize,
            limit: jsHeapSizeLimit
          });
        }
      }
    }
  },
  
  // 记录页面渲染性能
  measurePageRender(pagePath, renderStartTime) {
    const renderTime = Date.now() - renderStartTime;
    if (renderTime > 1000) {
      console.warn(`页面 ${pagePath} 渲染时间过长: ${renderTime}ms`);
    }
  },
  
  // 清理性能数据
  clearPerformanceData() {
    this.pageLoadTimes = {};
  }
};

module.exports = performance; 