// 计算基础代谢率（BMR）
const calculateBMR = (weight, height, age, gender) => {
  // 使用Mifflin-St Jeor公式
  let bmr = 10 * weight + 6.25 * height - 5 * age
  return gender === 'male' ? bmr + 5 : bmr - 161
}

// 计算每日所需热量
const calculateDailyCalories = (bmr, activityLevel) => {
  const activityMultipliers = {
    sedentary: 1.2,      // 久坐不动
    light: 1.375,        // 轻度活动
    moderate: 1.55,      // 中度活动
    active: 1.725,       // 重度活动
    veryActive: 1.9      // 极重度活动
  }
  return Math.round(bmr * activityMultipliers[activityLevel])
}

// 计算减重所需热量
const calculateWeightLossCalories = (dailyCalories, weightLossGoal) => {
  // 1kg脂肪约等于7700卡路里
  const weeklyDeficit = weightLossGoal * 7700
  const dailyDeficit = weeklyDeficit / 7
  return Math.round(dailyCalories - dailyDeficit)
}

// 计算BMI
const calculateBMI = (weight, height) => {
  // 身高转换为米
  const heightInMeters = height / 100
  return (weight / (heightInMeters * heightInMeters)).toFixed(1)
}

// 获取BMI分类
const getBMICategory = (bmi) => {
  if (bmi < 18.5) return '偏瘦'
  if (bmi < 24) return '正常'
  if (bmi < 28) return '超重'
  return '肥胖'
}

// 运动强度系数（MET值）
const EXERCISE_MET = {
  walking: 3.5,        // 步行
  jogging: 7.0,       // 慢跑
  running: 9.8,       // 快跑
  swimming: 8.3,      // 游泳
  cycling: 7.5,       // 骑自行车
  basketball: 8.0,    // 打篮球
  badminton: 5.1,     // 打羽毛球
  yoga: 3.0,          // 瑜伽
  dancing: 4.5,       // 跳舞
  hiking: 6.0,        // 徒步
  tennis: 7.3,        // 网球
  weightlifting: 5.0  // 举重
}

// 计算运动消耗的热量
const calculateExerciseCalories = (weight, duration, exerciseType) => {
  const MET = EXERCISE_MET[exerciseType] || 3.5 // 默认使用步行强度
  // 消耗的热量 = MET * 体重(kg) * 时间(小时)
  return Math.round(MET * weight * (duration / 60))
}

// 计算运动强度等级
const calculateExerciseIntensity = (duration, calories, weight) => {
  const intensity = calories / (duration / 60) / weight
  if (intensity < 3) return '低强度'
  if (intensity < 6) return '中等强度'
  if (intensity < 9) return '高强度'
  return '极高强度'
}

// 计算运动目标完成度
const calculateExerciseGoalProgress = (currentDuration, targetDuration) => {
  return Math.min(Math.round((currentDuration / targetDuration) * 100), 100)
}

// 计算运动建议
const getExerciseRecommendation = (bmi, activityLevel) => {
  const recommendations = {
    underweight: {
      sedentary: '建议进行力量训练和适度有氧运动，每周3-4次，每次30-45分钟',
      light: '可以增加运动强度，每周4-5次，每次45-60分钟',
      moderate: '保持当前运动量，注意营养补充',
      active: '可以适当减少运动量，注意休息和恢复'
    },
    normal: {
      sedentary: '建议进行中等强度有氧运动，每周3-4次，每次30分钟',
      light: '可以增加运动强度，每周4-5次，每次45分钟',
      moderate: '保持当前运动量，注意运动多样性',
      active: '可以尝试高强度间歇训练，每周3-4次'
    },
    overweight: {
      sedentary: '建议从低强度有氧运动开始，每周3次，每次20-30分钟',
      light: '可以增加运动时长，每周4次，每次30-45分钟',
      moderate: '可以尝试中等强度运动，每周4-5次，每次45分钟',
      active: '保持当前运动量，注意运动强度控制'
    },
    obese: {
      sedentary: '建议从步行开始，每周3次，每次15-20分钟',
      light: '可以增加步行时长，每周4次，每次20-30分钟',
      moderate: '可以尝试低强度有氧运动，每周4次，每次30分钟',
      active: '保持当前运动量，注意循序渐进'
    }
  }

  let bmiCategory = 'normal'
  if (bmi < 18.5) bmiCategory = 'underweight'
  else if (bmi >= 24 && bmi < 28) bmiCategory = 'overweight'
  else if (bmi >= 28) bmiCategory = 'obese'

  return recommendations[bmiCategory][activityLevel] || '请咨询医生获取个性化运动建议'
}

// 计算运动恢复时间
const calculateRecoveryTime = (exerciseIntensity, duration) => {
  const baseRecovery = {
    '低强度': 12,
    '中等强度': 24,
    '高强度': 48,
    '极高强度': 72
  }
  return Math.round(baseRecovery[exerciseIntensity] * (duration / 60))
}

// 计算运动效率
const calculateExerciseEfficiency = (calories, duration, weight) => {
  // 运动效率 = 消耗的热量 / (运动时长 * 体重)
  return (calories / (duration * weight)).toFixed(2)
}

// 获取运动建议强度
const getRecommendedIntensity = (age, healthCondition) => {
  const baseIntensity = {
    '18-30': '高强度',
    '31-45': '中等强度',
    '46-60': '中等强度',
    '60+': '低强度'
  }

  const healthAdjustments = {
    '高血压': -1,
    '心脏病': -2,
    '糖尿病': -1,
    '关节炎': -1
  }

  let recommendedIntensity = baseIntensity[age] || '中等强度'
  if (healthCondition && healthAdjustments[healthCondition]) {
    const intensityLevels = ['低强度', '中等强度', '高强度', '极高强度']
    const currentIndex = intensityLevels.indexOf(recommendedIntensity)
    const adjustedIndex = Math.max(0, currentIndex + healthAdjustments[healthCondition])
    recommendedIntensity = intensityLevels[adjustedIndex]
  }

  return recommendedIntensity
}

// 计算目标完成进度
const calculateProgress = (startWeight, currentWeight, targetWeight) => {
  const totalToLose = startWeight - targetWeight
  const lostWeight = startWeight - currentWeight
  return (lostWeight / totalToLose * 100).toFixed(1)
}

// 格式化日期
const formatDate = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 获取日期范围
const getDateRange = (startDate, endDate) => {
  const dates = []
  let currentDate = new Date(startDate)
  const lastDate = new Date(endDate)

  while (currentDate <= lastDate) {
    dates.push(formatDate(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

module.exports = {
  calculateBMR,
  calculateDailyCalories,
  calculateWeightLossCalories,
  calculateBMI,
  getBMICategory,
  calculateExerciseCalories,
  calculateProgress,
  formatDate,
  getDateRange,
  calculateExerciseIntensity,
  calculateExerciseGoalProgress,
  getExerciseRecommendation,
  calculateRecoveryTime,
  calculateExerciseEfficiency,
  getRecommendedIntensity,
  EXERCISE_MET
} 