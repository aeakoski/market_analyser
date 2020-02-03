const MA_50_200 = require('./strategies/MA_50_200')
var fs = require('fs')
const request = require('request');


module.exports = {
  Brain: function () {
    this.portfolio = new Portfolio()
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
        let _MA_50_200_1 = new MA_50_200.MA_50_200("MA_50_200", _this)
        let p = _MA_50_200_1.initFromFile().then(function(success){
          _MA_50_200_1.initFromBroker()
        })
        _this.strategies.push(_MA_50_200_1)
        await p
        resolve(true)
      })

    }

    this.newDay = function(q){
      if (Object.keys(q).length == 1) {
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

    this.buy = function(orders){
      // orders = [{ expiration: "2020-01-30", symbol:"MSFT", trend:0.4 }]
      // Sort buy orders
      orders.sort((a, b) => (a.trend > b.trend)? 1: -1)
      // Create promise // reject only if networkerror
      return Promise(function(resolve, reject){
        for (let trade of orders){
          // Check if I have exeeded risk on chosen symbol
          if (true) {

          }
          // If not, then send buy signal to broker

          // On callback register new buy in strategy

        }
      })


    }

    this.getPlotData = function(){
      res = {}
      for (strategy of this.strategies){
        res[strategy.name] = {}
        for (symbol of Object.keys(strategy.owns)){
          res[strategy.name][symbol] = {
            regular:strategy.getRegularQoutes(symbol),
            _50:strategy.get50Qoutes(symbol),
            _200:strategy.get200Qoutes(symbol)
          }

        }
      }
      return res
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

  //   this.getQoutes = function(symbol, backlog){
  //     return new Promise(function(resolve, reject){
  //       // Contact broker
  //       console.log("Contacting: http://localhost:4001/backlog?symbol=" + symbol + '&days=' + backlog);
  //       request('http://localhost:4001/backlog?symbol=' + symbol + '&days=' + backlog, { json: true }, (err, res, body) => {
  //         if (err) {
  //           console.log(err);
  //           reject(err)
  //         } else {
  //           resolve(body)
  //         }
  //       })
  //
  //     })
  //   }
 }
}
