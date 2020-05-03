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
    let todaysPrice = this.stockGroup[symbol].latestPrice

    let yesterdays_diff = this.stockGroup[symbol].latestPrice_1 - this.stockGroup[symbol].latestPrice_2
    let todays_diff = this.stockGroup[symbol].latestPrice - this.stockGroup[symbol].latestPrice_1

    let list50 = this.calculateAverage(symbol, options.shortTerm, true)
    let list200 = this.calculateAverage(symbol, options.longTerm, true)
    let shortTermAverage = list50[list50.length-1].value
    let longTermAverage = list200[list200.length-1].value

    // let logObj = {
    //   shortTermAverage:shortTermAverage,
    //   longTermAverage:longTermAverage,
    //   symbol:symbol
    // }

    // 1. The price dropp ins increasing two times in a row, sell
    if ((yesterdays_diff < 0) && (todays_diff < 0) && (yesterdays_diff > todays_diff)) {
      return {isABuy:false, strength:1, symbol:symbol}
    }

    // 2. If actual price is below the long term average, sell
    if (todaysPrice < longTermAverage) {
      return {isABuy:false, strength:1, symbol:symbol}
    }

    // 3. If the short term crosses above the long term, buy
    // 4. If the long term crosses above the short term, sell
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
