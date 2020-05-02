const fs = require('fs')
const fetch = require('node-fetch')
const moving_averages = require('moving-averages');
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const Strategy = require("../strategy.js")

module.exports = class SMA extends Strategy{
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

  arrAvg(arr){
    let sum = 0.0
    if(arr.length){
      sum = moving_averages.ma(arr, arr.length)[arr.length-1]
    }
    return sum
  }

  calculateAverage(symbol, n){
    let resList = []
    let stockData = this.getStockData(symbol)
    let dates = Object.keys(stockData).sort().reverse()
    for (let i = 0; i < this.daysToOfferInView; i++) {
      let avgList = []
      for (let d of dates.slice(i, i + n)){
        avgList.push(parseFloat(stockData[d]["close"]))
      }
      if (avgList.length === 0){continue}

      resList.push({date: dates[i], value:this.arrAvg(avgList), derivedFrom: avgList})

    }
    resList.reverse()
    return resList
  }

}
