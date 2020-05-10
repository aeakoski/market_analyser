const fs = require('fs')
const fetch = require('node-fetch')
const moving_averages = require('moving-averages');
const mathjs = require('mathjs');
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const Strategy = require("../strategy.js")
const cs = require('classify-series');

let mean = function(arr){
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    sum = sum + arr[i]
  }
  return sum / arr.length
}

let mini = function(arr){
  let m = {close:9999999999}
  for(let i of arr){
    if (i.close < m.close){
      m = i
    }
  }
  return m
}

let maxi = function(arr){
  let m = {close:0}
  for(let i of arr){
    if (i.close > m.close){
      m = i
    }
  }
  if (m.close === 0) {
    // console.log("Zero");
    // console.log(m);
    // console.log(arr);
  }
  return m
}

let between = function (min, max) {
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

let overStandardDeviation = function (qoutes){
  let std = mathjs.std(qoutes)
  let mean = mathjs.mean(qoutes)
  let highs = []
  for (let i = 0; i < qoutes.length; i++) {
    if ((mean + std) < qoutes[i].close) {
      highs.push(qoutes[i].close)
    }
  }

  return highs

}


module.exports = class LIMITS extends Strategy{
  constructor(name, handler, creationDate){
    super(name, handler, creationDate)
    this.ongoingTrade = false
    this.sell_at_high = -1
    this.sell_at_low = -1
    this.shortTerm = -1
    this.longTerm = -1

    this.limitPeriod = 72

    //this.test_isABuy()
  }

  initLimits(symbol){
    let __400 = Object.values(this.getStockData(symbol))
    let _400 = __400.sort((a,b)=>{(a.date > b.date)?1:-1}).reverse().slice(0, this.limitPeriod)

    let ma = maxi(_400).close
    let mi = mini(_400).close

    this.sell_at_high = ma
    this.shortTerm = ma
    this.sell_at_low = mi
    this.longTerm = mi
  }

  findAverageHigh(symbolStockList){
    let highs = {}
    let highsList = []
    for (var i = 0; i < 2000; i++) {
      let lowerBound = between(0, symbolStockList.length-10)
      let upperBound = between(lowerBound+10, symbolStockList.length)
      let _symbolStockList = symbolStockList.slice(lowerBound, upperBound)

      //highsList = highsList.concat(overStandardDeviation(_symbolStockList))

      let localHigh = maxi(_symbolStockList).close
      if (highs[localHigh] === undefined) {
        highs[localHigh] = {no_occurances: 1, value: localHigh}
      } else {
        highs[localHigh].no_occurances = highs[localHigh].no_occurances + 1
      }
    }

    let _sortedHighs = Object.values(highs)
    _sortedHighs.sort((a, b) => (a.no_occurances > b.no_occurances) ? -1 : 1 )

    // Remove noise from list of possible highs
    let occ = _sortedHighs.map(i => i.no_occurances)
    let occ_top = mathjs.mean(occ) + mathjs.std(occ)
    let occ_tops = occ.filter(i => occ_top < i)

    // Find the significant highs
    let gg = _sortedHighs.filter(i => occ_tops.indexOf(i.no_occurances) > -1)
    return mathjs.min(gg.map(i => i.value))

  }


  calculateAverage(symbol, y_val){
    // Return a horizontal line at shortTerm and longTerm
    // On initialization
    let resList = []
    let stockData = this.getStockData(symbol)
    let dates = Object.keys(stockData).sort().reverse()
    for (let i = 0; i < this.daysToOfferInView; i++) {
      resList.push({date: dates[i], value:y_val})
    }
    resList.reverse()
    return resList
  }


  isABuy(symbol, options){
    let __400 = Object.values(this.getStockData(symbol))
    let _400 = __400.sort((a,b)=>{(a.date > b.date)?1:-1}).reverse().slice(0, this.limitPeriod)

    // Find recent average high
    let ma = this.findAverageHigh(_400)
    // Find recent low
    let mi = mini(_400).close
    // Current price in uptrend

    let mas_long = moving_averages.ma(_400.map(i=>i["close"]).reverse(), 50)
    // console.log("mas_long");
    // console.log(mas_long);
    let ma_today = mas_long.pop()
    let ma_yesterday = mas_long.pop()
    // console.log("Derivatan");
    // console.log(ma_today - ma_yesterday);
    //let tod = _400[_400.length-1]
    //let prev = _400[_400.length-4]

    if (this.ongoingTrade) {
      // console.log("Has ongoing trade");
      if (ma < this.sell_at_high) {
        this.sell_at_high = ma
      }
      let hitLow = this.getLatestPrice(symbol) <= this.sell_at_low
      let hitHigh = this.sell_at_high-(this.sell_at_high-this.sell_at_low)*0.20 <= this.getLatestPrice(symbol)
      if (hitLow || hitHigh) {
          this.ongoingTrade = 0
          //this.sell_at_high = -1
          //this.sell_at_low = -1
          return {isABuy:"SELL", strength:1, symbol:symbol}
      }
      // Maximom time limit of a trade before i get out
      if (10 < this.ongoingTrade) {
          this.ongoingTrade = 0
          //this.sell_at_high = -1
          //this.sell_at_low = -1
          return {isABuy:"SELL", strength:1, symbol:symbol}
      }
    }

    this.sell_at_high = ma
    this.shortTerm = ma
    this.sell_at_low = mi
    this.longTerm = mi

    if (options.init !== undefined) {
      return
    }
    // If no ongoing trade, shall we start one?
    // console.log('prev["close"]');
    // console.log(prev["close"]);
    // console.log('tod["close"]');
    // console.log(tod["close"]);
    // console.log("Mooving averages");
    // console.log(ma_today);
    // console.log(ma_yesterday);
    // console.log("\n");
    //if (!(prev["close"] < tod["close"])) {
    if (ma_today - ma_yesterday < 0) {
      // console.log("Downwards trend");
      return {isABuy:"HOLD", strength:1, symbol:symbol}
    }

    // console.log("PASSED TREND-CHECK\n");
    // console.log("LOWEST");
    // console.log(((ma-mi)*0.10)+mi);
    // console.log("HIGHEST");
    // console.log(((ma-mi)*0.20)+mi);
    // console.log("NOW");
    // console.log(this.getLatestPrice(symbol));


    // If we are in the bottom part pf a trading window
    if ((((ma-mi)*0.40)+mi < this.getLatestPrice(symbol) ) && (this.getLatestPrice(symbol) < ((ma-mi)*0.60)+mi)) {
      // console.log("INITIATING TRADE");
      this.ongoingTrade = 1
      return {isABuy:"BUY", strength:1, symbol:symbol}
    }

    // If we are above the average high and on a positive trend, buy some!
    // if (( this.sell_at_high < this.getLatestPrice(symbol) ) && ( ma_today < this.getLatestPrice(symbol))) {
    //   console.log("INITIATING TRADE");
    //   this.ongoingTrade = 1
    //   return {isABuy:"BUY", strength:1, symbol:symbol}
    // }

    return {isABuy:"HOLD", strength:1, symbol:symbol}

  }


}
