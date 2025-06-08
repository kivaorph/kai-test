// 数据缓存管理工具
const cache = {
  // 缓存配置
  config: {
    // 默认缓存时间（毫秒）
    defaultExpireTime: 5 * 60 * 1000, // 5分钟
    
    // 最大缓存数量
    maxCacheSize: 100,
    
    // 缓存清理阈值（当缓存数量超过此值时触发清理）
    cleanupThreshold: 80
  },
  
  // 缓存数据
  data: new Map(),
  
  // 设置缓存
  set(key, value, expireTime = this.config.defaultExpireTime) {
    // 检查缓存大小
    if (this.data.size >= this.config.cleanupThreshold) {
      this.cleanup();
    }
    
    const cacheItem = {
      value,
      expireTime: Date.now() + expireTime
    };
    
    this.data.set(key, cacheItem);
  },
  
  // 获取缓存
  get(key) {
    const cacheItem = this.data.get(key);
    
    if (!cacheItem) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() > cacheItem.expireTime) {
      this.data.delete(key);
      return null;
    }
    
    return cacheItem.value;
  },
  
  // 删除缓存
  delete(key) {
    this.data.delete(key);
  },
  
  // 清理过期缓存
  cleanup() {
    const now = Date.now();
    
    // 删除过期数据
    for (const [key, value] of this.data.entries()) {
      if (now > value.expireTime) {
        this.data.delete(key);
      }
    }
    
    // 如果缓存数量仍然超过最大值，删除最旧的数据
    if (this.data.size > this.config.maxCacheSize) {
      const entries = Array.from(this.data.entries());
      entries.sort((a, b) => a[1].expireTime - b[1].expireTime);
      
      const deleteCount = this.data.size - this.config.maxCacheSize;
      for (let i = 0; i < deleteCount; i++) {
        this.data.delete(entries[i][0]);
      }
    }
  },
  
  // 清空所有缓存
  clear() {
    this.data.clear();
  },
  
  // 获取缓存统计信息
  getStats() {
    return {
      size: this.data.size,
      maxSize: this.config.maxCacheSize,
      cleanupThreshold: this.config.cleanupThreshold
    };
  },
  
  // 设置缓存配置
  setConfig(config) {
    this.config = {
      ...this.config,
      ...config
    };
  }
};

module.exports = cache; 