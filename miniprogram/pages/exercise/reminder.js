const storage = require('../../utils/storage.js');

Page({
  data: {
    enabled: false,
    time: '08:00',
    weekdays: [
      { day: 1, name: '一', selected: false },
      { day: 2, name: '二', selected: false },
      { day: 3, name: '三', selected: false },
      { day: 4, name: '四', selected: false },
      { day: 5, name: '五', selected: false },
      { day: 6, name: '六', selected: false },
      { day: 0, name: '日', selected: false }
    ],
    message: '该运动啦！',
    reminders: [],
    weekdayNames: ['日', '一', '二', '三', '四', '五', '六']
  },

  onLoad() {
    this.loadReminders();
  },

  // 加载提醒列表
  loadReminders() {
    const reminders = storage.getExerciseReminders() || [];
    this.setData({ reminders });
  },

  // 开关切换
  onEnableChange(e) {
    this.setData({
      enabled: e.detail.value
    });
  },

  // 时间选择
  onTimeChange(e) {
    this.setData({
      time: e.detail.value
    });
  },

  // 切换星期选择
  toggleWeekday(e) {
    const index = e.currentTarget.dataset.index;
    const weekdays = this.data.weekdays;
    weekdays[index].selected = !weekdays[index].selected;
    this.setData({ weekdays });
  },

  // 提醒内容输入
  onMessageInput(e) {
    this.setData({
      message: e.detail.value
    });
  },

  // 保存提醒
  saveReminder() {
    const selectedWeekdays = this.data.weekdays
      .filter(w => w.selected)
      .map(w => w.day);

    if (selectedWeekdays.length === 0) {
      wx.showToast({
        title: '请选择重复日期',
        icon: 'none'
      });
      return;
    }

    const reminder = {
      id: Date.now().toString(),
      time: this.data.time,
      weekdays: selectedWeekdays,
      message: this.data.message
    };

    const reminders = [...this.data.reminders, reminder];
    storage.setExerciseReminders(reminders);

    // 设置系统提醒
    this.setSystemReminder(reminder);

    this.setData({
      reminders,
      enabled: false,
      time: '08:00',
      weekdays: this.data.weekdays.map(w => ({ ...w, selected: false })),
      message: '该运动啦！'
    });

    wx.showToast({
      title: '提醒设置成功',
      icon: 'success'
    });
  },

  // 设置系统提醒
  setSystemReminder(reminder) {
    // 获取当前日期
    const now = new Date();
    const [hours, minutes] = reminder.time.split(':').map(Number);
    
    // 设置提醒时间
    const reminderTime = new Date(now);
    reminderTime.setHours(hours, minutes, 0, 0);

    // 如果提醒时间已过，设置为明天
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    // 设置系统提醒
    wx.requestSubscribeMessage({
      tmplIds: ['your-template-id'], // 需要替换为实际的模板ID
      success: (res) => {
        if (res['your-template-id'] === 'accept') {
          // 用户同意接收提醒
          console.log('用户同意接收提醒');
        }
      }
    });
  },

  // 删除提醒
  deleteReminder(e) {
    const id = e.currentTarget.dataset.id;
    const reminders = this.data.reminders.filter(r => r.id !== id);
    
    storage.setExerciseReminders(reminders);
    this.setData({ reminders });

    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  }
}); 