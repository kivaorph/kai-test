const storage = require('../../utils/storage.js');

Page({
  data: {
    currentTab: 'friends',
    searchKeyword: '',
    friends: [],
    rankingType: 'exercise',
    rankings: [],
    postContent: '',
    moments: [],
    selectedImages: [],
    selectedLocation: null
  },

  onLoad() {
    this.loadFriends();
    this.loadRankings();
    this.loadMoments();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadFriends();
    this.loadRankings();
    this.loadMoments();
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  // 切换排行榜类型
  switchRankingType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ rankingType: type });
    this.loadRankings();
  },

  // 加载好友列表
  async loadFriends() {
    try {
      const friends = await storage.getFriends();
      this.setData({ friends });
    } catch (error) {
      console.error('加载好友列表失败:', error);
      wx.showToast({
        title: '加载好友列表失败',
        icon: 'none'
      });
    }
  },

  // 搜索好友
  searchFriends(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    // 实现搜索逻辑
  },

  // 显示好友详情
  showFriendDetail(e) {
    const friendId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/social/friend-detail?id=${friendId}`
    });
  },

  // 发送消息
  sendMessage(e) {
    const friendId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/social/chat?id=${friendId}`
    });
  },

  // 查看好友资料
  viewProfile(e) {
    const friendId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/social/profile?id=${friendId}`
    });
  },

  // 显示添加好友界面
  showAddFriend() {
    wx.navigateTo({
      url: '/pages/social/add-friend'
    });
  },

  // 加载排行榜数据
  async loadRankings() {
    try {
      const rankings = await storage.getRankings(this.data.rankingType);
      this.setData({ rankings });
    } catch (error) {
      console.error('加载排行榜失败:', error);
      wx.showToast({
        title: '加载排行榜失败',
        icon: 'none'
      });
    }
  },

  // 加载动态列表
  async loadMoments() {
    try {
      const moments = await storage.getMoments();
      this.setData({ moments });
    } catch (error) {
      console.error('加载动态列表失败:', error);
      wx.showToast({
        title: '加载动态列表失败',
        icon: 'none'
      });
    }
  },

  // 输入动态内容
  onPostInput(e) {
    this.setData({
      postContent: e.detail.value
    });
  },

  // 选择图片
  async chooseImage() {
    try {
      const res = await wx.chooseImage({
        count: 9,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      
      this.setData({
        selectedImages: [...this.data.selectedImages, ...res.tempFilePaths]
      });
    } catch (error) {
      console.error('选择图片失败:', error);
    }
  },

  // 选择位置
  async chooseLocation() {
    try {
      const res = await wx.chooseLocation();
      this.setData({
        selectedLocation: {
          name: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude
        }
      });
    } catch (error) {
      console.error('选择位置失败:', error);
    }
  },

  // 发布动态
  async publishPost() {
    if (!this.data.postContent.trim() && this.data.selectedImages.length === 0) {
      wx.showToast({
        title: '请输入内容或选择图片',
        icon: 'none'
      });
      return;
    }

    try {
      const moment = {
        content: this.data.postContent,
        images: this.data.selectedImages,
        location: this.data.selectedLocation,
        time: new Date().toISOString(),
        likes: 0,
        comments: [],
        isLiked: false
      };

      await storage.addMoment(moment);
      
      this.setData({
        postContent: '',
        selectedImages: [],
        selectedLocation: null
      });

      this.loadMoments();
      
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('发布动态失败:', error);
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      });
    }
  },

  // 点赞动态
  async likeMoment(e) {
    const momentId = e.currentTarget.dataset.id;
    try {
      await storage.toggleMomentLike(momentId);
      this.loadMoments();
    } catch (error) {
      console.error('点赞失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 评论动态
  commentMoment(e) {
    const momentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/social/comment?id=${momentId}`
    });
  },

  // 分享动态
  shareMoment(e) {
    const momentId = e.currentTarget.dataset.id;
    // 实现分享逻辑
  },

  // 预览图片
  previewImage(e) {
    const { urls, current } = e.currentTarget.dataset;
    wx.previewImage({
      urls,
      current
    });
  }
}); 