var fs = require('fs')
const request = require('request');
const Portfolio = require('./portfolio');
const MA_50_200 = require('./strategies/MA_50_200')

module.exports = class Handler {
  constructor(){
    this.portfolio = new Portfolio(this)
    this.strategies = []

    let _MA_50_200_1 = new MA_50_200.MA_50_200("MA_50_200", this.portfolio, this)
    this.strategies.push(_MA_50_200_1)
  }

  debug(){ this.portfolio.debug()}

  status(){
    for (let i = 0; i < this.strategies.length; i++) {
      this.strategies[i].calculateTrends()
    }
  }

  getQoutes(symbol, backlog){
    return new Promise(function(resolve, reject){
      // Contact broker
      console.log("Contacting: http://localhost:4001/backlog?symbol=" + symbol + '&days=' + backlog);
      request('http://localhost:4001/backlog?symbol=' + symbol + '&days=' + backlog, { json: true }, (err, res, body) => {
        if (err) {
          console.log(err);
          reject(err)
        } else {
          resolve(body)
        }
      })

    })
  }

  getPlotData(){
    let res = {}
    res["MA_50_200"] = {}
    for (let symbol of this.portfolio.getSymbols()){
      res["MA_50_200"][symbol] = {
        regular:this.portfolio.getStockDataToPlot(symbol),
        _50:this.strategies[0].calculate50Average(symbol),
        _200:this.strategies[0].calculate200Average(symbol)
      }
    }
    return res
  }

}
//module.exports.Handler
