var app = getApp();
//js
Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    console.log(app.globalData)
  },

  bindGetUserInfo: function (e) {
    var that = this;
    wx.showModal({
      title: '微信授权',
      content: '申请获得你的信息权限',
      confirmText: '确认授权',
      success: function (res) {
        if (res.cancel) {
          wx.showModal({
            title: '警告',
            content: '尚未进行授权，请点击确定跳转到授权页面进行授权。',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.navigateTo({
                  url: '../authorize/authorize',
                })
              }
            }
          })
        } else {
          wx.request({
            url: 'https://house.anandakeji.com/getUsers',
            method: 'POST',
            success: function (res) {
              console.log(res.data);
              var flag = true;
              for (var i = 0; i < res.data.users.length; i++) {
                if (e.detail.userInfo.nickName == res.data.users[i].name) {
                  //console.log(res.data.users[i].id);
                  var ids = res.data.users[i].id;
                  flag = true;
                  wx.request({
                    url: 'https://house.anandakeji.com/addOperateLog',
                    method: 'POST',
                    data: { uid: ids, page_name: "authorize" },
                    success: function (res) {
                      console.log(res)
                    }
                  })
                } else {
                  flag = false;
                }
              }
              if (flag) {
                wx.redirectTo({
                  url: '../swipertab/swipertab?name=' + e.detail.userInfo.nickName,
                })
              } else {
                //此处授权得到userInfo
                wx.request({
                  url: 'https://house.anandakeji.com/addUser',
                  method: 'POST',
                  data: {
                    name: e.detail.userInfo.nickName,
                    password: e.detail.userInfo.nickName
                  },
                  header: {
                    'content-type': 'application/json'
                  },
                  success: function (res) {
                    //从数据库获取用户信息
                    // that.queryUsreInfo();
                    console.log("插入小程序登录用户信息成功！");
                  }
                })
              }

            }
          });

        }

      }
    })
  }
})
