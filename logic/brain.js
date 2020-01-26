const MA_50_200 = require('./strategies/MA_50_200')
var fs = require('fs')
const request = require('request');


module.exports = {
  Brain: function () {
    this.strategies = []


    this.formatDate = function(date){
      var d = new Date(date)
      var month = '' + (d.getMonth() + 1)
      var day = '' + d.getDate()
      var year = d.getFullYear()
      if (month.length < 2){
        month = '0' + month
      }
      if (day.length < 2){
        day = '0' + day
      }
      return [year, month, day].join('-')
    }

    this.initStrategies = async function(){
      _this = this
      return new Promise(async function(resolve, reject){
        let _MA_50_200_1 = new MA_50_200.MA_50_200(_this)
        let p = _MA_50_200_1.init()
        _this.strategies.push(_MA_50_200_1)
        await p
        resolve(true)
      })

    }

    this.newDay = function(q){
      if (Object.keys(q).length == 0) {
        console.log("Today is holiday");
        return
      }
      for (let i = 0; i < this.strategies.length; i++) {
        this.strategies[i].calculateTrends(q)
        //console.log(this.strategies[i].stillOnWishList());
        // TODO Call visualizer
        // TODO Call broker
      }
    }

    this.getWishlist = function(){
      let re = {}
      for (let i = 0; i < this.strategies.length; i++) {
        re[this.strategies[i].symbols_wishlist] = this.strategies[i].symbols_wishlist
      }
      let res = []
      for (var k in re) {
          res.push(re[k]);
      }

      return res[0]
    }

    this.addNewStock = function(symbol){
      if (fs.readdirSync('./data').includes(symbol)) {
        console.log("Exists");
        for (let i = 0; i < this.strategies.length; i++) {
          this.strategies[i].addToWishList(symbol)
        }
      } else {
        console.log("Not");
      }

      return 1
    }

    this.deleteStock = function(symbol){
      for (let i = 0; i < this.strategies.length; i++) {
        this.strategies[i].deleteFromWishList(symbol)
      }
      return 1
    }

    this.saveAndQuit = function(){
      for (let i = 0; i < this.strategies.length; i++) {
        this.strategies[i].writePortfolioToFile()
      }
    }

    this.getQoutes = function(symbol, backlog){
      return new Promise(function(resolve, reject){
        // Contact broker
        console.log("Contacting: http://localhost:4001/backlog?symbol=" + symbol + '&days=' + backlog);
        request('http://localhost:4001/backlog?symbol=' + symbol + '&days=' + backlog, { json: true }, (err, res, body) => {
          resolve(body)
        })

      })
    }
  }
}
