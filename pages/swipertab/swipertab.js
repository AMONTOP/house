var app = getApp();

Page({
  data: {
    showtab:0,  //顶部选项卡索引
    showtabtype:'', //选中类型
    tabnav:{},  //顶部选项卡数据
    testdataall:[],  //所有数据
    testdata1:[], //数据列表
    testdata2:[], //数据列表
    testdata3:[], //数据列表
    startx:0,  //开始的位置x
    endx:0, //结束的位置x
    critical: 100, //触发切换标签的临界值
    marginleft:0,  //滑动距离
    concerncity:[],//关注的城市
    nameuser:null,
  },
  onLoad: function (options) {
    console.log(options);
    var timearr = [];
    var countarr = [];
    var that = this;
    wx.request({
     url: 'https://house.anandakeji.com/admin/api/statistics',
     success: function (res) {
       var json = res.data.data;
       for (var key in json) {
         timearr.push(key);
         countarr.push(json[key]);
       }
       
    //  var gw = parseInt(countarr[2]%10);
    //  var sw = parseInt((countarr[2] % 100) / 10);
    //  var bw = parseInt((countarr[2] % 1000) / 100);
    //  var qw = parseInt((countarr[2] % 10000) / 1000);
    //  console.log(gw);
    //  console.log(sw);
      that.setData({
        time: timearr[3],
        count:countarr[2]
        // gw:gw,
        // sw:sw,
        // bw:bw,
        // qw:qw,
      })
     }
   })
    this.setData({
      tabnav:{
        tabnum:3,
        tabitem:[
          {
            "id":1,
            "type":"A",
            "text":"房价收入比",
            "img":"../../image/income.png"
          },
          {
            "id":2,
            "type":"B",
            "text":"市中心房价（元/m²）",
            "img": "../../image/center.png"
          },
          {
            "id":3,
            "type":"C",
            "text": "非市中心房价（元/m²）",
            "img": "../../image/outside.png"
          }
        ]
      },
      currentTab: 0
    })
    this.fetchTabData(0);
    // this.getAttention(options);
    var arr_concerns = [];
    wx.request({
      url: 'https://house.anandakeji.com/getAttentions',
      method: 'POST',
      success(res) {
        console.log(res.data);
        for (var i = 0; i < res.data.attentions.length; i++) {
          if (res.data.attentions[i].name == options.name) {
            console.log(res.data.attentions[i].city_name);
            arr_concerns.push(res.data.attentions[i].city_name);
          }
        }
        // console.log(arr_concerns);
        that.setData({
          concerncity: arr_concerns,
          nameuser: options.name
        })
      }
    })
   
  },
 
  // onShow:function(){
  //   let value  = wx.getStorageSync('name');
  //   this.onLoad(value);
  // },
  // loadConcern:function(){

  // },
  // changeData:function(options){
  //   console.log(options);
  //   this.onLoad(options);
  // },
  getAttention:function(option){
    var that = this;
    var arr_concerns = [];
    wx.request({
      url: 'https://house.anandakeji.com/getAttentions',
      method: 'POST',
      success(res) {
        console.log(res.data);
        for (var i = 0; i < res.data.attentions.length; i++) {
          if (res.data.attentions[i].name == option) {
            console.log(res.data.attentions[i].city_name);
            arr_concerns.push(res.data.attentions[i].city_name);
          }
        }
        // console.log(arr_concerns);
        that.setData({
          concerncity: arr_concerns,
          nameuser: option
        })
      }
    })
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
                  url: '../swipertab/swipertab',
                })
              }
            }
          })
        } else {
          wx.request({
            url: 'https://house.anandakeji.com/getUsers',
            method: 'POST',
            success: function (res) {
              var flag = true;
              for (var i = 0; i < res.data.users.length; i++) {
                if (e.detail.userInfo.nickName == res.data.users[i].name) {
                  // console.log(res.data.users[i].name);
                  
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
  },


 
  fetchData:function(t){  //生成数据
    console.log(this.data.currentTab);
    const newquestions = [];
    var that = this;
    if (that.data.currentTab == 0){
      wx.request({
        url: 'https://house.anandakeji.com/getInternationalCitys', //仅为示例，并非真实的接口地址
        method: 'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          for (let i = 0; i < res.data.internationalCitys.length; i++) {
            newquestions.push({
              "id": i + 1,
              "rank": res.data.internationalCitys[i].rank,
              "city": res.data.internationalCitys[i].city,
              "income": res.data.internationalCitys[i].income,
              "center_city": res.data.internationalCitys[i].center_city,
              "center": res.data.internationalCitys[i].center,
              "outside_city": res.data.internationalCitys[i].outside_city,
              "outside": res.data.internationalCitys[i].outside
            })
          }
          that.setData({
            testdata1: newquestions
          })
        }
      })
    } else if (that.data.currentTab == 1){
        wx.request({
              url: 'https://house.anandakeji.com/getDomesticCitys', //仅为示例，并非真实的接口地址
              method: 'POST',
              header: {
                'content-type': 'application/json' // 默认值
              },
              success(res) {
                for (let i = 0; i < res.data.domestic_citys.length; i++) {
                  newquestions.push({
                    "id": i + 1,
                    "rank": res.data.domestic_citys[i].rank,
                    "city": res.data.domestic_citys[i].city,
                    "income": res.data.domestic_citys[i].income,
                    "center_city": res.data.domestic_citys[i].center_city,
                    "center": res.data.domestic_citys[i].center,
                    "outside_city": res.data.domestic_citys[i].outside_city,
                    "outside": res.data.domestic_citys[i].outside
                  })
                }
                that.setData({
                  testdata1: newquestions
                })
              }
            })
    }
    
  },
  fetchTabData:function(i){
    var that = this;
    switch(Number(i)) {
      case 0:
        that.fetchData('A')
        // this.setData({
        //   testdata1: this.fetchData('A')
        // })
        break;
      case 1:
        that.fetchData('B')
        // this.setData({
        //   testdata2: this.fetchData('B')
        // })
        break;
      case 2:
        that.fetchData('C')
        // this.setData({
        //   testdata3: this.fetchData('C')
        // })
        break;
      default:
        return;
    }
  },

  //点击切换
  clickTab: function (e) {
    var that = this;
    const newquestions = [];
    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    }else {
      that.setData({
        currentTab: e.target.dataset.current
      })
      if (that.data.showtab == 0){
        that.fetchData('A');
        console.log('a');
      } else if (that.data.showtab == 1){
          that.fetchData('B');
        console.log('b');
      } else if (that.data.showtab == 2){
          that.fetchData('C');
        console.log('c');
      }
    }
  },
  changeToDetail:function(e){
    // console.log(e.target.dataset.city);
    // console.log(this.data.nameuser);
    var that = this;
    wx.navigateTo({
      url: '../test/test?name=' + that.data.nameuser +'&city=' + e.target.dataset.city,
    })
  },
  setTab:function(e){ //设置选项卡选中索引
    var that = this;
    const edata = e.currentTarget.dataset;
    that.setData({
      showtab: Number(edata.tabindex),
      showtabtype: edata.type
    })
    that.fetchTabData(edata.tabindex);
  },
  scrollTouchstart:function(e){
    var that = this;
    let px = e.touches[0].pageX;
    that.setData({
      startx: px
    })
  },
  scrollTouchmove:function(e){
    let px = e.touches[0].pageX;
    console.log("px:"+px)
    let d = this.data;
    this.setData({
      endx: px,
    })
    if(px-d.startx<d.critical && px-d.startx>-d.critical){
      this.setData({
        marginleft: px - d.startx
      })
    }
  },
  scrollTouchend:function(e){
    let d = this.data;
    if(d.endx-d.startx >d.critical && d.showtab>0){
      this.setData({
        showtab: d.showtab-1,
      })
      // this.fetchTabData(d.showtab-1);
    }else if(d.endx-d.startx <-d.critical && d.showtab<this.data.tabnav.tabnum-1){
      this.setData({
        showtab: d.showtab+1,
      })
    }
    this.fetchTabData(d.showtab);
    this.setData({
        startx:0,
        endx:0,
        marginleft:0
    })
  },
})
