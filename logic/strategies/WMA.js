const fs = require('fs')
const fetch = require('node-fetch')
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const Strategy = require("../strategy.js")

module.exports = class WMA extends Strategy{
  constructor(name, handler, shortTerm, longTerm){
    super(name, handler)
    this.shortTerm = shortTerm
    this.longTerm = longTerm
  }

  arrAvgWheight(arr){
    let sum = 0.0
    let wheight = 1
    for(let x of arr){
      sum = sum + (parseFloat(x) * wheight)
      wheight++
    }
    return sum / (arr.length*(arr.length+1)/2)
  }

  calculateAverage(symbol, n){
    let resList = []
    let stockData = this.getStockData(symbol)
    let aa = Object.keys(stockData).sort().reverse()
    for (let i = 0; i < this.daysToOfferInView; i++) {
      let avgList = []
      for (let d of aa.slice(i, i + n)){
        avgList.push(parseFloat(stockData[d]["4. close"]))
      }
      resList.push({date: aa[i], value:this.arrAvgWheight(avgList), derivedFrom: avgList})
    }
    resList.reverse()
    return resList
  }

  // async calculateTrends(){
  //   var _this = this
  //   let gettingQoutes = 0
  //   for (let symbol of this.portfolio.getSymbols()) {
  //     console.log(symbol);
  //     // Update the AVG lists for the stockgroup
  //     let list50 = this.calculateAverage(symbol, this.shortTerm, true)
  //     let list200 = this.calculateAverage(symbol, this.longTerm, true)
  //
  //     let shortTermAverage = list50[list50.length-1].value
  //     let longTermAverage = list200[list200.length-1].value
  //
  //     if (shortTermAverage > longTermAverage) {
  //       //console.log("Trend - Percent " + (shortTermAverage.avg-longTermAverage.avg)/shortTermAverage.avg);
  //       console.log("Tred UP - BUY " + (shortTermAverage + ", " + longTermAverage));
  //     } else {
  //       //console.log("Trend - Percent " + (longTermAverage.avg-shortTermAverage.avg)/longTermAverage.avg);
  //       console.log("Tred DOWN - SELL " + (longTermAverage + ", " + shortTermAverage));
  //     }
  //     console.log(" ");
  //   }
  // }
}
