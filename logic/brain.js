const MA_50_200 = require('./strategies/MA_50_200')
var fs = require('fs')

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

    this.newDay = function(){
      console.log("New day");
      for (let i = 0; i < this.strategies.length; i++) {
        this.strategies[i].calculateTrends()
        //console.log(this.strategies[i].stillOnWishList());
        // TODO Call visualizer
        // TODO Call broker
      }
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
      resObj = {}
      let now = new Date()
      let foundDates = 0
      if (fs.readdirSync('./data').includes(symbol)) {
        all_qoutes = JSON.parse(fs.readFileSync("./data/" + symbol, options={encoding:"utf-8"}))
        // console.log("%j", all_qoutes);
        for (let i = 0; i < 365*10; i++) {
          var dateToFetch = new Date().setDate(now.getDate() - i)
          if(all_qoutes[this.formatDate(dateToFetch)] === undefined){ continue }
          foundDates++
          resObj[this.formatDate(dateToFetch)] = all_qoutes[this.formatDate(dateToFetch)]
          if(foundDates == backlog){ break }
        }
        if (foundDates !== backlog) { throw "Think better, 2342" }
        return resObj
      } else {
        console.log("Need to implement API call for " + symbol);
      }

    }
  }
}
