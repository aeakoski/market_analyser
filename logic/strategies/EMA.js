const fs = require('fs')
const fetch = require('node-fetch')
const moving_averages = require('moving-averages');
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const Strategy = require("../strategy.js")

module.exports = class EMA extends Strategy{
  constructor(name, handler, shortTerm, longTerm){
    super(name, handler)
    this.shortTerm = shortTerm
    this.longTerm = longTerm
  }

  calculateAverage(symbol, n){
    let resList = []
    let stockData = this.getStockData(symbol)
    let aa = Object.keys(stockData).sort().reverse()
    let lastPriceList = -1
    for (let i = 0; i < this.daysToOfferInView; i++) {
      let avgList = []
      for (let d of aa.slice(i, i + n)){
        avgList.push(parseFloat(stockData[d]["close"]))
      }
      resList.push({date: aa[i], value:moving_averages.ema(avgList, avgList.length)[avgList.length-1], derivedFrom: avgList})
    }
    resList.reverse()
    return resList
  }

}
