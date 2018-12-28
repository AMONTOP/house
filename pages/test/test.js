var wxCharts = require('../../utils/wxcharts.js');
var app = getApp();
var areaChart = null;
var areaChart2 = null;

Page({
  data: {
    city_name: null,
    income1: null,
    income2: null,
    income3: null,
    income4: null,
    center1: null,
    center2: null,
    center3: null,
    center4: null,
    outside1: null,
    outside2: null,
    outside3: null,
    outside4: null,
    boolconcern: "+关注",
    time1: null,
    time2: null,
    time3: null,
  },

  onLoad: function (e) {
    var that = this;
    that.getBeforeDate().then(function (val) {
      console.log('2');
      return that.getAttention();
    }).then(function (val) {
      console.log('3');
      return that.getDetail();
    })
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
  },
  getBeforeDate: function () {
    var timearr = [];
    var that = this;
    var n = 7;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: 'https://house.anandakeji.com/admin/api/statistics',
        success: function (res) {
          var json = res.data.data;
          for (var key in json) {
            timearr.push(key);
          }

          that.setData({
            time3: timearr[2],
            time2: timearr[1],
            time1: timearr[0],
            time: timearr[3]
          })
          resolve(res);
        },
        fail: function () {
          console.log("error");
        }
      })

    })

  },
  getAttention: function (e) {
    var that = this;
    var arr = [];
    //获取关注信息
    wx.request({
      url: 'https://house.anandakeji.com/getAttentions',
      method: 'POST',
      success(res) {
        // console.log(res.data.attentions);
        for (var m = 0; m < res.data.attentions.length; m++) {
          if (e.name == res.data.attentions[m].name && e.city == res.data.attentions[m].city_name) {
            that.setData({
              boolconcern: "取消关注",
              color: "gray"
            })
          }
        }
        if (e.name == 'undefined' || e.name == '') {
          e.name = ' ';
        }

        that.setData({
          cityname: e.city,
          username: e.name
        })
        resolve(res);
      }
    })
  },

  getDetail: function (e) {
    //获取页面详情
    var that = this;
    wx.request({
      url: 'https://house.anandakeji.com/getDetails',
      method: 'POST',
      // header: {
      //   'content-type': 'application/json' // 默认值
      // },
      success(res) {
        for (var i = 0; i < res.data.details.length; i++) {
          if (e.city == res.data.details[i].city) {
            arr.push(res.data.details[i]);
          }
        }
        console.log(arr[0].city);
        that.setData({
          city_name: arr[0].city,
          income1: arr[0].income1,
          income2: arr[0].income2,
          income3: arr[0].income3,
          income4: arr[0].income4,
          center1: arr[0].center1,
          center2: arr[0].center2,
          center3: arr[0].center3,
          center4: arr[0].center4,
          outside1: arr[0].outside1,
          outside2: arr[0].outside2,
          outside3: arr[0].outside3,
          outside4: arr[0].outside4,
          loadingHidden: true
        })
        areaChart2 = new wxCharts({
          canvasId: 'areaCanvas2',
          type: 'area',
          categories: [that.data.time1, that.data.time2, that.data.time3, that.data.time],
          animation: true,
          series: [{
            name: '市中心房价',
            color: '#e2eaed',
            data: [that.data.income1, that.data.income2, that.data.income3, that.data.income4],
            format: function (val) {
              return val + '%';
            }
          }],
          yAxis: {
            title: '收入百分比 (%)',
            format: function (val) {
              return val;
            },
            min: 0,
            fontColor: 'black',
            gridColor: '#f2f2f2',
            titleFontColor: '#2092AC'
          },
          xAxis: {
            fontColor: 'black',
            gridColor: '#f2f2f2'
          },
          extra: {
            legendTextColor: 'gray'
          },
          width: windowWidth,
          height: 250,
          dataLabel: false
        });
        areaChart = new wxCharts({
          canvasId: 'areaCanvas',
          type: 'area',
          categories: [that.data.time1, that.data.time2, that.data.time3, that.data.time],
          animation: true,
          series: [{
            name: '市中心房价',
            color: '#e2eaed',
            data: [that.data.center1, that.data.center2, that.data.center3, that.data.center4],
            format: function (val) {
              return val + '元/m²';
            }
          }, {
            name: '非市中心房价',
            data: [that.data.outside1, that.data.outside2, that.data.outside3, that.data.outside4],
            format: function (val) {
              return val + '元/m²';
            }
          }],
          yAxis: {
            title: '房价 (元/m²)',
            format: function (val) {
              return val;
            },
            min: 0,
            fontColor: 'black',
            gridColor: '#f2f2f2',
            titleFontColor: '#2092AC'
          },
          xAxis: {
            fontColor: 'black',
            gridColor: '#f2f2f2'
          },
          extra: {
            legendTextColor: 'gray'
          },
          width: windowWidth,
          height: 250,
          dataLabel: false
        });
        resolve(res);
      }
    });
  },

  touchHandler: function (e) {
    areaChart.showToolTip(e);
  },
  touchHandler2: function (e) {
    areaChart2.showToolTip(e);
  },
  changeConcern: function (e) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];
    var prevPage = pages[pages.length - 2];
    // console.log(this.data.cityname);
    var that = this;
    if (this.data.boolconcern == "取消关注") {
      wx.request({
        url: 'https://house.anandakeji.com/delAttention',
        data: {
          name: that.data.username,
          city_name: that.data.cityname
        },
        method: "POST",
        success(res) {
          console.log("delete success");
        }
      })
      var arr_concerns = [];
      const that = this;
      wx.request({
        url: 'https://house.anandakeji.com/getAttentions',
        method: 'POST',
        success(res) {
          for (var i = 0; i < res.data.attentions.length; i++) {
            if (res.data.attentions[i].name == that.data.username) {
              arr_concerns.push(res.data.attentions[i].city_name);
            }
          }
          prevPage.setData({
            concerncity: arr_concerns
          })
        }
      })
      that.setData({
        boolconcern: "+关注",
        color: "#1D96C1"
      })
    } else if (that.data.boolconcern == "+关注") {
      wx.request({
        url: 'https://house.anandakeji.com/addAttention',
        data: {
          name: that.data.username,
          city_name: that.data.cityname
        },
        method: "POST",
        success(res) {
          console.log("add success");
        }
      })
      var arr_concerns = [];
      const that = this;
      wx.request({
        url: 'https://house.anandakeji.com/getAttentions',
        method: 'POST',
        success(res) {
          // console.log(res.data);
          for (var i = 0; i < res.data.attentions.length; i++) {
            if (res.data.attentions[i].name == that.data.username) {
              arr_concerns.push(res.data.attentions[i].city_name);
            }
          }
          // console.log(arr_concerns);
          prevPage.setData({
            concerncity: arr_concerns
          })
        }
      })
      that.setData({
        boolconcern: "取消关注",
        color: "gray"
      })
    }
  }

});