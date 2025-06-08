const storage = require('./storage.js');

// 配置管理工具
const config = {
  // 默认配置
  defaults: {
    // 应用配置
    app: {
      name: '健康管理助手',
      version: '1.0.0',
      theme: 'light', // light/dark
      language: 'zh_CN'
    },
    
    // 用户配置
    user: {
      weightUnit: 'kg', // kg/lb
      heightUnit: 'cm', // cm/inch
      calorieUnit: 'kcal',
      distanceUnit: 'km', // km/mile
      timeFormat: '24h', // 12h/24h
      weekStartDay: 1 // 0-6, 0表示周日
    },
    
    // 运动配置
    exercise: {
      defaultDuration: 30, // 默认运动时长（分钟）
      defaultIntensity: 'medium', // 默认运动强度
      reminderEnabled: true, // 是否启用运动提醒
      reminderTime: '18:00', // 运动提醒时间
      autoRecord: true // 是否自动记录运动
    },
    
    // 饮食配置
    diet: {
      calorieGoal: 2000, // 每日卡路里目标
      mealReminder: true, // 是否启用饮食提醒
      mealTimes: {
        breakfast: '08:00',
        lunch: '12:00',
        dinner: '18:00'
      },
      waterReminder: true, // 是否启用喝水提醒
      waterGoal: 2000 // 每日饮水量（ml）
    },
    
    // 数据配置
    data: {
      autoBackup: true, // 是否自动备份
      backupFrequency: 'daily', // 备份频率
      dataRetention: 365, // 数据保留天数
      exportFormat: 'excel' // 导出格式
    },
    
    // 社交配置
    social: {
      privacyLevel: 'friends', // 隐私级别
      allowFriendRequests: true, // 是否允许好友请求
      showInRanking: true, // 是否在排行榜显示
      shareAchievements: true // 是否分享成就
    },
    
    // 通知配置
    notification: {
      enabled: true, // 是否启用通知
      sound: true, // 是否启用声音
      vibration: true, // 是否启用震动
      types: {
        achievement: true, // 成就通知
        reminder: true, // 提醒通知
        social: true, // 社交通知
        system: true // 系统通知
      }
    }
  },
  
  // 当前配置
  current: null,
  
  // 初始化配置
  init() {
    // 从存储中加载配置
    const savedConfig = storage.getConfig();
    if (savedConfig) {
      this.current = this.mergeConfig(this.defaults, savedConfig);
    } else {
      this.current = this.defaults;
      this.save();
    }
    return this.current;
  },
  
  // 获取配置
  get(key) {
    if (!this.current) {
      this.init();
    }
    return key ? this.getNestedValue(this.current, key) : this.current;
  },
  
  // 设置配置
  set(key, value) {
    if (!this.current) {
      this.init();
    }
    this.setNestedValue(this.current, key, value);
    this.save();
    return this.current;
  },
  
  // 重置配置
  reset() {
    this.current = this.defaults;
    this.save();
    return this.current;
  },
  
  // 保存配置
  save() {
    storage.setConfig(this.current);
  },
  
  // 合并配置
  mergeConfig(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        result[key] = this.mergeConfig(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  },
  
  // 获取嵌套值
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => 
      current && current[key] !== undefined ? current[key] : undefined, obj);
  },
  
  // 设置嵌套值
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  },
  
  // 获取主题配置
  getTheme() {
    return this.get('app.theme');
  },
  
  // 设置主题
  setTheme(theme) {
    return this.set('app.theme', theme);
  },
  
  // 获取语言配置
  getLanguage() {
    return this.get('app.language');
  },
  
  // 设置语言
  setLanguage(language) {
    return this.set('app.language', language);
  },
  
  // 获取单位配置
  getUnits() {
    return {
      weight: this.get('user.weightUnit'),
      height: this.get('user.heightUnit'),
      calorie: this.get('user.calorieUnit'),
      distance: this.get('user.distanceUnit')
    };
  },
  
  // 设置单位
  setUnits(units) {
    Object.entries(units).forEach(([key, value]) => {
      this.set(`user.${key}Unit`, value);
    });
    return this.current;
  },
  
  // 获取通知配置
  getNotificationSettings() {
    return this.get('notification');
  },
  
  // 设置通知
  setNotificationSettings(settings) {
    return this.set('notification', settings);
  },
  
  // 获取运动配置
  getExerciseSettings() {
    return this.get('exercise');
  },
  
  // 设置运动配置
  setExerciseSettings(settings) {
    return this.set('exercise', settings);
  },
  
  // 获取饮食配置
  getDietSettings() {
    return this.get('diet');
  },
  
  // 设置饮食配置
  setDietSettings(settings) {
    return this.set('diet', settings);
  },
  
  // 获取社交配置
  getSocialSettings() {
    return this.get('social');
  },
  
  // 设置社交配置
  setSocialSettings(settings) {
    return this.set('social', settings);
  }
};

module.exports = config; 