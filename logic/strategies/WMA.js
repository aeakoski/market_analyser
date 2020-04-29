const fs = require('fs')
const fetch = require('node-fetch')
const moving_averages = require('moving-averages');
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const Strategy = require("../strategy.js")

module.exports = class WMA extends Strategy{
  constructor(name, handler, shortTerm, longTerm, creationDate){
    super(name, handler, creationDate)
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
        avgList.push(parseFloat(stockData[d]["close"]))
      }
      // resList.push({date: aa[i], value:this.arrAvgWheight(avgList), derivedFrom: avgList})

      resList.push({date: aa[i], value:moving_averages.wma(avgList, avgList.length)[avgList.length-1], derivedFrom: avgList})
    }
    resList.reverse()
    return resList
  }

}
