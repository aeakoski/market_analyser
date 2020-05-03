const fs = require('fs')
const fetch = require('node-fetch')
const moving_averages = require('moving-averages');
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const Strategy = require("../strategy.js")

let mini = function(arr){
  let m = {close:9999999999}
  console.log("mini length");
  console.log(arr.length);
  for(let i of arr){
    if (i.close < m.close){
      m = i
    }
  }
  return m
}
let maxi = function(arr){
  let m = {close:0}
  console.log("maxi length");
  console.log(arr.length);

  for(let i of arr){
    if (i.close > m.close){
      m = i
    }
  }
  return m
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
    // 1 find 40 tics high = x
    let ma = maxi(_400).close
    console.log("ma");
    console.log(ma);
    // 2 Find 40 ticks low = y
    let mi = mini(_400).close
    console.log("mi");
    console.log(mi);
    // 3 find current price = p
    // 4 current price in uptrend
    //let shortTermTrend = this.calculateAverage(symbol, 5, true)
    let tod = _400[_400.length-1]
    let prev = _400[_400.length-4]

    if (this.ongoingTrade) {
      console.log("Has ongoing trade");
      let hitLow = this.getLatestPrice(symbol) <= this.sell_at_low
      let hitHigh = this.sell_at_high <= this.getLatestPrice(symbol)
      if (hitLow || hitHigh) {
          this.ongoingTrade = false
          //this.sell_at_high = -1
          //this.sell_at_low = -1
          return {isABuy:"SELL", strength:1, symbol:symbol}
      }

    }

    console.log("Setting new stuff");
    this.sell_at_high = ma
    this.shortTerm = ma
    this.sell_at_low = mi
    this.longTerm = mi

    if (options.init !== undefined) {
      return
    }
    // If no ongoing trade, shall we start one?
    console.log('prev["close"]');
    console.log(prev["close"]);
    console.log('tod["close"]');
    console.log(tod["close"]);
    console.log("\n");
    if (!(prev["close"] < tod["close"])) {
      console.log("Downwards trend");
      return {isABuy:"HOLD", strength:1, symbol:symbol}
    }

    console.log("PASSED TREND-CHECK\n");
    console.log("LOWEST");
    console.log(((ma-mi)*0.10)+mi);
    console.log("HIGHEST");
    console.log(((ma-mi)*0.25)+mi);
    console.log("NOW");
    console.log(this.getLatestPrice(symbol));

    // 5 Current price in right pricerange (x-y)*0.2 (p-y)
    if ((((ma-mi)*0.10)+mi < this.getLatestPrice(symbol) ) && (this.getLatestPrice(symbol) < ((ma-mi)*0.40)+mi)) {
      console.log("INITIATING TRADE");

      this.ongoingTrade = true

      // this.shortTerm = ma
      // this.longTerm = mi
      // this.sell_at_high = ma
      // this.sell_at_low = mi

      return {isABuy:"BUY", strength:1, symbol:symbol}
    }


    return {isABuy:"HOLD", strength:1, symbol:symbol}

  }


}
