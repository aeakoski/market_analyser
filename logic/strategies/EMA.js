const fs = require('fs')
const fetch = require('node-fetch')
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const Strategy = require("../strategy.js")

module.exports = class EMA extends Strategy{
  constructor(name, portfolio, handler, shortTerm, longTerm){
    super(name, portfolio, handler)
    this.shortTerm = shortTerm
    this.longTerm = longTerm
  }

  arrAvgExponential(arr){
    let sum = 0.0
    let wm = 2 / (arr.length + 1) // Wheighted multiplyer
    for(let price of arr){
      sum = (parseFloat(price) * wm) + (sum * ( 1 - wm ))
    }
    return sum
  }

  calculateAverage(symbol, n){
    let resList = []
    let stockData = this.portfolio.getStockData(symbol)
    let aa = Object.keys(stockData).sort().reverse()
    for (let i = 0; i < this.daysToOfferInView; i++) {
      let avgList = []
      for (let d of aa.slice(i, i + n)){
        avgList.push(parseFloat(stockData[d]["4. close"]))
      }
      resList.push({date: aa[i], value:this.arrAvgExponential(avgList), derivedFrom: avgList})
    }
    resList.reverse()
    return resList
  }

  // async calculateTrends(){
  //   var _this = this
  //   let gettingQoutes = 0
  //
  //   let res = {
  //     buy:[],
  //     sell:[]
  //   }
  //
  //   for (let symbol of this.portfolio.getSymbols()) {
  //     console.log(symbol);
  //     let item = { symbol: symbol }
  //     let list50 = this.calculateAverage(symbol, this.shortTerm, true)
  //     let list200 = this.calculateAverage(symbol, this.longTerm, true)
  //     let shortTermAverage = list50[list50.length-1].value
  //     let longTermAverage = list200[list200.length-1].value
  //     if (shortTermAverage > longTermAverage) { // Buy
  //       //console.log("Trend - Percent " + (shortTermAverage.avg-longTermAverage.avg)/shortTermAverage.avg);
  //       console.log("Tred UP - BUY " + (shortTermAverage + ", " + longTermAverage));
  //       item.trendStrength = shortTermAverage - longTermAverage
  //       res.buy.push(item)
  //     } else { // Sell
  //       //console.log("Trend - Percent " + (longTermAverage.avg-shortTermAverage.avg)/longTermAverage.avg);
  //       console.log("Tred DOWN - SELL " + (longTermAverage + ", " + shortTermAverage));
  //       item.trendStrength = longTermAverage - shortTermAverage
  //       res.sell.push(item)
  //     }
  //     console.log(" ");
  //   }
  //   // Sort res lists after relevance
  //   res.buy.sort((a, b) => (a.trendStrength > b.trendStrength) ? 1 : -1)
  //   res.sell.sort((a, b) => (a.trendStrength > b.trendStrength) ? 1 : -1)
  //   return res
  // }
}