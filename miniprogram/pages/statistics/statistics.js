const storage = require('../../utils/storage.js');
const theme = require('../../utils/theme.js');
const wxCharts = require('../../utils/wxcharts.js');

Page({
  data: {
    startDate: '',
    endDate: '',
    totalExerciseTime: '0分钟',
    totalCalories: '0千卡',
    weightChange: '0kg',
    mostFrequentExercise: '暂无数据',
    averageExerciseTime: '0分钟',
    averageCalorieIntake: '0千卡',
    weightTrend: '暂无数据'
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

    this.loadData();
  },

  // 加载数据
  loadData() {
    const { startDate, endDate } = this.data;
    const exerciseRecords = this.filterByDateRange(storage.getExerciseRecords() || [], startDate, endDate);
    const dietRecords = this.filterByDateRange(storage.getDietRecords() || [], startDate, endDate);
    const weightRecords = this.filterByDateRange(storage.getWeightRecords() || [], startDate, endDate);

    this.calculateOverview(exerciseRecords, dietRecords, weightRecords);
    this.drawExerciseCharts(exerciseRecords);
    this.drawDietCharts(dietRecords);
    this.drawWeightCharts(weightRecords);
    this.calculateSummary(exerciseRecords, dietRecords, weightRecords);
  },

  // 按日期范围过滤数据
  filterByDateRange(records, startDate, endDate) {
    return records.filter(record => {
      const recordDate = new Date(record.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return recordDate >= start && recordDate <= end;
    });
  },

  // 计算概览数据
  calculateOverview(exerciseRecords, dietRecords, weightRecords) {
    // 计算总运动时长
    const totalExerciseTime = exerciseRecords.reduce((total, record) => total + record.duration, 0);
    
    // 计算总消耗卡路里
    const totalCalories = exerciseRecords.reduce((total, record) => total + record.calories, 0);
    
    // 计算体重变化
    let weightChange = 0;
    if (weightRecords.length >= 2) {
      const firstWeight = weightRecords[0].weight;
      const lastWeight = weightRecords[weightRecords.length - 1].weight;
      weightChange = (lastWeight - firstWeight).toFixed(1);
    }

    this.setData({
      totalExerciseTime: `${totalExerciseTime}分钟`,
      totalCalories: `${totalCalories}千卡`,
      weightChange: `${weightChange}kg`
    });
  },

  // 绘制运动数据图表
  drawExerciseCharts(exerciseRecords) {
    // 运动时长趋势图
    const timeData = this.groupByDate(exerciseRecords, 'duration');
    new wxCharts({
      canvasId: 'exerciseTimeChart',
      type: 'line',
      categories: timeData.dates,
      series: [{
        name: '运动时长',
        data: timeData.values,
        format: val => val + '分钟'
      }],
      yAxis: {
        title: '时长(分钟)',
        format: val => val
      },
      width: 320,
      height: 200
    });

    // 运动类型分布图
    const typeData = this.groupByType(exerciseRecords);
    new wxCharts({
      canvasId: 'exerciseTypeChart',
      type: 'pie',
      series: typeData.map(item => ({
        name: item.type,
        data: item.duration
      })),
      width: 320,
      height: 200
    });

    // 运动强度分布图
    const intensityData = this.groupByIntensity(exerciseRecords);
    new wxCharts({
      canvasId: 'exerciseIntensityChart',
      type: 'pie',
      series: intensityData.map(item => ({
        name: item.intensity,
        data: item.count
      })),
      width: 320,
      height: 200
    });
  },

  // 绘制饮食数据图表
  drawDietCharts(dietRecords) {
    // 卡路里摄入趋势图
    const calorieData = this.groupByDate(dietRecords, 'calories');
    new wxCharts({
      canvasId: 'calorieIntakeChart',
      type: 'line',
      categories: calorieData.dates,
      series: [{
        name: '卡路里',
        data: calorieData.values,
        format: val => val + '千卡'
      }],
      yAxis: {
        title: '卡路里(千卡)',
        format: val => val
      },
      width: 320,
      height: 200
    });

    // 餐次分布图
    const mealData = this.groupByMeal(dietRecords);
    new wxCharts({
      canvasId: 'mealDistributionChart',
      type: 'pie',
      series: mealData.map(item => ({
        name: item.meal,
        data: item.calories
      })),
      width: 320,
      height: 200
    });

    // 营养分布图
    const nutritionData = this.calculateNutrition(dietRecords);
    new wxCharts({
      canvasId: 'nutritionChart',
      type: 'pie',
      series: [
        { name: '蛋白质', data: nutritionData.protein },
        { name: '脂肪', data: nutritionData.fat },
        { name: '碳水化合物', data: nutritionData.carbs }
      ],
      width: 320,
      height: 200
    });
  },

  // 绘制体重数据图表
  drawWeightCharts(weightRecords) {
    // 体重趋势图
    const weightData = this.groupByDate(weightRecords, 'weight');
    new wxCharts({
      canvasId: 'weightTrendChart',
      type: 'line',
      categories: weightData.dates,
      series: [{
        name: '体重',
        data: weightData.values,
        format: val => val + 'kg'
      }],
      yAxis: {
        title: '体重(kg)',
        format: val => val
      },
      width: 320,
      height: 200
    });

    // BMI趋势图
    const bmiData = this.groupByDate(weightRecords, 'bmi');
    new wxCharts({
      canvasId: 'bmiChart',
      type: 'line',
      categories: bmiData.dates,
      series: [{
        name: 'BMI',
        data: bmiData.values,
        format: val => val.toFixed(1)
      }],
      yAxis: {
        title: 'BMI',
        format: val => val
      },
      width: 320,
      height: 200
    });
  },

  // 计算数据总结
  calculateSummary(exerciseRecords, dietRecords, weightRecords) {
    // 最常进行的运动
    const exerciseTypes = this.groupByType(exerciseRecords);
    const mostFrequentExercise = exerciseTypes.length > 0 ? 
      exerciseTypes[0].type : '暂无数据';

    // 平均每日运动时长
    const totalExerciseTime = exerciseRecords.reduce((total, record) => total + record.duration, 0);
    const averageExerciseTime = exerciseRecords.length > 0 ? 
      Math.round(totalExerciseTime / exerciseRecords.length) : 0;

    // 平均每日卡路里摄入
    const totalCalories = dietRecords.reduce((total, record) => total + record.calories, 0);
    const averageCalorieIntake = dietRecords.length > 0 ? 
      Math.round(totalCalories / dietRecords.length) : 0;

    // 体重变化趋势
    let weightTrend = '暂无数据';
    if (weightRecords.length >= 2) {
      const firstWeight = weightRecords[0].weight;
      const lastWeight = weightRecords[weightRecords.length - 1].weight;
      const change = lastWeight - firstWeight;
      if (change > 0) {
        weightTrend = '上升';
      } else if (change < 0) {
        weightTrend = '下降';
      } else {
        weightTrend = '稳定';
      }
    }

    this.setData({
      mostFrequentExercise,
      averageExerciseTime: `${averageExerciseTime}分钟`,
      averageCalorieIntake: `${averageCalorieIntake}千卡`,
      weightTrend
    });
  },

  // 按日期分组数据
  groupByDate(records, field) {
    const grouped = {};
    records.forEach(record => {
      if (!grouped[record.date]) {
        grouped[record.date] = 0;
      }
      grouped[record.date] += record[field];
    });

    return {
      dates: Object.keys(grouped),
      values: Object.values(grouped)
    };
  },

  // 按类型分组数据
  groupByType(records) {
    const grouped = {};
    records.forEach(record => {
      if (!grouped[record.type]) {
        grouped[record.type] = 0;
      }
      grouped[record.type] += record.duration;
    });

    return Object.entries(grouped)
      .map(([type, duration]) => ({ type, duration }))
      .sort((a, b) => b.duration - a.duration);
  },

  // 按强度分组数据
  groupByIntensity(records) {
    const grouped = {};
    records.forEach(record => {
      if (!grouped[record.intensity]) {
        grouped[record.intensity] = 0;
      }
      grouped[record.intensity]++;
    });

    return Object.entries(grouped)
      .map(([intensity, count]) => ({ intensity, count }))
      .sort((a, b) => b.count - a.count);
  },

  // 按餐次分组数据
  groupByMeal(records) {
    const grouped = {};
    records.forEach(record => {
      if (!grouped[record.meal]) {
        grouped[record.meal] = 0;
      }
      grouped[record.meal] += record.calories;
    });

    return Object.entries(grouped)
      .map(([meal, calories]) => ({ meal, calories }))
      .sort((a, b) => b.calories - a.calories);
  },

  // 计算营养分布
  calculateNutrition(records) {
    const nutrition = {
      protein: 0,
      fat: 0,
      carbs: 0
    };

    records.forEach(record => {
      nutrition.protein += record.protein || 0;
      nutrition.fat += record.fat || 0;
      nutrition.carbs += record.carbs || 0;
    });

    return nutrition;
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 日期选择
  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value });
    this.loadData();
  },

  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value });
    this.loadData();
  }
}); 