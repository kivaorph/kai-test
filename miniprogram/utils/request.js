const performance = require('./performance.js');
const cache = require('./cache.js');
const error = require('./error.js');

// 网络请求工具
const request = {
  // 基础配置
  config: {
    baseUrl: 'https://api.example.com', // 替换为实际的API地址
    timeout: 10000, // 10秒超时
    retryTimes: 3, // 重试次数
    retryDelay: 1000, // 重试延迟（毫秒）
    enableCache: true, // 是否启用缓存
    cacheTime: 5 * 60 * 1000 // 缓存时间（5分钟）
  },
  
  // 请求队列
  queue: new Map(),
  
  // 发送请求
  async send(options) {
    const {
      url,
      method = 'GET',
      data,
      headers = {},
      useCache = this.config.enableCache,
      cacheTime = this.config.cacheTime,
      retry = this.config.retryTimes
    } = options;
    
    // 生成缓存键
    const cacheKey = `${method}:${url}:${JSON.stringify(data)}`;
    
    // 检查缓存
    if (useCache && method === 'GET') {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // 检查请求是否已经在队列中
    if (this.queue.has(cacheKey)) {
      return this.queue.get(cacheKey);
    }
    
    // 创建请求Promise
    const requestPromise = this._createRequest({
      url,
      method,
      data,
      headers,
      cacheKey,
      cacheTime,
      retry
    });
    
    // 将请求添加到队列
    this.queue.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // 请求完成后从队列中移除
      this.queue.delete(cacheKey);
    }
  },
  
  // 创建请求
  async _createRequest(options) {
    const {
      url,
      method,
      data,
      headers,
      cacheKey,
      cacheTime,
      retry
    } = options;
    
    let lastError;
    
    // 重试机制
    for (let i = 0; i <= retry; i++) {
      try {
        // 测量API调用时间
        const result = await performance.measureApiCall(
          `${method} ${url}`,
          () => this._makeRequest(url, method, data, headers)
        );
        
        // 缓存GET请求的结果
        if (method === 'GET' && this.config.enableCache) {
          cache.set(cacheKey, result, cacheTime);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // 如果不是最后一次重试，则等待后继续
        if (i < retry) {
          await new Promise(resolve => 
            setTimeout(resolve, this.config.retryDelay * (i + 1))
          );
        }
      }
    }
    
    // 所有重试都失败后，抛出错误
    throw lastError;
  },
  
  // 发起实际请求
  _makeRequest(url, method, data, headers) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.config.baseUrl + url,
        method,
        data,
        header: {
          'content-type': 'application/json',
          ...headers
        },
        timeout: this.config.timeout,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          reject(new Error(`网络错误: ${err.errMsg}`));
        }
      });
    });
  },
  
  // 设置配置
  setConfig(config) {
    this.config = {
      ...this.config,
      ...config
    };
  },
  
  // 取消所有请求
  cancelAll() {
    this.queue.clear();
  },
  
  // 获取请求队列状态
  getQueueStatus() {
    return {
      size: this.queue.size,
      pending: Array.from(this.queue.keys())
    };
  }
};

module.exports = request; 