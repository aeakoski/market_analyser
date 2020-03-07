const fs = require('fs')
const fetch = require('node-fetch')
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const Strategy = require("../strategy.js")

module.exports = class SMA extends Strategy{
  constructor(name, handler, shortTerm, longTerm){
    super(name, handler)
    this.shortTerm = shortTerm
    this.longTerm = longTerm
  }

  arrAvg(arr){
    let sum = 0.0
    for(let x of arr){
      sum = sum + parseFloat(x)
    }
    return sum / arr.length
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
      resList.push({date: aa[i], value:this.arrAvg(avgList), derivedFrom: avgList})
    }
    resList.reverse()
    return resList
  }

}
