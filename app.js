//app.js
App({
  onLaunch: function () {
    var that = this;
    var timearr = [];
    wx.request({
      url: 'https://house.anandakeji.com/admin/api/statistics',
      method: 'GET',
      success: function (res) {
        var json = res.data.data;
        for (var key in json) {
          console.log(key);
          timearr.push(key);
        }
         wx.setStorageSync("time",timearr);
      }
    })
    wx.setStorage({
      key: 'fangwen',
      data: 'true',
    })
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 登录
    wx.login({
      success: res => {
        
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              console.log(111111111);
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else {
          wx.reLaunch({
            url: '/pages/authorize/authorize',
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    openid: '',
    time : null
  }
}) 