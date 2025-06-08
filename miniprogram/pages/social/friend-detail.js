const storage = require('../../../utils/storage.js');

Page({
  data: {
    friend: null,
    isFriend: false,
    recentExercises: [],
    achievements: [],
    friendId: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ friendId: options.id });
      this.loadFriendData();
    }
  },

  onShow() {
    if (this.data.friendId) {
      this.loadFriendData();
    }
  },

  // 加载好友数据
  async loadFriendData() {
    try {
      // 获取好友信息
      const friend = await storage.getFriendById(this.data.friendId);
      if (!friend) {
        wx.showToast({
          title: '未找到该用户',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
        return;
      }

      // 检查是否是好友关系
      const isFriend = await storage.checkIsFriend(this.data.friendId);

      // 获取好友的运动记录
      const exercises = await storage.getFriendExercises(this.data.friendId);
      const recentExercises = exercises.slice(0, 5); // 只显示最近5条记录

      // 获取好友的成就
      const achievements = await storage.getFriendAchievements(this.data.friendId);

      // 获取好友的排行榜排名
      const rankings = await storage.getFriendRankings(this.data.friendId);

      this.setData({
        friend: {
          ...friend,
          rankings
        },
        isFriend,
        recentExercises,
        achievements
      });
    } catch (error) {
      console.error('加载好友数据失败:', error);
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    }
  },

  // 发送消息
  sendMessage() {
    wx.navigateTo({
      url: `/pages/social/chat?id=${this.data.friendId}`
    });
  },

  // 添加/删除好友
  async toggleFriend() {
    try {
      if (this.data.isFriend) {
        // 删除好友
        await storage.removeFriend(this.data.friendId);
        wx.showToast({
          title: '已删除好友',
          icon: 'success'
        });
      } else {
        // 添加好友
        await storage.addFriend({
          id: this.data.friendId,
          ...this.data.friend
        });
        wx.showToast({
          title: '已添加好友',
          icon: 'success'
        });
      }

      this.setData({
        isFriend: !this.data.isFriend
      });
    } catch (error) {
      console.error('操作失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 分享好友资料
  onShareAppMessage() {
    return {
      title: `${this.data.friend.nickname}的健康档案`,
      path: `/pages/social/friend-detail?id=${this.data.friendId}`
    };
  }
}); 