const fs = require('fs')
const fetch = require('node-fetch')
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const Strategy = require("../strategy.js")

module.exports = class EMA extends Strategy{
  constructor(name, handler, shortTerm, longTerm){
    super(name, handler)
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
    let stockData = this.getStockData(symbol)
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

}
