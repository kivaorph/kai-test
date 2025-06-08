const storage = require('../../utils/storage.js');
const theme = require('../../utils/theme.js');

Page({
  data: {
    settings: {
      weightReminder: true,
      dietReminder: true,
      exerciseReminder: true,
      weightUnitIndex: 0,
      distanceUnitIndex: 0,
      darkMode: false,
      themeColor: '#1AAD19'
    },
    weightUnits: ['千克(kg)', '磅(lb)'],
    distanceUnits: ['公里(km)', '英里(mi)'],
    version: '1.0.0',
    themeColors: theme.customColors
  },

  onLoad() {
    this.loadSettings();
  },

  // 加载设置
  loadSettings() {
    const settings = storage.getSettings() || this.data.settings;
    this.setData({ settings });
  },

  // 保存设置
  saveSettings() {
    storage.setSettings(this.data.settings);
  },

  // 切换体重提醒
  toggleWeightReminder(e) {
    this.setData({
      'settings.weightReminder': e.detail.value
    });
    this.saveSettings();
  },

  // 切换饮食提醒
  toggleDietReminder(e) {
    this.setData({
      'settings.dietReminder': e.detail.value
    });
    this.saveSettings();
  },

  // 切换运动提醒
  toggleExerciseReminder(e) {
    this.setData({
      'settings.exerciseReminder': e.detail.value
    });
    this.saveSettings();
  },

  // 切换深色模式
  toggleDarkMode(e) {
    const isDark = e.detail.value;
    this.setData({
      'settings.darkMode': isDark
    });
    this.saveSettings();
    theme.toggleDarkMode(isDark);
  },

  // 更改体重单位
  changeWeightUnit(e) {
    this.setData({
      'settings.weightUnitIndex': e.detail.value
    });
    this.saveSettings();
  },

  // 更改距离单位
  changeDistanceUnit(e) {
    this.setData({
      'settings.distanceUnitIndex': e.detail.value
    });
    this.saveSettings();
  },

  // 更改主题颜色
  changeThemeColor(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({
      'settings.themeColor': color
    });
    this.saveSettings();
    theme.changeThemeColor(color);
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '提示',
      content: '确定要清除缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage({
            success: () => {
              wx.showToast({
                title: '清除成功',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  // 重置数据
  resetData() {
    wx.showModal({
      title: '警告',
      content: '确定要重置所有数据吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          // 清除所有数据
          wx.clearStorage({
            success: () => {
              // 重置设置
              this.setData({
                settings: {
                  weightReminder: true,
                  dietReminder: true,
                  exerciseReminder: true,
                  weightUnitIndex: 0,
                  distanceUnitIndex: 0,
                  darkMode: false,
                  themeColor: '#1AAD19'
                }
              });
              this.saveSettings();
              theme.applyTheme();

              wx.showToast({
                title: '重置成功',
                icon: 'success'
              });

              // 返回首页
              setTimeout(() => {
                wx.reLaunch({
                  url: '/pages/index/index'
                });
              }, 1500);
            }
          });
        }
      }
    });
  },

  // 检查更新
  checkUpdate() {
    const updateManager = wx.getUpdateManager();
    
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      } else {
        wx.showToast({
          title: '已是最新版本',
          icon: 'success'
        });
      }
    });

    updateManager.onUpdateFailed(() => {
      wx.showToast({
        title: '更新失败',
        icon: 'error'
      });
    });
  }
}); 