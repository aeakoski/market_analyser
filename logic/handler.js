var fs = require('fs')
const request = require('request');
const Portfolio = require('./portfolio');
const SMA = require('./strategies/SMA')
const WMA = require('./strategies/WMA')
const EMA = require('./strategies/EMA')

module.exports = class Handler {
  constructor(){
    // this.portfolio = new Portfolio(this)
    this.portfolios = {}
    this.portfolios["WMA-Portfolio"] = new Portfolio("WMA-Portfolio", this)
    this.portfolios["SMA-Portfolio"] = new Portfolio("SMA-Portfolio", this)
    this.portfolios["EMA-Portfolio"] = new Portfolio("EMA-Portfolio", this)
    this.strategies = []
    this.strategies.push(new SMA("SMA", this.portfolios["SMA-Portfolio"], this, 10, 50))
    this.strategies.push(new WMA("WMA", this.portfolios["WMA-Portfolio"], this, 10, 50))
    this.strategies.push(new EMA("EMA", this.portfolios["EMA-Portfolio"], this, 10, 50))
  }

  //debug(){ this.portfolio.debug()}

  status(){
    for (let i = 0; i < this.strategies.length; i++) {
      this.strategies[i].calculateTrends()
    }
  }

  requestQoutes(symbol, backlog){
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
    // console.log("Serving plot data for " + portfolioName);
    let res = {}
    for(let strat of this.strategies){
        res[strat.name] = {}
        for (let symbol of this.portfolios[strat.name + "-Portfolio"].getSymbols()){
          res[strat.name][symbol] = {
            regular:strat.getStockDataToPlot(symbol),
            _50:strat.calculateAverage(symbol, 10),
            _200:strat.calculateAverage(symbol, 50)
          }
        }
    }

    return res
  }

  getWishlist(portfolioName){ return this.portfolios[portfolioName].getSymbols() }

  newDay(q){
    if (Object.keys(q).length == 1) {
      console.log("Today is holiday");
      return
    }
    for(let portfolioName of Object.keys(this.portfolios)){
      this.portfolios[portfolioName].addNewQoute(q)
    }
    for (let i = 0; i < this.strategies.length; i++) {
      this.strategies[i].calculateTrends()
      // TODO Call broker
    }
  }
}
//module.exports.Handler
