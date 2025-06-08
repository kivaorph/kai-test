const storage = require('../../utils/storage.js');
const calculator = require('../../utils/calculator.js');

Page({
  data: {
    weeklyPlan: 0,
    completedTime: 0,
    completionRate: 0,
    exerciseTypes: [],
    selectedType: null,
    duration: '',
    intensity: 0,
    intensityLevels: ['低强度', '中强度', '高强度'],
    weekdays: [
      { day: 1, name: '一', selected: false },
      { day: 2, name: '二', selected: false },
      { day: 3, name: '三', selected: false },
      { day: 4, name: '四', selected: false },
      { day: 5, name: '五', selected: false },
      { day: 6, name: '六', selected: false },
      { day: 0, name: '日', selected: false }
    ],
    plans: [],
    weekdayNames: ['日', '一', '二', '三', '四', '五', '六']
  },

  onLoad() {
    this.loadExerciseTypes();
    this.loadPlans();
    this.calculateProgress();
  },

  // 加载运动类型
  loadExerciseTypes() {
    const types = storage.getExerciseTypes() || [];
    this.setData({ exerciseTypes: types });
  },

  // 加载运动计划
  loadPlans() {
    const plans = storage.getExercisePlans() || [];
    this.setData({ plans });
  },

  // 计算进度
  calculateProgress() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // 获取本周计划总时长
    const weeklyPlan = this.data.plans.reduce((total, plan) => {
      const planDays = plan.weekdays.filter(day => {
        const planDate = new Date(weekStart);
        planDate.setDate(weekStart.getDate() + day);
        return planDate >= weekStart && planDate < weekEnd;
      });
      return total + (plan.duration * planDays.length);
    }, 0);

    // 获取本周已完成时长
    const records = storage.getExerciseRecords() || [];
    const completedTime = records.reduce((total, record) => {
      const recordDate = new Date(record.date);
      if (recordDate >= weekStart && recordDate < weekEnd) {
        return total + record.duration;
      }
      return total;
    }, 0);

    // 计算完成率
    const completionRate = weeklyPlan > 0 ? Math.round((completedTime / weeklyPlan) * 100) : 0;

    this.setData({
      weeklyPlan,
      completedTime,
      completionRate
    });
  },

  // 运动类型选择
  onTypeChange(e) {
    const index = e.detail.value;
    this.setData({
      selectedType: this.data.exerciseTypes[index]
    });
  },

  // 运动时长输入
  onDurationInput(e) {
    this.setData({
      duration: e.detail.value
    });
  },

  // 运动强度选择
  onIntensityChange(e) {
    this.setData({
      intensity: parseInt(e.detail.value)
    });
  },

  // 切换星期选择
  toggleWeekday(e) {
    const index = e.currentTarget.dataset.index;
    const weekdays = this.data.weekdays;
    weekdays[index].selected = !weekdays[index].selected;
    this.setData({ weekdays });
  },

  // 保存计划
  savePlan() {
    if (!this.data.selectedType) {
      wx.showToast({
        title: '请选择运动类型',
        icon: 'none'
      });
      return;
    }

    if (!this.data.duration) {
      wx.showToast({
        title: '请输入运动时长',
        icon: 'none'
      });
      return;
    }

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

    const plan = {
      id: Date.now().toString(),
      type: this.data.selectedType,
      duration: parseInt(this.data.duration),
      intensity: this.data.intensity,
      weekdays: selectedWeekdays
    };

    const plans = [...this.data.plans, plan];
    storage.setExercisePlans(plans);

    this.setData({
      plans,
      selectedType: null,
      duration: '',
      intensity: 0,
      weekdays: this.data.weekdays.map(w => ({ ...w, selected: false }))
    });

    this.calculateProgress();

    wx.showToast({
      title: '计划保存成功',
      icon: 'success'
    });
  },

  // 编辑计划
  editPlan(e) {
    const id = e.currentTarget.dataset.id;
    const plan = this.data.plans.find(p => p.id === id);
    if (plan) {
      this.setData({
        selectedType: plan.type,
        duration: plan.duration.toString(),
        intensity: plan.intensity,
        weekdays: this.data.weekdays.map(w => ({
          ...w,
          selected: plan.weekdays.includes(w.day)
        }))
      });
    }
  },

  // 删除计划
  deletePlan(e) {
    const id = e.currentTarget.dataset.id;
    const plans = this.data.plans.filter(p => p.id !== id);
    
    storage.setExercisePlans(plans);
    this.setData({ plans });
    this.calculateProgress();

    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  }
}); 