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
    this.ongoingTrade = {}
    this.trendIsUsed = false

  }

  isABuy(symbol, options){
    if(this.ongoingTrade[symbol] === undefined){
      this.ongoingTrade[symbol] = {long : false, symbol: symbol, boughtAt: 0}
    }



    let item = { symbol: symbol }
    let todaysPrice = this.stockGroup[symbol].latestPrice

    let yesterdays_diff = this.stockGroup[symbol].latestPrice_1 - this.stockGroup[symbol].latestPrice_2
    let todays_diff = this.stockGroup[symbol].latestPrice - this.stockGroup[symbol].latestPrice_1

    let list50 = this.calculateAverage(symbol, options.shortTerm, true)
    let list200 = this.calculateAverage(symbol, options.longTerm, true)
    let shortTermAverage = list50[list50.length-1].value
    let longTermAverage = list200[list200.length-1].value

    if (shortTermAverage < longTermAverage) {
      console.log("Resetting trend");
      this.trendIsUsed = false
    }

    // 1. The price dropp ins increasing two times in a row, sell
    // if ((yesterdays_diff < 0) && (todays_diff < 0) && (yesterdays_diff > todays_diff)) {
    //   return {isABuy:"SELL", strength:1, symbol:symbol}
    // }

    // If we have made a 2% win on our trade, i am happy!
    if (this.ongoingTrade[symbol].long && (this.ongoingTrade[symbol].boughtAt*1.01 < todaysPrice)) {
      //this.ongoingTrade = false
      console.log("Im happy, pulling out");
      this.ongoingTrade[symbol].long = false
      return {isABuy:"SELL", strength:1, symbol:symbol}

    }


    // 2. If actual price is below the long term average, sell
    if (todaysPrice < longTermAverage) {
      //this.ongoingTrade = false
      this.ongoingTrade[symbol].long = false
      return {isABuy:"SELL", strength:1, symbol:symbol}

    }

    // 3. If the short term crosses above the long term, buy
    // 4. If the long term crosses above the short term, sell
    if (shortTermAverage > longTermAverage) {
      if (this.ongoingTrade[symbol].long) {
        console.log("Holding, has ongoing trade already...");
        return {isABuy:"HOLD", strength:1, symbol:symbol}
      }
      if (this.trendIsUsed) {
        console.log("Not allowed to boy, trend used");
        return {isABuy:"HOLD", strength:1, symbol:symbol}
      }
      // this.ongoingTrade = true
      this.ongoingTrade[symbol].long = true
      this.ongoingTrade[symbol].boughtAt = todaysPrice
      this.trendIsUsed = true
      console.log("Trade aim: " + todaysPrice + " -> " + todaysPrice*1.01);
      return {isABuy:"BUY", strength:(shortTermAverage - longTermAverage), symbol:symbol}

    } else {
      // this.ongoingTrade = false
      this.ongoingTrade[symbol].long = false
      return {isABuy:"SELL", strength:(longTermAverage - shortTermAverage), symbol:symbol}

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
