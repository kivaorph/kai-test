// 主题配置
const themes = {
  light: {
    primaryColor: '#1AAD19',
    backgroundColor: '#f7f7f7',
    cardBackgroundColor: '#ffffff',
    textColor: '#333333',
    secondaryTextColor: '#666666',
    borderColor: '#eeeeee',
    successColor: '#1AAD19',
    warningColor: '#ff9900',
    errorColor: '#ff4d4f',
    disabledColor: '#cccccc'
  },
  dark: {
    primaryColor: '#1AAD19',
    backgroundColor: '#1a1a1a',
    cardBackgroundColor: '#2c2c2c',
    textColor: '#ffffff',
    secondaryTextColor: '#999999',
    borderColor: '#3a3a3a',
    successColor: '#1AAD19',
    warningColor: '#ff9900',
    errorColor: '#ff4d4f',
    disabledColor: '#666666'
  }
};

// 自定义主题颜色
const customColors = {
  green: '#1AAD19',
  blue: '#10AEFF',
  purple: '#8A2BE2',
  orange: '#FF8C00',
  red: '#FF4D4F'
};

// 获取当前主题
function getCurrentTheme() {
  const settings = wx.getStorageSync('settings') || {};
  return settings.darkMode ? themes.dark : themes.light;
}

// 获取主题颜色
function getThemeColor() {
  const settings = wx.getStorageSync('settings') || {};
  return settings.themeColor || themes.light.primaryColor;
}

// 应用主题
function applyTheme() {
  const theme = getCurrentTheme();
  const primaryColor = getThemeColor();

  // 更新全局样式变量
  wx.setStorageSync('theme', {
    ...theme,
    primaryColor
  });

  // 触发主题更新事件
  const eventChannel = this.getOpenerEventChannel();
  if (eventChannel) {
    eventChannel.emit('themeChanged', {
      theme,
      primaryColor
    });
  }
}

// 切换深色模式
function toggleDarkMode(isDark) {
  const settings = wx.getStorageSync('settings') || {};
  settings.darkMode = isDark;
  wx.setStorageSync('settings', settings);
  applyTheme();
}

// 更改主题颜色
function changeThemeColor(color) {
  const settings = wx.getStorageSync('settings') || {};
  settings.themeColor = color;
  wx.setStorageSync('settings', settings);
  applyTheme();
}

module.exports = {
  themes,
  customColors,
  getCurrentTheme,
  getThemeColor,
  applyTheme,
  toggleDarkMode,
  changeThemeColor
}; 