const fs = require('fs')
const fetch = require('node-fetch')
const moving_averages = require('moving-averages');
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const Strategy = require("../strategy.js")

module.exports = class EMA extends Strategy{
  constructor(name, handler, shortTerm, longTerm, creationDate){
    super(name, handler, creationDate)
    this.shortTerm = shortTerm
    this.longTerm = longTerm
  }

  isABuy(symbol, options){
    let item = { symbol: symbol }
    let list50 = this.calculateAverage(symbol, options.shortTerm, true)
    let list200 = this.calculateAverage(symbol, options.longTerm, true)

    let shortTermAverage = list50[list50.length-1].value
    let longTermAverage = list200[list200.length-1].value
    let logObj = {
      shortTermAverage:shortTermAverage,
      longTermAverage:longTermAverage,
      symbol:symbol
    }
    if (shortTermAverage > longTermAverage) {
      return {isABuy:true, strength:(shortTermAverage - longTermAverage), symbol:symbol}
    }else {
      return {isABuy:false, strength:(longTermAverage - shortTermAverage), symbol:symbol}
    }
  }


  calculateAverage(symbol, n){
    // n is days to average over
    let resList = []
    let stockData = this.getStockData(symbol)
    let dates = Object.keys(stockData).sort().reverse()
    for (let i = 0; i < this.daysToOfferInView; i++) {
      let avgList = []
      for (let date of dates.slice(i, i + n)){
        avgList.push(parseFloat(stockData[date]["close"]))
      }
      if (avgList.length === 0){continue}

      resList.push({date: dates[i], value:moving_averages.ema(avgList, avgList.length)[avgList.length-1], derivedFrom: avgList})
    }
    resList.reverse()
    return resList
  }



}
